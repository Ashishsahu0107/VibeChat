import React, { useEffect, useRef, useState } from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from 'react-icons/fi';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const VideoCall = ({ authUser, callerId, callerName, callerSignal, onEndCall, isReceiving, calleeId, calleeName }) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(isReceiving);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(!isReceiving);
  const [callError, setCallError] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [iceState, setIceState] = useState("new");
  
  const { socket, incomingIceCandidates } = useSocket();
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const userVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const pendingCandidates = useRef([]);

  useEffect(() => {
    const initCall = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(currentStream);
        streamRef.current = currentStream;
        
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        const iceServers = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
          { urls: 'stun:stun.services.mozilla.com' },
          { urls: 'stun:stun.cloudflare.com:3478' }
        ];

        if (import.meta.env.VITE_TURN_URL) {
          iceServers.push({
            urls: import.meta.env.VITE_TURN_URL,
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL
          });
        }

        const peer = new RTCPeerConnection({ iceServers });
        peerRef.current = peer;

        currentStream.getTracks().forEach(track => {
          peer.addTrack(track, currentStream);
        });

        peer.ontrack = (event) => {
          console.log("WebRTC: Remote track received!", event.streams[0]);
          setRemoteStream(event.streams[0]);
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = event.streams[0];
          }
        };

        peer.oniceconnectionstatechange = () => {
          console.log("ICE State:", peer.iceConnectionState);
          setIceState(peer.iceConnectionState);
        };

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              to: isReceiving ? callerId : calleeId,
              candidate: event.candidate
            });
          }
        };

        if (isReceiving) {
          await peer.setRemoteDescription(new RTCSessionDescription(callerSignal));
          
          // Drain any candidates that arrived before modal mounted
          if (incomingIceCandidates && incomingIceCandidates.length > 0) {
            for (const c of incomingIceCandidates) {
              try { await peer.addIceCandidate(new RTCIceCandidate(c)); } catch(e) {}
            }
          }
          for (const c of pendingCandidates.current) {
            try { await peer.addIceCandidate(new RTCIceCandidate(c)); } catch(e) {}
          }
          pendingCandidates.current = [];

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer-call", { signal: answer, to: callerId });
          setIsConnecting(false);
        } else {
          const offer = await peer.createOffer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true
          });
          await peer.setLocalDescription(offer);
          socket.emit("call-user", {  
            userToCall: calleeId,
            signalData: offer,
            from: authUser._id,
            name: authUser.fullName,
            isVideoCall: true
          });
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setCallError("Camera or Microphone access denied/unavailable.");
        toast.error("Permissions denied. Check your camera/mic.");
      }
    };

    initCall();

    const handleCallAccepted = async (signal) => {
      setCallAccepted(true);
      setIsConnecting(false);
      if (peerRef.current && !peerRef.current.currentRemoteDescription) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        
        // Drain buffered candidates received from the Callee
        for (const c of pendingCandidates.current) {
          try { await peerRef.current.addIceCandidate(new RTCIceCandidate(c)); } catch(e) {}
        }
        pendingCandidates.current = [];
      }
    };

    const handleIceCandidate = async (candidate) => {
      if (peerRef.current) {
        if (peerRef.current.remoteDescription) {
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error("Error adding received ice candidate", e);
          }
        } else {
          pendingCandidates.current.push(candidate);
        }
      }
    };

    const handleCallEnded = () => {
      endCall();
    };

    socket.on("call-accepted", handleCallAccepted);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("call-accepted", handleCallAccepted);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
      endCall();
    };
  }, []);

  // Safely attach stream to video element when it mounts
  useEffect(() => {
    if (remoteVideo.current && remoteStream) {
      remoteVideo.current.srcObject = remoteStream;
      const playPromise = remoteVideo.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.warn("Autoplay policy prevented auto-start:", e));
      }
    }
  }, [remoteStream, callAccepted]);

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    onEndCall();
  };

  const leaveCall = () => {
    socket.emit("end-call", { to: isReceiving ? callerId : calleeId });
    endCall();
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 flex items-center justify-center overflow-hidden select-none">
      <div className="relative w-full h-[100dvh] md:max-w-6xl md:h-[90vh] md:p-4 flex flex-col">
        
        {/* Remote Video or Status Screen */}
        <div className="flex-1 w-full h-full relative bg-neutral-900 md:rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
          {callError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-error bg-error/10 p-6 text-center">
              <FiVideoOff className="w-16 h-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold">{callError}</h2>
              <p className="mt-2 text-sm sm:text-base text-base-content/70 max-w-sm">
                Check browser permissions or ensure a camera/mic is connected.
              </p>
            </div>
          ) : callAccepted ? (
            <>
              <video playsInline ref={remoteVideo} autoPlay className="w-full h-full object-cover" />
              {iceState !== "connected" && iceState !== "completed" && (
                <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-mono border border-white/10 flex items-center gap-2 shadow-lg">
                  <span className={`w-2 h-2 rounded-full ${iceState === "failed" || iceState === "disconnected" ? "bg-error animate-ping" : "bg-warning animate-pulse"}`} />
                  Network: {iceState}...
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center">
              <div className="avatar mb-6">
                <div className="w-24 sm:w-32 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-neutral-900 shadow-2xl shadow-primary/30 animate-pulse">
                  <img src={`https://ui-avatars.com/api/?name=${calleeName}&background=random`} alt="User" />
                </div>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight mb-2">
                {calleeName}
              </h2>
              <p className="text-sm sm:text-base text-white/70 animate-pulse font-medium">
                {isConnecting ? `Connecting to ${calleeName}...` : `Calling ${calleeName}...`}
              </p>
            </div>
          )}
        </div>

        {/* Local Video (Floating Picture-in-Picture) */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-24 sm:w-36 md:w-44 aspect-[3/4] sm:aspect-video bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 backdrop-blur-sm z-20 transition-all duration-200">
          <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 sm:gap-6 bg-black/50 backdrop-blur-xl px-5 sm:px-8 py-3 sm:py-4 rounded-full shadow-2xl border border-white/15 max-w-[95vw]">
          <button 
            onClick={toggleMute} 
            className={`btn btn-circle w-12 h-12 sm:w-14 sm:h-14 transition-all duration-200 border-none ${isMuted ? 'bg-error text-white shadow-lg shadow-error/40 hover:bg-error/90' : 'bg-white/15 text-white hover:bg-white/25'}`}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? <FiMicOff className="text-xl sm:text-2xl" /> : <FiMic className="text-xl sm:text-2xl" />}
          </button>

          <button 
            onClick={leaveCall} 
            className="btn btn-circle w-14 h-14 sm:w-16 sm:h-16 bg-error hover:bg-error/90 text-white shadow-xl shadow-error/50 hover:scale-105 active:scale-95 transition-all duration-200 border-none"
            title="End Call"
          >
            <FiPhoneOff className="text-2xl sm:text-3xl" />
          </button>

          <button 
            onClick={toggleVideo} 
            className={`btn btn-circle w-12 h-12 sm:w-14 sm:h-14 transition-all duration-200 border-none ${isVideoOff ? 'bg-error text-white shadow-lg shadow-error/40 hover:bg-error/90' : 'bg-white/15 text-white hover:bg-white/25'}`}
            title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
          >
            {isVideoOff ? <FiVideoOff className="text-xl sm:text-2xl" /> : <FiVideo className="text-xl sm:text-2xl" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;

