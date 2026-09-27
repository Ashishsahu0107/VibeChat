import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiX, FiMessageSquare, FiUser, FiClock } from "react-icons/fi";
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
      // In a full implementation, this might scroll to the specific message.
      // For now, we'll just open the chat containing the message.
      const chatId = message.chatId?._id || message.chatId;
      // We need the full chat object to set it in store
      const { chats, fetchChats } = useChatStore.getState();
      let chat = chats.find(c => c._id === chatId);
      if (!chat) {
        await fetchChats();
        chat = useChatStore.getState().chats.find(c => c._id === chatId);
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
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] bg-black/40 backdrop-blur-sm px-4">
      <div 
        className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] border border-base-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-base-300 bg-base-100">
          <FiSearch className="text-base-content/40" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search users and messages..."
            className="flex-1 bg-transparent outline-none text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <div className="loading loading-spinner loading-sm text-primary"></div>}
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-base-200 rounded-lg text-base-content/60 transition-colors bg-base-200 text-xs font-semibold px-2"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto bg-base-200/30">
          {!query && (
            <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
              <FiSearch size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Type to search</p>
              <p className="text-sm mt-1">Search for contacts or messages across all chats</p>
            </div>
          )}

          {query && !loading && !hasResults && (
            <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-1">Try a different keyword</p>
            </div>
          )}

          {hasResults && (
            <div className="p-2 space-y-4">
              {/* Users Section */}
              {results.users.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <FiUser size={12} /> Contacts
                  </div>
                  {results.users.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleUserClick(user._id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-base-200 rounded-xl transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                        <img 
                          src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
                          alt={user.fullName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{user.fullName}</div>
                        <div className="text-xs text-base-content/50">{user.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Messages Section */}
              {results.messages.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1 mt-4 flex items-center gap-2">
                    <FiMessageSquare size={12} /> Messages
                  </div>
                  {results.messages.map((msg) => {
                    const chatName = msg.chatId?.isGroupChat 
                      ? msg.chatId.groupName 
                      : (msg.sender?._id !== useAuthStore.getState().authUser._id ? msg.sender?.fullName : "You");
                    
                    return (
                      <button
                        key={msg._id}
                        onClick={() => handleMessageClick(msg)}
                        className="w-full flex flex-col gap-1 px-3 py-3 hover:bg-base-200 rounded-xl transition-colors text-left border border-transparent hover:border-base-300"
                      >
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-primary">{chatName}</span>
                            <span className="text-[10px] text-base-content/40 flex items-center gap-1">
                              <FiUser size={8} /> {msg.sender?.fullName}
                            </span>
                          </div>
                          <span className="text-[10px] text-base-content/40 flex items-center gap-1">
                            <FiClock size={10} /> 
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-base-content/80 line-clamp-2 leading-tight">
                          {msg.content}
                        </p>
                      </button>
                    );
                  })}
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
