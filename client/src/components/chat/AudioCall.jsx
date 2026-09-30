import React, { useEffect, useRef, useState } from 'react';
import { FiMic, FiMicOff, FiPhoneOff } from 'react-icons/fi';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const AudioCall = ({ authUser, callerId, callerName, callerSignal, onEndCall, isReceiving, calleeId, calleeName }) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(isReceiving);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(!isReceiving);
  const [callDuration, setCallDuration] = useState(0);
  const [callError, setCallError] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  const { socket, incomingIceCandidates } = useSocket();
  const userAudio = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const pendingCandidates = useRef([]);

  useEffect(() => {
    const initCall = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        setStream(currentStream);
        streamRef.current = currentStream;

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
          setRemoteStream(event.streams[0]);
          if (userAudio.current) {
            userAudio.current.srcObject = event.streams[0];
          }
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
          startTimer();
        } else {
          const offer = await peer.createOffer({
            offerToReceiveVideo: false,
            offerToReceiveAudio: true
          });
          await peer.setLocalDescription(offer);
          socket.emit("call-user", {
            userToCall: calleeId,
            signalData: offer,
            from: authUser._id,
            name: authUser.fullName,
            isVideoCall: false
          });
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setCallError("Microphone access denied or unavailable.");
        toast.error("Could not start call. Please check microphone permissions.");
      }
    };

    initCall();

    const handleCallAccepted = async (signal) => {
      setCallAccepted(true);
      setIsConnecting(false);
      startTimer();
      if (peerRef.current && !peerRef.current.currentRemoteDescription) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        
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

  useEffect(() => {
    if (userAudio.current && remoteStream) {
      userAudio.current.srcObject = remoteStream;
      const playPromise = userAudio.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.warn("Audio autoplay policy prevented auto-start:", e));
      }
    }
  }, [remoteStream, callAccepted]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
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

  const displayName = isReceiving ? callerName : calleeName;

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden h-[100dvh]">
      <audio ref={userAudio} autoPlay />
      
      {/* Top Header / Status pill */}
      <div className="w-full flex justify-center pt-2 sm:pt-4">
        <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-white/80 border border-white/10 shadow-lg">
          Voice Call
        </div>
      </div>

      {/* Center Caller Info & Avatar */}
      <div className="flex flex-col items-center justify-center my-auto text-center px-4 w-full max-w-sm">
        {callError ? (
          <div className="text-error bg-error/10 p-6 rounded-2xl w-full border border-error/20">
            <h2 className="text-lg sm:text-xl font-bold mb-2">{callError}</h2>
            <p className="text-sm text-base-content/80">
              Please allow microphone permissions in your browser settings to make audio calls.
            </p>
          </div>
        ) : (
          <>
            <div className="relative mb-6 sm:mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div className="avatar">
                <div className="w-28 sm:w-36 md:w-40 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-neutral-950 shadow-2xl shadow-primary/30">
                  <img src={`https://ui-avatars.com/api/?name=${displayName}&background=random`} alt="User" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 truncate max-w-full">
              {displayName}
            </h2>

            <p className="text-sm sm:text-base font-mono text-white/70">
              {callAccepted 
                ? formatDuration(callDuration) 
                : (isConnecting ? 'Connecting...' : 'Ringing...')}
            </p>
          </>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center gap-6 sm:gap-8 bg-black/50 backdrop-blur-xl px-6 sm:px-10 py-3 sm:py-4 rounded-full shadow-2xl border border-white/15 mb-4 sm:mb-8">
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
      </div>
    </div>
  );
};

export default AudioCall;

