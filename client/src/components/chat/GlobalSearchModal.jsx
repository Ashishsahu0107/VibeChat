import React, { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiX,
  FiMessageSquare,
  FiUser,
  FiClock,
} from "react-icons/fi";
import api from "../../config/api";
import useChatStore from "../../store/useChatStore";

const GlobalSearchModal = ({ onClose, onSelectChat }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ users: [], messages: [] });
  const inputRef = useRef(null);
  const { accessChat } = useChatStore();

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();

    // Add escape key listener
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch(query);
      } else {
        setResults({ users: [], messages: [] });
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (q) => {
    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
      setResults(res.data);
    } catch (error) {
      console.error("Search error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (userId) => {
    try {
      const chat = await accessChat(userId);
      onSelectChat(chat);
      onClose();
    } catch (error) {
      console.error("Failed to access chat", error);
    }
  };

  const handleMessageClick = async (message) => {
    try {
      const chatId = message.chatId?._id || message.chatId;
      const { chats, fetchChats } = useChatStore.getState();
      let chat = chats.find((c) => c._id === chatId);
      if (!chat) {
        await fetchChats();
        chat = useChatStore.getState().chats.find((c) => c._id === chatId);
      }
      if (chat) {
        onSelectChat(chat);
        onClose();
      }
    } catch (error) {
      console.error("Failed to go to message", error);
    }
  };

  const hasResults = results.users.length > 0 || results.messages.length > 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] bg-black/70 backdrop-blur-md px-4 animate-in fade-in duration-200">
      <div
        className="glass-card w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/20 shadow-2xl shadow-blue-950/60 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-[#0a0f1d]/90">
          <FiSearch className="text-cyan-400 shrink-0" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search across users, contacts, and message history..."
            className="flex-1 bg-transparent outline-none text-base text-white placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin shrink-0" />
          )}
          <button
            onClick={onClose}
            className="p-1 px-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors bg-white/[0.05] border border-white/10 text-xs font-semibold cursor-pointer shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {!query && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400/60">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-3 text-cyan-400">
                <FiSearch size={32} className="opacity-50" />
              </div>
              <p className="font-semibold text-slate-300">Type to search</p>
              <p className="text-xs text-slate-500 mt-1">
                Search for contacts or messages across all conversations
              </p>
            </div>
          )}

          {query && !loading && !hasResults && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400/60">
              <p className="font-semibold text-slate-300">No results found</p>
              <p className="text-xs text-slate-500 mt-1">Try a different keyword or name</p>
            </div>
          )}

          {hasResults && (
            <div className="space-y-4">
              {/* Users Section */}
              {results.users.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <FiUser size={13} /> Contacts
                  </div>
                  <div className="space-y-1">
                    {results.users.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => handleUserClick(user._id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.06] rounded-2xl transition-colors text-left border border-transparent hover:border-white/[0.06] cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-white/15 bg-slate-900">
                          <img
                            src={
                              user.profilePic ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=7c3aed&color=fff`
                            }
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-white truncate">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {user.email}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages Section */}
              {results.messages.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <FiMessageSquare size={13} /> Messages
                  </div>
                  <div className="space-y-1">
                    {results.messages.map((msg) => {
                      const chatName = msg.chatId?.isGroupChat
                        ? msg.chatId.groupName
                        : msg.sender?._id !== useChatStore.getState().authUser?._id
                          ? msg.sender?.fullName
                          : "You";

                      return (
                        <button
                          key={msg._id}
                          onClick={() => handleMessageClick(msg)}
                          className="w-full flex flex-col gap-1.5 px-3.5 py-3 hover:bg-white/[0.06] rounded-2xl transition-colors text-left border border-transparent hover:border-white/[0.06] cursor-pointer"
                        >
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-cyan-300">
                                {chatName}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                • {msg.sender?.fullName}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <FiClock size={10} />
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">
                            {msg.content}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
