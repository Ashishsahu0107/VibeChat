import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { FiPhone, FiVideo, FiPhoneOff } from 'react-icons/fi';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 select-none">
      <div className="relative overflow-hidden bg-base-100/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/15 flex flex-col items-center max-w-[340px] sm:max-w-sm w-full mx-auto">
        
        {/* Background Glowing Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse -z-10"></div>

        {/* Caller Avatar with Ripple Effect */}
        <div className="relative mb-5 sm:mb-6 z-10">
          <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="avatar">
            <div className="w-24 sm:w-28 rounded-full ring-4 ring-primary ring-offset-base-100 ring-offset-4 shadow-xl">
              <img src={`https://ui-avatars.com/api/?name=${callerName}&background=random`} alt="Caller" />
            </div>
          </div>
        </div>

        {/* Caller Info */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content mb-1.5 tracking-tight z-10 text-center truncate max-w-full px-2">
          {callerName}
        </h2>
        
        <div className="flex items-center gap-2 text-base-content/70 mb-8 sm:mb-10 z-10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
          </span>
          <p className="text-xs sm:text-sm font-medium">
            Incoming {isVideoCall ? "Video" : "Audio"} Call...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8 sm:gap-10 w-full z-10">
          <button 
            onClick={handleReject} 
            className="flex flex-col items-center gap-1.5 group focus:outline-none"
          >
            <div className="btn btn-error btn-circle w-14 h-14 sm:w-16 sm:h-16 text-white shadow-lg shadow-error/40 hover:scale-110 active:scale-95 transition-all duration-200 border-none">
              <FiPhoneOff className="text-2xl sm:text-3xl" />
            </div>
            <span className="text-xs font-semibold text-base-content/80 group-hover:text-error transition-colors">Decline</span>
          </button>

          <button 
            onClick={handleAccept} 
            className="flex flex-col items-center gap-1.5 group focus:outline-none"
          >
            <div className="btn btn-success btn-circle w-14 h-14 sm:w-16 sm:h-16 text-white shadow-lg shadow-success/40 hover:scale-110 active:scale-95 transition-all duration-200 animate-bounce border-none">
              {isVideoCall ? <FiVideo className="text-2xl sm:text-3xl" /> : <FiPhone className="text-2xl sm:text-3xl" />}
            </div>
            <span className="text-xs font-semibold text-base-content/80 group-hover:text-success transition-colors">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
