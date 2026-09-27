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
    <div className="flex flex-col h-full bg-base-100">
      <div className="px-4 py-3 border-b border-base-300 shrink-0">
        <h2 className="text-xl font-bold mb-3">Contacts</h2>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={15} />
          <input
            type="text"
            placeholder="Search contacts..."
            className="input input-bordered input-sm w-full pl-9 rounded-full bg-base-200 border-none focus:outline-none"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="loading loading-spinner loading-md text-primary" />
          </div>
        )}

        {!loading && contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-base-content/40">
            <BsPersonCircle size={48} className="mb-4 opacity-20" />
            <p className="text-sm">No contacts found</p>
          </div>
        )}

        {!loading && Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([letter, users]) => (
          <div key={letter}>
            <div className="px-4 py-1.5 bg-base-200/50">
              <span className="text-xs font-bold text-base-content/50">{letter}</span>
            </div>
            {users.map((c) => {
              const isOnline = onlineUsers.includes(c._id);
              return (
                <div
                  key={c._id}
                  onClick={() => handleStartChat(c._id)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-base-200 cursor-pointer transition-colors border-b border-base-300/30"
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden">
                      <img
                        src={c.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=7c3aed&color=fff`}
                        alt={c.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success border-2 border-base-100 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{c.fullName}</div>
                    <div className="text-xs text-base-content/50 truncate">{c.about || c.email}</div>
                  </div>
                  {isOnline && (
                    <span className="text-xs text-success font-medium shrink-0">Online</span>
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
