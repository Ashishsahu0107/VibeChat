import React, { useState, useEffect, useRef } from "react";
import { FiX, FiMoreVertical, FiEye, FiTrash2, FiSend } from "react-icons/fi";
import useStatusStore from "../../../store/useStatusStore";
import useChatStore from "../../../store/useChatStore";

const StatusViewer = ({ data, onClose }) => {
  const { statuses, initialIndex, ownerName, isMine } = data;
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { viewStatus, deleteStatus } = useStatusStore();
  const { chats, sendMessage } = useChatStore();
  
  const currentStatus = statuses[currentIndex];
  const DURATION = currentStatus?.type === "video" ? 15000 : 5000; // 15s for video, 5s for images/text
  const progressInterval = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!currentStatus) {
      onClose();
      return;
    }
    
    // Mark as viewed
    if (!isMine) {
      viewStatus(currentStatus._id);
    }
    
    setProgress(0);
    setIsPaused(false);
  }, [currentIndex, currentStatus]);

  useEffect(() => {
    if (isPaused) {
      clearInterval(progressInterval.current);
      if (videoRef.current) videoRef.current.pause();
      return;
    }
    
    if (videoRef.current && currentStatus?.type === "video") {
      videoRef.current.play().catch(e => console.log(e));
    }

    const intervalTime = 50; 
    const step = (100 / DURATION) * intervalTime;

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          handleNext();
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(progressInterval.current);
  }, [currentIndex, isPaused, DURATION]);

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleTap = (e) => {
    // If clicked on left 30% -> prev, else -> next
    const width = window.innerWidth;
    const x = e.clientX;
    if (x < width * 0.3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm("Delete this status update?")) {
      await deleteStatus(currentStatus._id);
      if (statuses.length === 1) onClose();
      else handleNext();
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    // Find the 1-on-1 chat with the status sender
    const chat = chats.find(c => !c.isGroupChat && c.users.some(u => u._id === currentStatus.sender._id || u === currentStatus.sender._id));
    
    if (chat) {
      await sendMessage({
        chatId: chat._id,
        content: `Reply to status: ${replyText}`,
        attachments: [],
        replyTo: null
      });
      setReplyText("");
      // Optionally show a toast, but sendMessage usually does or UI updates.
      onClose(); // close viewer on reply?
    } else {
      alert("No active chat found to reply to.");
    }
  };

  if (!currentStatus) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black flex flex-col justify-center items-center overflow-hidden">
      
      {/* Background container for text status */}
      {currentStatus.type === "text" && (
        <div 
          className="absolute inset-0 z-0 flex items-center justify-center p-8 transition-colors duration-300"
          style={{ backgroundColor: currentStatus.background }}
        >
          <div className="text-white text-4xl font-semibold text-center whitespace-pre-wrap break-words max-w-lg" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
            {currentStatus.content}
          </div>
        </div>
      )}

      {/* Media container */}
      {currentStatus.type === "image" && (
        <img src={currentStatus.content} alt="Status" className="absolute inset-0 w-full h-full object-contain z-0" />
      )}
      
      {currentStatus.type === "video" && (
        <video 
          ref={videoRef}
          src={currentStatus.content} 
          className="absolute inset-0 w-full h-full object-contain z-0"
          autoPlay 
          playsInline
          onEnded={handleNext}
        />
      )}

      {/* Tap Zones */}
      <div className="absolute inset-0 z-10 flex">
        <div className="w-1/3 h-full cursor-pointer" onClick={handleTap} onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)} />
        <div className="w-2/3 h-full cursor-pointer" onClick={handleTap} onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)} />
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-4 px-2 pb-12 bg-gradient-to-b from-black/60 to-transparent flex flex-col pointer-events-none">
        {/* Progress Bars */}
        <div className="flex gap-1 mb-3 px-2 w-full max-w-3xl mx-auto">
          {statuses.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75"
                style={{ 
                  width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%" 
                }}
              />
            </div>
          ))}
        </div>
        
        {/* User Info */}
        <div className="flex items-center justify-between px-2 w-full max-w-3xl mx-auto pointer-events-auto">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors md:hidden">
              <FiX size={20} />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
              <img src={currentStatus.sender?.profilePic || `https://ui-avatars.com/api/?name=${ownerName}`} alt={ownerName} className="w-full h-full object-cover" />
            </div>
            <div className="text-white drop-shadow-md">
              <div className="font-semibold text-sm">{isMine ? "My Status" : ownerName}</div>
              <div className="text-xs text-white/70">{new Date(currentStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-white">
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors hidden md:block">
              <FiX size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer (Views/Delete for Mine, Reply for Others) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe pointer-events-auto">
        <div className="bg-gradient-to-t from-black/60 to-transparent pt-12 pb-4 px-4 flex justify-center">
          {isMine ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-white mb-2">
                <FiEye size={16} />
                <span className="text-sm font-semibold">{currentStatus.viewers?.length || 0}</span>
              </div>
              <button onClick={handleDelete} className="text-white hover:text-red-400 p-2 rounded-full transition-colors">
                <FiTrash2 size={20} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleReply} className="w-full max-w-md mx-auto flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <input 
                type="text" 
                placeholder="Reply to status..." 
                className="flex-1 bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-2 outline-none focus:bg-white/30 transition-colors"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              />
              <button 
                type="submit" 
                disabled={!replyText.trim()}
                className="p-2 bg-primary text-white rounded-full hover:bg-primary-focus transition-colors disabled:opacity-50"
              >
                <FiSend size={18} className="ml-0.5" />
              </button>
            </form>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default StatusViewer;
