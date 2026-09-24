import React, { useState, useEffect, useRef } from "react";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import { useSocket } from "../../context/SocketContext";
import { FiSend, FiPaperclip, FiSmile, FiMoreVertical, FiVideo, FiPhone } from "react-icons/fi";
import { BsCheck, BsCheckAll } from "react-icons/bs";

const Chatting = ({ selectedUser }) => {
  const [content, setContent] = useState("");
  const { messages, fetchMessages, sendMessage, loading } = useChatStore();
  const { authUser } = useAuthStore();
  const { socket, onlineUsers } = useSocket();
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      socket?.emit("join-chat", selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    
    const handleTyping = (room) => { if (room === selectedUser?._id) setIsTyping(true); };
    const handleStopTyping = (room) => { if (room === selectedUser?._id) setIsTyping(false); };
    
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);
    
    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, [socket, selectedUser]);

  const handleTypingChange = (e) => {
    setContent(e.target.value);
    
    if (!socket || !selectedUser) return;
    
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedUser._id);
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", selectedUser._id);
      setTyping(false);
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedUser) return;
    
    try {
      socket?.emit("stop-typing", selectedUser._id);
      setTyping(false);
      await sendMessage(content, selectedUser._id);
      setContent("");
    } catch (error) {
      console.error(error);
    }
  };

  const chatName = selectedUser?.isGroupChat 
    ? selectedUser?.groupName 
    : selectedUser?.users?.find(u => String(u._id) !== String(authUser._id))?.fullName;
    
  const chatPic = selectedUser?.isGroupChat 
    ? (selectedUser?.groupAvatar || `https://ui-avatars.com/api/?name=${chatName}`) 
    : selectedUser?.users?.find(u => String(u._id) !== String(authUser._id))?.profilePic;

  const isOnline = selectedUser && !selectedUser.isGroupChat && onlineUsers.includes(selectedUser?.users?.find(u => String(u._id) !== String(authUser._id))?._id);

  const renderTicks = (msg) => {
    if (msg.sender?._id !== authUser._id) return null;
    // Since outgoing bubbles are bg-primary, we use text-primary-content (often white) instead of text-base-content
    if (msg.readBy && msg.readBy.length > 0) return <BsCheckAll size={16} className="text-blue-300 ml-1" />;
    if (msg.deliveredTo && msg.deliveredTo.length > 0) return <BsCheckAll size={16} className="text-primary-content/70 ml-1" />;
    return <BsCheck size={16} className="text-primary-content/70 ml-1" />;
  };

  return (
    <div className="flex flex-col h-full w-full bg-base-200/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-base-100 border-b border-base-300">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full">
              <img src={chatPic} alt={chatName} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base-content leading-tight">{chatName}</span>
            {isTyping ? (
              <span className="text-xs text-primary font-medium">typing...</span>
            ) : isOnline ? (
              <span className="text-xs text-base-content/60">online</span>
            ) : (
              <span className="text-xs text-base-content/60">offline</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-base-content/70">
          <button className="btn btn-ghost btn-circle btn-sm hidden md:flex"><FiVideo size={20} /></button>
          <button className="btn btn-ghost btn-circle btn-sm"><FiPhone size={20} /></button>
          <div className="divider divider-horizontal mx-0 hidden md:flex"></div>
          <button className="btn btn-ghost btn-circle btn-sm"><FiMoreVertical size={20} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 relative" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: 'cover', backgroundAttachment: 'fixed', opacity: 0.9 }}>
        {loading ? (
          <div className="flex justify-center items-center h-full"><span className="loading loading-spinner"></span></div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === authUser._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-1.5 rounded-lg shadow-sm flex flex-col group ${isMe ? 'bg-primary text-primary-content' : 'bg-base-100 text-base-content'}`}>
                  {!isMe && selectedUser?.isGroupChat && (
                    <div className="text-xs font-semibold text-primary mb-0.5">{msg.sender?.fullName}</div>
                  )}
                  <p className="text-[15px] leading-snug break-words">{msg.content}</p>
                  <div className="flex justify-end items-center mt-1 gap-1 self-end">
                    <span className={`text-[10px] ${isMe ? 'text-primary-content/70' : 'text-base-content/50'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {renderTicks(msg)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="p-3 bg-base-100 flex items-center gap-2 border-t border-base-300">
        <button type="button" className="p-2 text-base-content/70 hover:bg-base-300/50 rounded-full transition-colors"><FiSmile size={24} /></button>
        <button type="button" className="p-2 text-base-content/70 hover:bg-base-300/50 rounded-full transition-colors"><FiPaperclip size={22} /></button>
        
        <form onSubmit={handleSend} className="flex-1 flex items-center bg-base-200 rounded-lg px-2">
          <input
            type="text"
            className="input w-full bg-transparent border-none focus:outline-none"
            placeholder="Type a message"
            value={content}
            onChange={handleTypingChange}
          />
        </form>
        
        {content.trim() ? (
          <button type="submit" onClick={handleSend} className="p-2.5 bg-primary text-primary-content hover:opacity-80 rounded-full transition-opacity shadow-sm"><FiSend size={18} /></button>
        ) : (
          <button type="button" className="p-2.5 bg-primary text-primary-content hover:opacity-80 rounded-full transition-opacity shadow-sm"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11.999 14.942c2.005 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.526-3.531-3.531-3.531S8.469 2.349 8.469 4.35v7.061c0 2.001 1.527 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2.002z"></path></svg></button>
        )}
      </div>
    </div>
  );
};

export default Chatting;






