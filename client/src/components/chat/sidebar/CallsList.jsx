import React from 'react';
import { FiPhone, FiVideo, FiPhoneMissed, FiPhoneIncoming, FiPhoneOutgoing } from 'react-icons/fi';

const CallsList = () => {
  return (
    <div className="flex flex-col h-full bg-base-100">
      <div className="px-4 py-3 border-b border-base-300 shrink-0">
        <h2 className="text-xl font-bold mb-1">Recent Calls</h2>
        <p className="text-xs text-base-content/50">Call history will appear here</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-base-content/30 py-16">
        <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mb-4">
          <FiPhone size={36} className="opacity-30" />
        </div>
        <p className="font-medium">No recent calls</p>
        <p className="text-sm mt-1">Start a call from any chat</p>
        <div className="flex gap-6 mt-8 opacity-30">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <FiPhoneIncoming size={18} className="text-success" />
            </div>
            <span className="text-xs">Incoming</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <FiPhoneOutgoing size={18} className="text-primary" />
            </div>
            <span className="text-xs">Outgoing</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
              <FiPhoneMissed size={18} className="text-error" />
            </div>
            <span className="text-xs">Missed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallsList;
