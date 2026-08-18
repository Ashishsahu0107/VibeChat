import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiImage, FiMoreVertical, FiPhone, FiVideo } from "react-icons/fi";
import api from "../../config/api";
import useAuthStore from "../../store/useAuthStore";
import toast from "react-hot-toast";

const Chatting = ({ selectedUser }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  // Fetch messages when a user is selected
  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      try {
        if (!selectedUser) return;
        const res = await api.get(`/messages/${selectedUser._id}`);
        if (isMounted) {
          setMessages(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    
    // Initial fetch
    fetchMessages();

    // Set up polling
    let intervalId;
    if (selectedUser) {
      intervalId = setInterval(fetchMessages, 2000); // Poll every 2 seconds
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedUser]);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const res = await api.post(`/messages/send/${selectedUser._id}`, {
        message: message.trim(),
      });
      // Append the newly sent message immediately
      setMessages((prev) => [...prev, res.data]);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-base-200/50">
        <div className="text-center p-8 bg-base-100 rounded-3xl shadow-sm">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-base-content mb-2">Your Messages</h2>
          <p className="text-base-content/60">Select a chat to start messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-300 bg-base-100/95 backdrop-blur z-10">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full border-2 border-primary/20">
              <img src={selectedUser.profilePic || selectedUser.image || `https://ui-avatars.com/api/?name=${selectedUser.fullName}&background=random`} alt={selectedUser.fullName} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg text-base-content capitalize">{selectedUser.fullName}</h3>
            <p className="text-sm text-success">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-base-content/70">
          <button className="btn btn-ghost btn-circle btn-sm"><FiPhone size={20} /></button>
          <button className="btn btn-ghost btn-circle btn-sm"><FiVideo size={20} /></button>
          <button className="btn btn-ghost btn-circle btn-sm"><FiMoreVertical size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-base-200/30">
        {messages.map((chat, idx) => {
          const senderId = chat.senderId || chat.sender;
          const isMe = String(senderId) === String(authUser._id);
          const timeString = new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={chat._id || idx} className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img alt="avatar" src={isMe ? (authUser.profilePic || `https://ui-avatars.com/api/?name=${authUser.fullName}&background=random`) : (selectedUser.profilePic || selectedUser.image || `https://ui-avatars.com/api/?name=${selectedUser.fullName}&background=random`)} />
                </div>
              </div>
              <div className="chat-header text-xs opacity-50 mb-1">
                {isMe ? "Me" : selectedUser.fullName}
                <time className="text-xs opacity-50 ml-2">{timeString}</time>
              </div>
              <div className={`chat-bubble ${isMe ? "chat-bubble-primary" : "chat-bubble-base-200"} shadow-sm`}>
                {chat.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-base-100 border-t border-base-300">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
          <button type="button" className="btn btn-circle btn-ghost text-base-content/50">
            <FiImage size={24} />
          </button>
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="input input-bordered flex-1 rounded-full bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-circle btn-primary shadow-lg shadow-primary/30" disabled={!message.trim()}>
            <FiSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatting;