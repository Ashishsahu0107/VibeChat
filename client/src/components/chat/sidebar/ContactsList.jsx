import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { BsPersonCircle } from 'react-icons/bs';
import api from '../../../config/api';
import useChatStore from '../../../store/useChatStore';
import { useSocket } from '../../../context/SocketContext';
import toast from 'react-hot-toast';

const ContactsList = ({ onSelectChat }) => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { accessChat } = useChatStore();
  const { onlineUsers } = useSocket();

  const fetchContacts = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/users${q ? `?search=${q}` : ''}`);
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
      toast.error('Failed to start chat');
    }
  };

  const grouped = contacts.reduce((acc, c) => {
    const letter = c.fullName[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(c);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full w-full select-none">
      {/* Header */}
      <div className="p-4 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xl font-bold text-white tracking-tight">Contacts</h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
            {contacts.length}
          </span>
        </div>
        <div className="relative">
          <FiSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search contacts..."
            className="glass-input text-xs w-full pl-9 pr-3 py-2.5"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        )}

        {!loading && contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400/60">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-3">
              <BsPersonCircle size={32} className="opacity-40 text-purple-400" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No contacts found</p>
          </div>
        )}

        {!loading &&
          Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, users]) => (
              <div key={letter} className="mb-2">
                <div className="px-3 py-1 bg-white/[0.03] rounded-lg border border-white/[0.04] mb-1">
                  <span className="text-[11px] font-bold text-cyan-400">
                    {letter}
                  </span>
                </div>
                {users.map((c) => {
                  const isOnline = onlineUsers.includes(c._id);
                  return (
                    <div
                      key={c._id}
                      onClick={() => handleStartChat(c._id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/[0.05] border border-transparent hover:border-white/[0.05] cursor-pointer transition-colors"
                    >
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-2xl overflow-hidden border border-white/15">
                          <img
                            src={
                              c.profilePic ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=7c3aed&color=fff`
                            }
                            alt={c.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0c1324] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-white truncate">{c.fullName}</div>
                        <div className="text-xs text-slate-400 truncate">
                          {c.about || c.email}
                        </div>
                      </div>
                      {isOnline && (
                        <span className="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                          Online
                        </span>
                      )}
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
