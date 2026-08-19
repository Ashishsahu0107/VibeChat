import React, { useEffect, useRef, useState } from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi';
import Peer from 'simple-peer/simplepeer.min.js';
import { useSocket } from '../../context/SocketContext';

const AudioCall = ({ authUser, callerId, callerName, callerSignal, onEndCall, isReceiving, calleeId, calleeName }) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(isReceiving);
  const [isMuted, setIsMuted] = useState(false);
  
  const { socket } = useSocket();
  const userAudio = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((currentStream) => {
      setStream(currentStream);
      
      if (isReceiving) {
        // Answer Call
        const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });
        peer.on("signal", (data) => {
          socket.emit("answer-call", { signal: data, to: callerId });
        });
        peer.on("stream", (userStream) => {
          if (userAudio.current) userAudio.current.srcObject = userStream;
        });
        peer.signal(callerSignal);
        connectionRef.current = peer;
      } else {
        // Initiate Call
        const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });
        peer.on("signal", (data) => {
          socket.emit("call-user", {
            userToCall: calleeId,
            signalData: data,
            from: authUser._id,
            name: authUser.fullName,
            isVideoCall: false
          });
        });
        peer.on("stream", (userStream) => {
          if (userAudio.current) userAudio.current.srcObject = userStream;
        });
        socket.on("call-accepted", (signal) => {
          setCallAccepted(true);
          peer.signal(signal);
        });
        connectionRef.current = peer;
      }
    }).catch(err => {
      console.error(err);
      alert("Failed to access microphone.");
      onEndCall();
    });

    socket.on("call-ended", () => {
      endCall();
    });

    return () => {
      endCall();
    };
  }, []);

  const endCall = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (connectionRef.current) connectionRef.current.destroy();
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
        <div className={`avatar mb-8 ${callAccepted ? 'animate-pulse' : 'animate-bounce'}`}>
          <div className="w-40 rounded-full ring-4 ring-primary ring-offset-base-200 ring-offset-4 shadow-2xl shadow-primary/30">
            <img src={`https://ui-avatars.com/api/?name=${displayName}&background=random`} alt="User" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-base-content mb-2">{displayName}</h2>
        <p className="text-xl text-base-content/60">
          {callAccepted ? '00:00 - Audio Call' : 'Ringing...'}
        </p>
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
