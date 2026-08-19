import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { FiPhone, FiVideo, FiX } from 'react-icons/fi';
import AudioCall from './AudioCall';
import VideoCall from './VideoCall';
import useAuthStore from '../../store/useAuthStore';

const IncomingCallModal = () => {
  const { receivingCall, callerName, callerId, callerSignal, isVideoCall, clearCall, socket } = useSocket();
  const { authUser } = useAuthStore();
  const [callAccepted, setCallAccepted] = useState(false);

  if (!receivingCall || !authUser) return null;

  const handleAccept = () => {
    setCallAccepted(true);
  };

  const handleReject = () => {
    socket?.emit("end-call", { to: callerId });
    clearCall();
  };

  const handleEndCall = () => {
    socket?.emit("end-call", { to: callerId });
    setCallAccepted(false);
    clearCall();
  };

  if (callAccepted) {
    return isVideoCall ? (
      <VideoCall 
        authUser={authUser} 
        callerId={callerId} 
        callerName={callerName} 
        callerSignal={callerSignal} 
        onEndCall={handleEndCall}
        isReceiving={true}
      />
    ) : (
      <AudioCall 
        authUser={authUser} 
        callerId={callerId} 
        callerName={callerName} 
        callerSignal={callerSignal} 
        onEndCall={handleEndCall}
        isReceiving={true}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-base-100 p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-bounce">
        <div className="avatar mb-6">
          <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 animate-pulse">
            <img src={`https://ui-avatars.com/api/?name=${callerName}&background=random`} alt="Caller" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">{callerName}</h2>
        <p className="text-base-content/70 mb-8">
          Incoming {isVideoCall ? "Video" : "Audio"} Call...
        </p>
        <div className="flex gap-6">
          <button 
            onClick={handleReject} 
            className="btn btn-error btn-circle btn-lg text-white shadow-lg shadow-error/50"
          >
            <FiX size={28} />
          </button>
          <button 
            onClick={handleAccept} 
            className="btn btn-success btn-circle btn-lg text-white shadow-lg shadow-success/50"
          >
            {isVideoCall ? <FiVideo size={28} /> : <FiPhone size={28} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
