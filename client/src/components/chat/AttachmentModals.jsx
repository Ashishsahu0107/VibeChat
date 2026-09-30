import React, { useState } from "react";
import { FiX, FiPlus, FiTrash2, FiCalendar, FiClock, FiMapPin, FiUser, FiPhone, FiMail } from "react-icons/fi";
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
      const numEmoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"][idx] || "▫️";
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
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full border border-base-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <div className="flex items-center gap-2.5">
            <IoBarChart className="text-[#eab308] text-xl" />
            <h3 className="font-bold text-lg">Create a Poll</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-base-200 rounded-full transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-base-content/70 uppercase tracking-wider block mb-1.5">
              Question
            </label>
            <input
              type="text"
              autoFocus
              required
              placeholder="Ask a question..."
              className="input input-bordered w-full rounded-xl text-sm"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70 uppercase tracking-wider block mb-1.5">
              Options
            </label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    className="input input-bordered input-sm flex-1 rounded-xl text-sm"
                    value={opt}
                    onChange={(e) => handleOptionChange(e.target.value, idx)}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 8 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <FiPlus size={14} /> Add option
              </button>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="checkbox checkbox-primary checkbox-sm"
            />
            <span className="text-sm">Allow multiple answers</span>
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!question.trim() || options.filter((o) => o.trim()).length < 2}
              className="btn btn-primary btn-sm rounded-xl"
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
export const ContactModal = ({ isOpen, onClose, onSendContact, contacts = [] }) => {
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
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full border border-base-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <div className="flex items-center gap-2.5">
            <IoPerson className="text-[#06b6d4] text-xl" />
            <h3 className="font-bold text-lg">Share Contact</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-base-200 rounded-full transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="flex border-b border-base-300 px-5 pt-2">
          <button
            onClick={() => setTab("select")}
            className={`pb-2 px-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === "select" ? "border-primary text-primary" : "border-transparent text-base-content/60"
            }`}
          >
            From Chats
          </button>
          <button
            onClick={() => setTab("manual")}
            className={`pb-2 px-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === "manual" ? "border-primary text-primary" : "border-transparent text-base-content/60"
            }`}
          >
            Custom Contact
          </button>
        </div>

        {tab === "select" ? (
          <div className="p-5 space-y-3">
            <input
              type="text"
              placeholder="Search contacts..."
              className="input input-bordered input-sm w-full rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => handleSelectContact(c)}
                    className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                      {c.profilePic ? (
                        <img src={c.profilePic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (c.fullName || c.groupName || "U")[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{c.fullName || c.groupName}</div>
                      {c.email && <div className="text-xs text-base-content/50 truncate">{c.email}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-base-content/50">No contacts found</div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-base-content/70 block mb-1">Name</label>
              <input
                type="text"
                required
                placeholder="Full name"
                className="input input-bordered input-sm w-full rounded-xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70 block mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 234 567 890"
                className="input input-bordered input-sm w-full rounded-xl"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70 block mb-1">Email (Optional)</label>
              <input
                type="email"
                placeholder="name@example.com"
                className="input input-bordered input-sm w-full rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-sm rounded-xl">
                Cancel
              </button>
              <button type="submit" disabled={!name.trim()} className="btn btn-primary btn-sm rounded-xl">
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
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full border border-base-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <div className="flex items-center gap-2.5">
            <IoCalendar className="text-[#f43f5e] text-xl" />
            <h3 className="font-bold text-lg">Create an Event</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-base-200 rounded-full transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-base-content/70 block mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Project Discussion"
              className="input input-bordered input-sm w-full rounded-xl"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-base-content/70 block mb-1">Date</label>
              <input
                type="date"
                required
                className="input input-bordered input-sm w-full rounded-xl"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70 block mb-1">Time</label>
              <input
                type="time"
                className="input input-bordered input-sm w-full rounded-xl"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70 block mb-1">Location / Link</label>
            <input
              type="text"
              placeholder="e.g. Office Room 302 or Zoom link"
              className="input input-bordered input-sm w-full rounded-xl"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70 block mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Add details or agenda..."
              className="textarea textarea-bordered w-full rounded-xl text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={!title.trim() || !date} className="btn btn-primary btn-sm rounded-xl">
              Send Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
