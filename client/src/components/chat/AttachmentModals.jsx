import React, { useState } from "react";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiBellOff,
  FiClock as FiDisappearClock,
  FiShare2,
  FiAlertTriangle,
  FiDownload,
  FiShield,
  FiRadio,
} from "react-icons/fi";
import { IoBarChart, IoCalendar, IoPerson, IoLocation } from "react-icons/io5";
import toast from "react-hot-toast";

// ── Screen 55: Create Poll Modal ─────────────────────────────────────────────
export const PollModal = ({ isOpen, onClose, onSendPoll }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 8) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (val, index) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (validOptions.length < 2) return;

    let pollText = `📊 *Poll: ${question.trim()}*\n`;
    validOptions.forEach((opt, idx) => {
      const numEmoji =
        ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"][idx] || "▫️";
      pollText += `\n${numEmoji} ${opt}`;
    });
    if (allowMultiple) {
      pollText += `\n\n_(Multiple answers allowed)_`;
    }

    onSendPoll(pollText);
    setQuestion("");
    setOptions(["", "", ""]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans text-white">
      <div className="w-full max-w-sm rounded-[32px] bg-[#12111A] border border-white/10 overflow-hidden shadow-2xl shadow-purple-950/60 animate-in zoom-in-95 duration-200">
        {/* Header (Figma Screen 55) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#161522]">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/[0.08] rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <FiArrowLeft size={18} />
            </button>
            <h3 className="font-bold text-base text-white">Create Poll</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/[0.08] rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">
              Question
            </label>
            <input
              type="text"
              autoFocus
              required
              placeholder="What should we do?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-gray-500 text-xs focus:outline-none focus:border-[#7C3AED]"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">
              Options
            </label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-gray-500 shrink-0" />
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-gray-500 text-xs focus:outline-none focus:border-[#7C3AED]"
                    value={opt}
                    onChange={(e) => handleOptionChange(e.target.value, idx)}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors cursor-pointer"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 8 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-3 text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer"
              >
                <FiPlus size={14} /> Add Option
              </button>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer py-1 select-none">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="accent-[#7C3AED] w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-gray-300">Allow multiple answers</span>
          </label>

          <button
            type="submit"
            disabled={!question.trim() || options.filter((o) => o.trim()).length < 2}
            className="w-full py-3 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm mt-2"
          >
            Create Poll
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Screen 53: Share Contact Modal ──────────────────────────────────────────
export const ContactModal = ({
  isOpen,
  onClose,
  onSendContact,
  contacts = [],
}) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const sampleContacts = contacts.length > 0 ? contacts : [
    { _id: "1", fullName: "Rohit Verma", phone: "+91 98765 43210" },
    { _id: "2", fullName: "Priya Sharma", phone: "+91 87654 32109" },
    { _id: "3", fullName: "Aman Singh", phone: "+91 91234 56789" },
  ];

  const filtered = sampleContacts.filter((c) =>
    (c.fullName || "").toLowerCase().includes(search.toLowerCase()),
  );

  const toggleSelect = (c) => {
    setSelectedContacts((prev) =>
      prev.find((x) => x._id === c._id)
        ? prev.filter((x) => x._id !== c._id)
        : [...prev, c],
    );
  };

  const handleSend = () => {
    if (selectedContacts.length === 0) return;
    selectedContacts.forEach((c) => {
      onSendContact(`👤 *Contact Card*\n📌 *Name:* ${c.fullName}\n📞 *Phone:* ${c.phone || "N/A"}`);
    });
    setSelectedContacts([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans text-white">
      <div className="w-full max-w-sm rounded-[32px] bg-[#12111A] border border-white/10 overflow-hidden shadow-2xl shadow-purple-950/60 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#161522]">
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="p-1 hover:bg-white/[0.08] rounded-full text-gray-300">
              <FiArrowLeft size={18} />
            </button>
            <h3 className="font-bold text-base text-white">Share Contact</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <input
            type="text"
            placeholder="Search contact..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-gray-500 text-xs focus:outline-none focus:border-[#7C3AED]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {filtered.map((c) => {
              const isSelected = selectedContacts.some((x) => x._id === c._id);
              return (
                <div
                  key={c._id}
                  onClick={() => toggleSelect(c)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-colors ${
                    isSelected ? "bg-[#7C3AED]/20 border border-[#7C3AED]/40" : "hover:bg-white/[0.05] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-950 border border-purple-500/30">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=7c3aed&color=fff`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{c.fullName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{c.phone || "No phone"}</div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      isSelected ? "bg-[#7C3AED] text-white" : "border border-gray-600 bg-white/[0.04]"
                    }`}
                  >
                    {isSelected && <FiCheck size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSend}
            disabled={selectedContacts.length === 0}
            className="w-full py-3 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
          >
            Share ({selectedContacts.length})
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Screen 54: Location Sharing Modal ────────────────────────────────────────
export const LocationModal = ({ isOpen, onClose, onSendLocation }) => {
  const [mode, setMode] = useState("live"); // "live" or "current"

  if (!isOpen) return null;

  const handleSend = () => {
    const locText = mode === "live"
      ? "📍 *Live Location Sharing*\nLat: 28.6139° N, Lon: 77.2090° E\n_(Updated in real-time for 60 mins)_"
      : "📍 *Current Location*\nLat: 28.6139° N, Lon: 77.2090° E\nhttps://maps.google.com/?q=28.6139,77.2090";
    onSendLocation(locText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans text-white">
      <div className="w-full max-w-sm rounded-[32px] bg-[#12111A] border border-white/10 overflow-hidden shadow-2xl shadow-purple-950/60 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#161522]">
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="p-1 hover:bg-white/[0.08] rounded-full text-gray-300">
              <FiArrowLeft size={18} />
            </button>
            <h3 className="font-bold text-base text-white">Share Location</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Map Preview Graphic (Screen 54) */}
          <div className="w-full h-36 rounded-2xl overflow-hidden relative border border-white/15 bg-gradient-to-tr from-emerald-950/40 via-purple-950/30 to-blue-950/40 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
            <div className="relative flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-lg shadow-purple-600/40 animate-bounce">
                <FiMapPin size={20} />
              </div>
              <span className="text-[10px] font-semibold text-purple-300 mt-1 bg-black/60 px-2 py-0.5 rounded-full">
                Connaught Place, New Delhi
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div
              onClick={() => setMode("live")}
              className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-colors ${
                mode === "live" ? "bg-[#7C3AED]/15 border-[#7C3AED]/40" : "bg-white/[0.04] border-white/10"
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-white">Share Live Location</div>
                <div className="text-[10px] text-gray-400">Update in real-time</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === "live" ? "border-[#7C3AED] bg-[#7C3AED]" : "border-gray-500"
              }`}>
                {mode === "live" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>

            <div
              onClick={() => setMode("current")}
              className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-colors ${
                mode === "current" ? "bg-[#7C3AED]/15 border-[#7C3AED]/40" : "bg-white/[0.04] border-white/10"
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-white">Share Current Location</div>
                <div className="text-[10px] text-gray-400">Send your current location</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === "current" ? "border-[#7C3AED] bg-[#7C3AED]" : "border-gray-500"
              }`}>
                {mode === "current" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          </div>

          <button
            onClick={handleSend}
            className="w-full py-3 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all cursor-pointer text-xs sm:text-sm"
          >
            Send Location
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Screen 50: Mute & Unmute Modal ──────────────────────────────────────────
export const MuteModal = ({ isOpen, onClose, onMute }) => {
  const [duration, setDuration] = useState("8 Hours");
  const [showNotifications, setShowNotifications] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onMute({ duration, showNotifications });
    toast.success(`Notifications muted for ${duration}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans text-white">
      <div className="w-full max-w-sm rounded-[32px] bg-[#12111A] border border-white/10 overflow-hidden shadow-2xl p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#1E1B2E] border border-purple-500/30 text-[#A78BFA] flex items-center justify-center mx-auto">
          <FiBellOff size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">Mute Notifications</h3>
          <p className="text-xs text-gray-400 mt-0.5">Other participants will not see that you muted this chat.</p>
        </div>

        <div className="space-y-2 text-left">
          {["8 Hours", "1 Week", "Always"].map((d) => (
            <div
              key={d}
              onClick={() => setDuration(d)}
              className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border ${
                duration === d ? "bg-[#7C3AED]/20 border-[#7C3AED]/40" : "bg-white/[0.03] border-white/10"
              }`}
            >
              <span className="text-xs font-semibold">{d}</span>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                duration === d ? "border-[#7C3AED] bg-[#7C3AED]" : "border-gray-500"
              }`}>
                {duration === d && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all cursor-pointer text-xs sm:text-sm"
        >
          Mute
        </button>
      </div>
    </div>
  );
};

// ── Screen 51: Disappearing Messages Modal ──────────────────────────────────
export const DisappearingMessagesModal = ({ isOpen, onClose, onSave }) => {
  const [timer, setTimer] = useState("Off");

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(timer);
    toast.success(`Disappearing messages set to: ${timer}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans text-white">
      <div className="w-full max-w-sm rounded-[32px] bg-[#12111A] border border-white/10 overflow-hidden shadow-2xl p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#1E1B2E] border border-purple-500/30 text-[#A78BFA] flex items-center justify-center mx-auto">
          <FiClock size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">Disappearing Messages</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Messages will automatically disappear after the selected time.
          </p>
        </div>

        <div className="space-y-2 text-left">
          {["Off", "24 Hours", "7 Days", "90 Days"].map((t) => (
            <div
              key={t}
              onClick={() => setTimer(t)}
              className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border ${
                timer === t ? "bg-[#7C3AED]/20 border-[#7C3AED]/40" : "bg-white/[0.03] border-white/10"
              }`}
            >
              <span className="text-xs font-semibold">{t}</span>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                timer === t ? "border-[#7C3AED] bg-[#7C3AED]" : "border-gray-500"
              }`}>
                {timer === t && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all cursor-pointer text-xs sm:text-sm"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// ── Screen 58: Export Chat Modal ────────────────────────────────────────────
export const ExportChatModal = ({ isOpen, onClose, onExport }) => {
  const [includeMedia, setIncludeMedia] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(includeMedia);
    toast.success(includeMedia ? "Exporting chat with media..." : "Exporting chat without media...");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans text-white">
      <div className="w-full max-w-sm rounded-[32px] bg-[#12111A] border border-white/10 overflow-hidden shadow-2xl p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#1E1B2E] border border-purple-500/30 text-[#A78BFA] flex items-center justify-center mx-auto">
          <FiDownload size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">Export Chat</h3>
          <p className="text-xs text-gray-400 mt-0.5">Export this chat with or without media files.</p>
        </div>

        <div className="space-y-2 text-left">
          <div
            onClick={() => setIncludeMedia(false)}
            className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border ${
              !includeMedia ? "bg-[#7C3AED]/20 border-[#7C3AED]/40" : "bg-white/[0.03] border-white/10"
            }`}
          >
            <div>
              <div className="text-xs font-semibold">Without Media</div>
              <div className="text-[10px] text-gray-400">Text only (.txt archive)</div>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              !includeMedia ? "border-[#7C3AED] bg-[#7C3AED]" : "border-gray-500"
            }`}>
              {!includeMedia && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </div>

          <div
            onClick={() => setIncludeMedia(true)}
            className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border ${
              includeMedia ? "bg-[#7C3AED]/20 border-[#7C3AED]/40" : "bg-white/[0.03] border-white/10"
            }`}
          >
            <div>
              <div className="text-xs font-semibold">With Media</div>
              <div className="text-[10px] text-gray-400">Includes photos, videos, files (.zip)</div>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              includeMedia ? "border-[#7C3AED] bg-[#7C3AED]" : "border-gray-500"
            }`}>
              {includeMedia && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="w-full py-3 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all cursor-pointer text-xs sm:text-sm"
        >
          Export
        </button>
      </div>
    </div>
  );
};

// ── Screen 59: Clear Chat Modal ─────────────────────────────────────────────
export const ClearChatModal = ({ isOpen, onClose, onClear }) => {
  const [deleteMedia, setDeleteMedia] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans text-white">
      <div className="w-full max-w-sm rounded-[32px] bg-[#12111A] border border-white/10 overflow-hidden shadow-2xl p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <FiTrash2 size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">Clear Chat</h3>
          <p className="text-xs text-gray-400 mt-0.5">This will delete all messages from this chat.</p>
        </div>

        <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 cursor-pointer select-none text-left">
          <input
            type="checkbox"
            checked={deleteMedia}
            onChange={(e) => setDeleteMedia(e.target.checked)}
            className="accent-[#7C3AED] w-4 h-4 cursor-pointer"
          />
          <span className="text-xs text-gray-300">Also delete media from this chat</span>
        </label>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full font-semibold text-xs text-gray-300 bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClear(deleteMedia);
              onClose();
            }}
            className="flex-1 py-3 rounded-full font-bold text-xs text-white bg-[#EF4444] hover:bg-[#DC2626] shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            Clear Chat
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Screen 60: Report & Block Modal ─────────────────────────────────────────
export const ReportBlockModal = ({ isOpen, onClose, userName, onAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans text-white">
      <div className="w-full max-w-sm rounded-[32px] bg-[#12111A] border border-white/10 overflow-hidden shadow-2xl p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <FiShield size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">Report & Block</h3>
          <p className="text-xs text-gray-400 mt-0.5">Manage interactions with {userName || "this user"}.</p>
        </div>

        <div className="space-y-2 text-left text-xs font-semibold">
          <button
            onClick={() => {
              onAction && onAction("report");
              toast.success("User reported for investigation");
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer text-left"
          >
            <div className="text-white">Report</div>
            <div className="text-[10px] text-gray-400 font-normal">Report this user for inappropriate content.</div>
          </button>

          <button
            onClick={() => {
              onAction && onAction("block");
              toast.success("User blocked");
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer text-left text-rose-400"
          >
            <div>Block</div>
            <div className="text-[10px] text-gray-400 font-normal">You won't receive messages or calls from this user.</div>
          </button>

          <button
            onClick={() => {
              onAction && onAction("report_block");
              toast.success("User reported and blocked");
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 transition-colors cursor-pointer text-left text-rose-300"
          >
            <div>Report & Block</div>
            <div className="text-[10px] text-rose-200/70 font-normal">Report and block this user simultaneously.</div>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Screen 52: Message Info Modal ───────────────────────────────────────────
export const MessageInfoModal = ({ isOpen, onClose, message }) => {
  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans text-white">
      <div className="w-full max-w-sm rounded-[32px] bg-[#12111A] border border-white/10 overflow-hidden shadow-2xl p-6 text-center space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="font-bold text-base text-white">Message Info</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white">
            <FiX size={18} />
          </button>
        </div>

        {/* Message bubble preview */}
        <div className="p-3 rounded-2xl bg-[#7C3AED] text-white text-xs text-left">
          {message.content || "Attachment"}
        </div>

        {/* Timestamps */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-3 space-y-2.5 text-left text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <FiCheck className="text-gray-400" />
              <span>Sent</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <FiCheckCircle className="text-purple-400" />
              <span>Delivered</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <FiCheckCircle className="text-emerald-400" />
              <span>Read</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-full font-bold text-xs text-white bg-white/10 hover:bg-white/20 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// ── Screen Event Modal ──────────────────────────────────────────────────────
export const EventModal = ({ isOpen, onClose, onSendEvent }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    let eventText = `📅 *Event: ${title.trim()}*\n🗓️ *Date:* ${date}${time ? ` at ${time}` : ""}`;
    if (location.trim()) eventText += `\n📍 *Location:* ${location.trim()}`;
    onSendEvent(eventText);
    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans text-white">
      <div className="w-full max-w-sm rounded-[32px] bg-[#12111A] border border-white/10 overflow-hidden shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="font-bold text-base text-white">Create an Event</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white">
            <FiX size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Event Title"
            className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            required
            className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location"
            className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-full font-bold text-xs text-white bg-[#7C3AED] hover:bg-[#6D28D9] transition-all cursor-pointer mt-2"
          >
            Send Event
          </button>
        </form>
      </div>
    </div>
  );
};