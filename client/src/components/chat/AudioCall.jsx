import React, { useEffect, useRef, useState } from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi';
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
  
  const { socket } = useSocket();
  const userAudio = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const initCall = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        setStream(currentStream);
        streamRef.current = currentStream;

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
          startTimer();
        } else {
          const offer = await peer.createOffer();
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

    socket.on("call-accepted", async (signal) => {
      setCallAccepted(true);
      setIsConnecting(false);
      startTimer();
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
    <div className="fixed inset-0 z-[100] bg-base-200/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <audio ref={userAudio} autoPlay />
      
      <div className="text-center mb-16">
        {callError ? (
          <div className="text-error bg-error/10 p-6 rounded-2xl max-w-md border border-error/20">
            <h2 className="text-2xl font-bold mb-2">{callError}</h2>
            <p className="text-base-content/80">
              Please allow microphone permissions in your browser settings to make audio calls.
            </p>
          </div>
        ) : (
          <>
            <div className={`avatar mb-8 ${callAccepted ? 'animate-pulse' : 'animate-bounce'}`}>
              <div className="w-40 rounded-full ring-4 ring-primary ring-offset-base-200 ring-offset-4 shadow-2xl shadow-primary/30">
                <img src={`https://ui-avatars.com/api/?name=${displayName}&background=random`} alt="User" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-base-content mb-2">{displayName}</h2>
            <p className="text-xl text-base-content/60">
              {callAccepted 
                ? formatDuration(callDuration) 
                : (isConnecting ? 'Connecting...' : 'Ringing...')}
            </p>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8 bg-base-100 px-10 py-5 rounded-full shadow-2xl border border-base-300">
        <button onClick={toggleMute} className={`btn btn-circle btn-lg ${isMuted ? 'btn-error' : 'btn-ghost'}`}>
          {isMuted ? <FiMicOff size={28} /> : <FiMic size={28} />}
        </button>
        <button onClick={leaveCall} className="btn btn-error btn-circle btn-lg text-white shadow-lg shadow-error/50 w-20 h-20">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
        </button>
      </div>
    </div>
  );
};

export default AudioCall;

