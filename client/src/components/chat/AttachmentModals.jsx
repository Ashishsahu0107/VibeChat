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
} from "react-icons/fi";
import { IoBarChart, IoCalendar, IoPerson } from "react-icons/io5";

// ── Poll Modal ──────────────────────────────────────────────────────────────
export const PollModal = ({ isOpen, onClose, onSendPoll }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
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
    setOptions(["", ""]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-card max-w-md w-full border border-white/20 overflow-hidden shadow-2xl shadow-blue-950/50 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0a0f1d]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <IoBarChart size={18} />
            </div>
            <h3 className="font-bold text-base text-white">Create a Poll</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/[0.08] rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 max-h-[75vh] overflow-y-auto"
        >
          <div>
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block mb-1.5">
              Question
            </label>
            <input
              type="text"
              autoFocus
              required
              placeholder="Ask a question..."
              className="glass-input text-xs w-full px-3.5 py-2.5"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block mb-1.5">
              Options
            </label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    className="glass-input text-xs flex-1 px-3 py-2"
                    value={opt}
                    onChange={(e) => handleOptionChange(e.target.value, idx)}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-rose-400 hover:bg-rose-500/15 rounded-xl transition-colors cursor-pointer"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 8 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer"
              >
                <FiPlus size={14} /> Add option
              </button>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer py-1 select-none">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="accent-cyan-400 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-slate-300 font-medium">Allow participants to select multiple answers</span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn-glass px-4 py-2 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !question.trim() || options.filter((o) => o.trim()).length < 2
              }
              className="btn-glow px-5 py-2 text-xs font-semibold"
            >
              Send Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Contact Modal ───────────────────────────────────────────────────────────
export const ContactModal = ({
  isOpen,
  onClose,
  onSendContact,
  contacts = [],
}) => {
  const [tab, setTab] = useState("select"); // "select" or "manual"
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredContacts = contacts.filter((c) => {
    const contactName = c.fullName || c.groupName || "";
    return contactName.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelectContact = (c) => {
    const contactName = c.fullName || c.groupName || "Contact";
    let text = `👤 *Contact Card*\n📌 *Name:* ${contactName}`;
    if (c.phone) text += `\n📞 *Phone:* ${c.phone}`;
    if (c.email) text += `\n✉️ *Email:* ${c.email}`;
    onSendContact(text);
    onClose();
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    let text = `👤 *Contact Card*\n📌 *Name:* ${name.trim()}`;
    if (phone.trim()) text += `\n📞 *Phone:* ${phone.trim()}`;
    if (email.trim()) text += `\n✉️ *Email:* ${email.trim()}`;
    onSendContact(text);
    setName("");
    setPhone("");
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-card max-w-md w-full border border-white/20 overflow-hidden shadow-2xl shadow-blue-950/50 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0a0f1d]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <IoPerson size={18} />
            </div>
            <h3 className="font-bold text-base text-white">Share Contact</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/[0.08] rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="flex border-b border-white/10 px-5 pt-2">
          <button
            onClick={() => setTab("select")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              tab === "select"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            From Contacts
          </button>
          <button
            onClick={() => setTab("manual")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              tab === "manual"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Custom Entry
          </button>
        </div>

        {tab === "select" ? (
          <div className="p-5 space-y-3">
            <input
              type="text"
              placeholder="Search contacts..."
              className="glass-input text-xs w-full px-3.5 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => handleSelectContact(c)}
                    className="flex items-center gap-3 p-2.5 hover:bg-white/[0.06] rounded-xl cursor-pointer transition-colors border border-transparent hover:border-white/[0.06]"
                  >
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300 shrink-0 text-sm">
                      {c.profilePic ? (
                        <img
                          src={c.profilePic}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (c.fullName || c.groupName || "U")[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-white truncate">
                        {c.fullName || c.groupName}
                      </div>
                      {c.email && (
                        <div className="text-[11px] text-slate-400 truncate">
                          {c.email}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No contacts found
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Full name"
                className="glass-input text-xs w-full px-3.5 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 234 567 890"
                className="glass-input text-xs w-full px-3.5 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="glass-input text-xs w-full px-3.5 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="btn-glass px-4 py-2 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="btn-glow px-5 py-2 text-xs font-semibold"
              >
                Share Contact
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Event Modal ─────────────────────────────────────────────────────────────
export const EventModal = ({ isOpen, onClose, onSendEvent }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    let eventText = `📅 *Event: ${title.trim()}*\n`;
    eventText += `🗓️ *Date:* ${date}${time ? ` at ${time}` : ""}`;
    if (location.trim()) eventText += `\n📍 *Location:* ${location.trim()}`;
    if (description.trim()) eventText += `\n📝 *Notes:* ${description.trim()}`;

    onSendEvent(eventText);
    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-card max-w-md w-full border border-white/20 overflow-hidden shadow-2xl shadow-purple-950/50 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0a0f1d]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <IoCalendar size={18} />
            </div>
            <h3 className="font-bold text-base text-white">Create an Event</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/[0.08] rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto"
        >
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Project Discussion, Standup"
              className="glass-input text-xs w-full px-3.5 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Date
              </label>
              <input
                type="date"
                required
                className="glass-input text-xs w-full px-3 py-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Time
              </label>
              <input
                type="time"
                className="glass-input text-xs w-full px-3 py-2"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              Location / Link
            </label>
            <input
              type="text"
              placeholder="e.g. Conference Room A or Video Link"
              className="glass-input text-xs w-full px-3.5 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add agenda or details..."
              className="glass-input text-xs w-full px-3.5 py-2 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn-glass px-4 py-2 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !date}
              className="btn-glow px-5 py-2 text-xs font-semibold"
            >
              Send Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
