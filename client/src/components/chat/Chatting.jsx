import React, { useState, useEffect, useRef } from "react";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import { useSocket } from "../../context/SocketContext";
import { FiSend, FiPaperclip, FiSmile, FiMoreVertical, FiVideo, FiPhone, FiMic, FiTrash } from "react-icons/fi";
import { BsCheck, BsCheckAll, BsStopCircle } from "react-icons/bs";
import AudioCall from "./AudioCall";
import VideoCall from "./VideoCall";
import CustomAudioPlayer from "./CustomAudioPlayer";

const Chatting = ({ selectedUser }) => {
  const [content, setContent] = useState("");
  const { messages, fetchMessages, sendMessage, uploadAttachment, loading } = useChatStore();
  const { authUser } = useAuthStore();
  const { socket, onlineUsers } = useSocket();
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [outgoingCallType, setOutgoingCallType] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
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

    const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview("document");
    }
  };

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `Voice_Message_${new Date().getTime()}.webm`, { type: 'audio/webm' });
        setRecordedAudio({ file: audioFile, url: URL.createObjectURL(audioBlob) });
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!content.trim() && !recordedAudio && !selectedFile) return;
    
    try {
      socket?.emit("stop-typing", selectedUser._id);
      setTyping(false);
      
      let attachments = [];
      if (recordedAudio) {
        const attachment = await uploadAttachment(recordedAudio.file);
        attachments.push(attachment);
      }
      if (selectedFile) {
        const attachment = await uploadAttachment(selectedFile);
        attachments.push(attachment);
      }
      
      await sendMessage(content, selectedUser._id, attachments);
      setContent("");
      setRecordedAudio(null);
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error(error);
      alert("Failed to send message: " + error.message);
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
    <div className="flex flex-col h-full w-full bg-base-200/50 relative">
      {outgoingCallType === "video" && (
        <VideoCall
          authUser={authUser}
          calleeId={selectedUser?.users?.find(u => String(u._id) !== String(authUser._id))?._id}
          calleeName={chatName}
          isReceiving={false}
          onEndCall={() => setOutgoingCallType(null)}
        />
      )}
      {outgoingCallType === "audio" && (
        <AudioCall
          authUser={authUser}
          calleeId={selectedUser?.users?.find(u => String(u._id) !== String(authUser._id))?._id}
          calleeName={chatName}
          isReceiving={false}
          onEndCall={() => setOutgoingCallType(null)}
        />
      )}
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
          <button onClick={() => setOutgoingCallType("video")} className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300/50 rounded-full transition-colors hidden md:flex"><FiVideo size={20} /></button>
          <button onClick={() => setOutgoingCallType("audio")} className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300/50 rounded-full transition-colors"><FiPhone size={20} /></button>
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
              {filePreview && (
          <div className="p-3 bg-base-200 border-t border-base-300 flex items-center relative">
            <div className="relative inline-block">
              {filePreview === "document" ? (
                <div className="w-16 h-16 bg-base-300 rounded-lg flex items-center justify-center text-xs">File</div>
              ) : (
                <img src={filePreview} alt="Preview" className="h-20 w-auto rounded-lg object-cover shadow-sm border border-base-300" />
              )}
              <button 
                onClick={() => { setSelectedFile(null); setFilePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="absolute -top-2 -right-2 bg-base-100 text-error rounded-full p-1 shadow-md hover:bg-base-300 transition-colors"
              >
                <FiTrash size={14} />
              </button>
            </div>
          </div>
        )}
        <div className="p-3 bg-base-100 flex items-center gap-2 border-t border-base-300">
        <button type="button" className="p-2 text-base-content/70 hover:bg-base-300/50 rounded-full transition-colors"><FiSmile size={24} /></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-base-content/70 hover:bg-base-300/50 rounded-full transition-colors"><FiPaperclip size={22} /></button>
        
                  <div className="flex-1 flex items-center bg-base-200 rounded-lg px-2 h-12">
            {recordedAudio ? (
              <div className="flex items-center w-full justify-between px-2">
                <CustomAudioPlayer src={recordedAudio.url} />
                <button type="button" onClick={() => setRecordedAudio(null)} className="p-2 text-error hover:bg-base-300 rounded-full transition-colors ml-2">
                  <FiTrash size={18} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex-1 h-full flex items-center">
                <input
                  type="text"
                  className="input w-full h-full bg-transparent border-none focus:outline-none focus:border-transparent px-2"
                  placeholder="Type a message"
                  value={content}
                  onChange={handleTypingChange}
                />
              </form>
            )}
          </div>
          
          {content.trim() || recordedAudio || selectedFile ? (
            <button type="button" onClick={handleSend} className="p-2.5 bg-primary text-primary-content hover:opacity-80 rounded-full transition-opacity shadow-sm"><FiSend size={18} /></button>
          ) : isRecording ? (
            <button type="button" onClick={stopRecording} className="p-2.5 bg-error text-white hover:opacity-80 rounded-full transition-opacity shadow-sm animate-pulse"><BsStopCircle size={18} /></button>
          ) : (
            <button type="button" onClick={startRecording} className="p-2.5 bg-primary text-primary-content hover:opacity-80 rounded-full transition-opacity shadow-sm"><FiMic size={18} /></button>
          )}
      </div>
    </div>
  );
};

export default Chatting;


