import React, { useEffect, useState } from "react";
import { FiSearch, FiUserPlus, FiArrowLeft } from "react-icons/fi";
import { BsPersonCircle } from "react-icons/bs";
import api from "../../../config/api";
import useChatStore from "../../../store/useChatStore";
import { useSocket } from "../../../context/SocketContext";
import toast from "react-hot-toast";

const ContactsList = ({ onSelectChat, onBack }) => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { accessChat } = useChatStore();
  const { onlineUsers } = useSocket();

  const fetchContacts = async (q = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/users${q ? `?search=${q}` : ""}`);
      setContacts(res.data || []);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    fetchContacts(q);
  };

  const handleStartChat = async (userId) => {
    try {
      const chat = await accessChat(userId);
      onSelectChat(chat);
    } catch {
      toast.error("Failed to start chat");
    }
  };

  const grouped = contacts.reduce((acc, c) => {
    const letter = (c.fullName || "U")[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(c);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full w-full select-none font-sans">
      {/* Header (Figma Screen 21: Contacts) */}
      <div className="p-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <FiArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-xl font-bold text-white tracking-tight">Contacts</h2>
          </div>
          <button
            onClick={() => toast("Invite friends feature coming soon")}
            className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-purple-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            title="Add Contact"
          >
            <FiUserPlus size={16} />
          </button>
        </div>

        {/* Search Contact input */}
        <div className="relative">
          <FiSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search contact..."
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder:text-gray-400 text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 transition-all"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-3">
              <BsPersonCircle size={32} className="opacity-40 text-purple-400" />
            </div>
            <p className="text-sm font-semibold text-gray-300">No contacts found</p>
          </div>
        )}

        {!loading &&
          Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, users]) => (
              <div key={letter} className="mb-3">
                <div className="px-3 py-1 bg-white/[0.03] rounded-lg border border-white/[0.04] mb-1.5">
                  <span className="text-[11px] font-bold text-purple-400">
                    {letter}
                  </span>
                </div>
                {users.map((c) => {
                  const isOnline = onlineUsers.includes(c._id);
                  return (
                    <div
                      key={c._id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/[0.06] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-full overflow-hidden border border-purple-400/25">
                            <img
                              src={
                                c.profilePic ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  c.fullName || "User",
                                )}&background=7c3aed&color=fff`
                              }
                              alt={c.fullName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0c1324] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-white truncate">
                            {c.fullName}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {c.about || c.email}
                          </div>
                        </div>
                      </div>

                      {/* Solid Purple Pill Button: Chat (Figma Screen 21) */}
                      <button
                        onClick={() => handleStartChat(c._id)}
                        className="px-4 py-1.5 rounded-full font-bold text-xs text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-md shadow-purple-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
                      >
                        Chat
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
      </div>
    </div>
  );
};

export default ContactsList;