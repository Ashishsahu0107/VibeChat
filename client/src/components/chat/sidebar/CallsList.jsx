import React, { useState } from "react";
import {
  FiPhone,
  FiPhoneMissed,
  FiPhoneIncoming,
  FiPhoneOutgoing,
  FiArrowLeft,
  FiVideo,
} from "react-icons/fi";
import toast from "react-hot-toast";

const SAMPLE_CALL_HISTORY = [
  {
    id: 1,
    name: "Rohit Verma",
    type: "outgoing",
    date: "Today, 10:24 AM",
    avatar: "https://ui-avatars.com/api/?name=Rohit+Verma&background=7c3aed&color=fff",
  },
  {
    id: 2,
    name: "Priya Sharma",
    type: "incoming",
    date: "Yesterday, 9:16 PM",
    avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=6d28d9&color=fff",
  },
  {
    id: 3,
    name: "Aman Singh",
    type: "missed",
    date: "Yesterday, 6:40 PM",
    avatar: "https://ui-avatars.com/api/?name=Aman+Singh&background=8b5cf6&color=fff",
  },
  {
    id: 4,
    name: "Neha Gupta",
    type: "incoming",
    date: "Nov 10, 5:12 PM",
    avatar: "https://ui-avatars.com/api/?name=Neha+Gupta&background=7c3aed&color=fff",
  },
];

const CallsList = ({ onBack }) => {
  const [filter, setFilter] = useState("all"); // "all" | "missed" | "outgoing"

  const filteredCalls = SAMPLE_CALL_HISTORY.filter((call) => {
    if (filter === "missed") return call.type === "missed";
    if (filter === "outgoing") return call.type === "outgoing";
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-transparent font-sans">
      {/* Header (Figma Screen 26: Call History) */}
      <div className="px-5 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <FiArrowLeft size={18} />
            </button>
          )}
          <h2 className="text-xl font-bold tracking-tight text-white">
            Call History
          </h2>
        </div>

        {/* Filter Pills: All | Missed | Outgoing (Figma Screen 26) */}
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "All" },
            { id: "missed", label: "Missed" },
            { id: "outgoing", label: "Outgoing" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-[#7C3AED] text-white shadow-md shadow-purple-600/35"
                  : "bg-white/[0.05] hover:bg-white/[0.09] text-gray-300 border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Call History List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-purple-400 mb-3">
              <FiPhone size={24} />
            </div>
            <p className="text-sm font-semibold text-gray-300">No calls found</p>
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/[0.06] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-purple-400/25">
                  <img
                    src={call.avatar}
                    alt={call.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {call.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs">
                    {call.type === "missed" ? (
                      <>
                        <FiPhoneMissed size={12} className="text-rose-400 shrink-0" />
                        <span className="text-rose-400 font-medium">Missed • {call.date}</span>
                      </>
                    ) : call.type === "incoming" ? (
                      <>
                        <FiPhoneIncoming size={12} className="text-emerald-400 shrink-0" />
                        <span className="text-gray-400 font-medium">{call.date}</span>
                      </>
                    ) : (
                      <>
                        <FiPhoneOutgoing size={12} className="text-purple-400 shrink-0" />
                        <span className="text-gray-400 font-medium">{call.date}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Call Action Button (Figma Screen 26: Purple phone icon) */}
              <button
                onClick={() => toast.success(`Calling ${call.name}...`)}
                className="w-9 h-9 rounded-full bg-[#7C3AED]/20 hover:bg-[#7C3AED] text-[#A78BFA] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#7C3AED]/40"
                title={`Call ${call.name}`}
              >
                <FiPhone size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CallsList;