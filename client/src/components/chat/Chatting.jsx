import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiImage, FiMoreVertical, FiPhone, FiVideo, FiSmile } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import api from "../../config/api";
import useAuthStore from "../../store/useAuthStore";
import { useSocket } from "../../context/SocketContext";
import toast from "react-hot-toast";
import VideoCall from "./VideoCall";
import AudioCall from "./AudioCall";

const Chatting = ({ selectedUser }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [callType, setCallType] = useState(null); // 'video' | 'audio' | null
  const { authUser } = useAuthStore();
  const { onlineUsers } = useSocket();
  const messagesEndRef = useRef(null);

  // Fetch messages when a user is selected
  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      try {
        if (!selectedUser) return;
        // Adding a timestamp to prevent browser caching of the GET request
        const res = await api.get(`/messages/${selectedUser._id}?t=${new Date().getTime()}`);
        if (isMounted) {
          setMessages((prevMessages) => {
            // Only update state if the messages actually changed to prevent excessive re-renders and auto-scrolling
            if (prevMessages.length !== res.data.length) {
              return res.data;
            }
            return prevMessages; // Keep the same reference if no new messages
          });
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    
    // Initial fetch
    fetchMessages();

    // Set up polling (Short Polling)
    let intervalId;
    if (selectedUser) {
      intervalId = setInterval(fetchMessages, 200); // Poll every 2 seconds
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedUser]);

  const chatContainerRef = useRef(null);
  const isScrolledUpRef = useRef(false);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // Check if user has scrolled up more than 150px from bottom
      isScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 150;
    }
  };

  // Auto-scroll to bottom whenever messages update, ONLY if user is at the bottom
  useEffect(() => {
    if (!isScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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
            <p className={`text-sm ${onlineUsers.includes(selectedUser._id) ? 'text-success' : 'text-base-content/50'}`}>
              {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-base-content/70">
          <button type="button" onClick={() => setCallType('audio')} className="btn btn-ghost btn-circle btn-sm"><FiPhone size={20} /></button>
          <button type="button" onClick={() => setCallType('video')} className="btn btn-ghost btn-circle btn-sm"><FiVideo size={20} /></button>
          <button type="button" className="btn btn-ghost btn-circle btn-sm"><FiMoreVertical size={20} /></button>
        </div>
      </div>

      {callType === 'video' && (
        <VideoCall 
          authUser={authUser} 
          calleeId={selectedUser._id} 
          calleeName={selectedUser.fullName}
          onEndCall={() => setCallType(null)} 
          isReceiving={false}
        />
      )}
      
      {callType === 'audio' && (
        <AudioCall 
          authUser={authUser} 
          calleeId={selectedUser._id} 
          calleeName={selectedUser.fullName}
          onEndCall={() => setCallType(null)} 
          isReceiving={false}
        />
      )}

      <div 
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-base-200/30"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {messages.map((chat, idx) => {
          const senderId = chat.senderId || chat.sender;
          const isMe = String(senderId) === String(authUser._id);
          const timeString = new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={chat._id || idx} className={`flex w-full ${isMe ? "justify-end" : "justify-start"} gap-3`}>
              {/* Receiver Avatar (Left) */}
              {!isMe && (
                <div className="avatar self-end">
                  <div className="w-10 rounded-full">
                    <img alt="avatar" src={selectedUser.profilePic || selectedUser.image || `https://ui-avatars.com/api/?name=${selectedUser.fullName}&background=random`} />
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="text-xs opacity-50 mb-1 flex items-center gap-2">
                  {isMe ? "Me" : selectedUser.fullName}
                  <time className="text-xs opacity-75">{timeString}</time>
                </div>
                <div className={`px-4 py-2 rounded-2xl shadow-sm max-w-md break-words ${isMe ? "bg-primary text-primary-content rounded-br-none" : "bg-base-300 text-base-content rounded-bl-none"}`}>
                  {chat.message}
                </div>
              </div>

              {/* Sender Avatar (Right) */}
              {isMe && (
                <div className="avatar self-end">
                  <div className="w-10 rounded-full">
                    <img alt="avatar" src={authUser.profilePic || `https://ui-avatars.com/api/?name=${authUser.fullName}&background=random`} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-base-100 border-t border-base-300 relative">
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-50 shadow-2xl">
            <EmojiPicker 
              onEmojiClick={(emojiData) => setMessage((prev) => prev + emojiData.emoji)} 
              theme="auto"
            />
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
          <button 
            type="button" 
            className={`btn btn-circle btn-ghost ${showEmojiPicker ? 'text-primary' : 'text-base-content/50'}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FiSmile size={24} />
          </button>
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