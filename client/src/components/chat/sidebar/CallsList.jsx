import React from "react";
import {
  FiPhone,
  FiVideo,
  FiPhoneMissed,
  FiPhoneIncoming,
  FiPhoneOutgoing,
} from "react-icons/fi";

const CallsList = () => {
  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          Recent Calls
        </h2>
        <p className="text-xs text-white/50">
          Audio and video call logs will appear here
        </p>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl" />
          <div className="relative w-20 h-20 rounded-3xl glass-card flex items-center justify-center border border-white/15 text-cyan-400 shadow-2xl">
            <FiPhone size={36} />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-1.5">No recent calls</h3>
        <p className="text-sm text-white/50 max-w-xs mb-8">
          Start high-definition voice or video calls directly from any conversation.
        </p>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          <div className="glass-panel p-3 rounded-2xl flex flex-col items-center gap-2 border border-white/10 hover:border-emerald-500/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FiPhoneIncoming size={16} />
            </div>
            <span className="text-xs font-medium text-white/70">Incoming</span>
          </div>

          <div className="glass-panel p-3 rounded-2xl flex flex-col items-center gap-2 border border-white/10 hover:border-cyan-500/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FiPhoneOutgoing size={16} />
            </div>
            <span className="text-xs font-medium text-white/70">Outgoing</span>
          </div>

          <div className="glass-panel p-3 rounded-2xl flex flex-col items-center gap-2 border border-white/10 hover:border-rose-500/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <FiPhoneMissed size={16} />
            </div>
            <span className="text-xs font-medium text-white/70">Missed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallsList;
