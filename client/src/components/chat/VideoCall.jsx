import React, { useEffect, useRef, useState } from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff } from 'react-icons/fi';
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
  
  const { socket } = useSocket();
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const initCall = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(currentStream);
        streamRef.current = currentStream;
        
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        const peer = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        peerRef.current = peer;

        currentStream.getTracks().forEach(track => {
          peer.addTrack(track, currentStream);
        });

        peer.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
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
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer-call", { signal: answer, to: callerId });
          setIsConnecting(false);
        } else {
          const offer = await peer.createOffer();
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

    socket.on("call-accepted", async (signal) => {
      setCallAccepted(true);
      setIsConnecting(false);
      if (peerRef.current && !peerRef.current.currentRemoteDescription) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      if (peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      }
    });

    socket.on("call-ended", () => {
      endCall();
    });

    return () => {
      socket.off("call-accepted");
      socket.off("ice-candidate");
      socket.off("call-ended");
      endCall();
    };
  }, []);

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
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-6xl mx-auto flex flex-col p-4">
        
        {/* Remote Video or Error */}
        <div className="flex-1 w-full relative bg-base-300 rounded-3xl overflow-hidden shadow-2xl">
          {callError ? (
             <div className="w-full h-full flex flex-col items-center justify-center text-error bg-error/10">
               <FiVideoOff size={64} className="mb-4" />
               <h2 className="text-2xl font-bold">{callError}</h2>
               <p className="mt-2 text-base-content/70">Check browser permissions or ensure a camera/mic is connected.</p>
             </div>
          ) : callAccepted ? (
            <video playsInline ref={(node) => { if(node) node.srcObject = remoteStream }} autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white">
              <div className="avatar mb-4">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={`https://ui-avatars.com/api/?name=${calleeName}&background=random`} alt="User" />
                </div>
              </div>
              <h2 className="text-2xl font-bold animate-pulse">
                {isConnecting ? `Connecting to ${calleeName}...` : `Calling ${calleeName}...`}
              </h2>
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className="absolute top-8 right-8 w-32 md:w-48 aspect-video bg-base-200 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-10">
          <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-base-100/20 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl border border-white/10">
          <button onClick={toggleMute} className={`btn btn-circle btn-lg ${isMuted ? 'btn-error' : 'btn-ghost text-white hover:bg-white/20'}`}>
            {isMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
          </button>
          <button onClick={leaveCall} className="btn btn-error btn-circle btn-lg text-white shadow-lg shadow-error/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
          </button>
          <button onClick={toggleVideo} className={`btn btn-circle btn-lg ${isVideoOff ? 'btn-error' : 'btn-ghost text-white hover:bg-white/20'}`}>
            {isVideoOff ? <FiVideoOff size={24} /> : <FiVideo size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;

