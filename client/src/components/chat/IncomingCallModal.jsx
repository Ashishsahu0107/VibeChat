import React, { useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { FiPhone, FiVideo, FiPhoneOff } from "react-icons/fi";
import AudioCall from "./AudioCall";
import VideoCall from "./VideoCall";
import useAuthStore from "../../store/useAuthStore";

const IncomingCallModal = () => {
  const {
    receivingCall,
    callerName,
    callerId,
    callerSignal,
    isVideoCall,
    clearCall,
    socket,
  } = useSocket();
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
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="relative overflow-hidden glass-card p-8 rounded-3xl shadow-2xl border border-white/20 flex flex-col items-center max-w-[340px] sm:max-w-sm w-full mx-auto shadow-blue-950/60 animate-in zoom-in-95 duration-200">
        {/* Background Glowing Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse -z-10"></div>

        {/* Caller Avatar with Ripple Effect */}
        <div className="relative mb-6 z-10">
          <div className="absolute -inset-2 rounded-full border-2 border-cyan-400/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="absolute -inset-4 rounded-full border border-purple-500/20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 shadow-xl shadow-cyan-500/20">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(callerName || "U")}&background=7c3aed&color=fff`}
                alt="Caller"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Caller Info */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 tracking-tight z-10 text-center truncate max-w-full px-2">
          {callerName}
        </h2>

        <div className="flex items-center gap-2 text-cyan-300 mb-8 z-10 font-medium text-xs sm:text-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
          </span>
          <p>
            Incoming {isVideoCall ? "Video" : "Voice"} Call…
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8 w-full z-10">
          <button
            onClick={handleReject}
            className="flex flex-col items-center gap-2 group focus:outline-none cursor-pointer"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20">
              <FiPhoneOff className="text-2xl" />
            </div>
            <span className="text-xs font-semibold text-slate-300 group-hover:text-rose-400 transition-colors">
              Decline
            </span>
          </button>

          <button
            onClick={handleAccept}
            className="flex flex-col items-center gap-2 group focus:outline-none cursor-pointer"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20 animate-bounce">
              {isVideoCall ? (
                <FiVideo className="text-2xl" />
              ) : (
                <FiPhone className="text-2xl" />
              )}
            </div>
            <span className="text-xs font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">
              Accept
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
