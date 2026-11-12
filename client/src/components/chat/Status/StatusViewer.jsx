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
      videoRef.current.play().catch((e) => console.log(e));
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
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
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
    const chat = chats.find(
      (c) =>
        !c.isGroupChat &&
        c.users.some(
          (u) =>
            u._id === currentStatus.sender._id ||
            u === currentStatus.sender._id,
        ),
    );

    if (chat) {
      await sendMessage({
        chatId: chat._id,
        content: `Reply to status: ${replyText}`,
        attachments: [],
        replyTo: null,
      });
      setReplyText("");
      onClose();
    } else {
      alert("No active chat found to reply to.");
    }
  };

  if (!currentStatus) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black flex flex-col justify-center items-center overflow-hidden animate-fade-in">
      {/* Background container for text status */}
      {currentStatus.type === "text" && (
        <div
          className="absolute inset-0 z-0 flex items-center justify-center p-8 transition-colors duration-500"
          style={{ backgroundColor: currentStatus.background }}
        >
          <div
            className="text-white text-3xl sm:text-5xl font-extrabold text-center whitespace-pre-wrap break-words max-w-2xl px-6 leading-relaxed"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
          >
            {currentStatus.content}
          </div>
        </div>
      )}

      {/* Media container */}
      {currentStatus.type === "image" && (
        <img
          src={currentStatus.content}
          alt="Status"
          className="absolute inset-0 w-full h-full object-contain z-0"
        />
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
        <div
          className="w-1/3 h-full cursor-pointer"
          onClick={handleTap}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        />
        <div
          className="w-2/3 h-full cursor-pointer"
          onClick={handleTap}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        />
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-4 px-4 pb-12 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex flex-col pointer-events-none">
        {/* Progress Bars */}
        <div className="flex gap-1.5 mb-4 px-2 w-full max-w-3xl mx-auto">
          {statuses.map((_, idx) => (
            <div
              key={idx}
              className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm"
            >
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-75"
                style={{
                  width:
                    idx < currentIndex
                      ? "100%"
                      : idx === currentIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between px-2 w-full max-w-3xl mx-auto pointer-events-auto">
          <div className="flex items-center gap-3 glass-panel px-3.5 py-1.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-md">
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors md:hidden"
            >
              <FiX size={18} />
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-cyan-500/40">
              <img
                src={
                  currentStatus.sender?.profilePic ||
                  `https://ui-avatars.com/api/?name=${ownerName}`
                }
                alt={ownerName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white">
              <div className="font-semibold text-xs sm:text-sm">
                {isMine ? "My Status" : ownerName}
              </div>
              <div className="text-[11px] text-white/60">
                {new Date(currentStatus.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white">
            <button
              onClick={onClose}
              className="glass-panel hover:bg-white/20 p-2.5 rounded-full transition-colors hidden md:flex items-center justify-center border border-white/15"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer (Views/Delete for Mine, Reply for Others) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-6 pointer-events-auto">
        <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-2 px-4 flex justify-center">
          {isMine ? (
            <div className="flex items-center gap-4 glass-panel px-5 py-2.5 rounded-full border border-white/15 bg-black/50 backdrop-blur-md">
              <div className="flex items-center gap-2 text-cyan-400">
                <FiEye size={18} />
                <span className="text-sm font-bold text-white">
                  {currentStatus.viewers?.length || 0} views
                </span>
              </div>
              <div className="w-px h-5 bg-white/20" />
              <button
                onClick={handleDelete}
                className="text-rose-400 hover:text-rose-300 p-1.5 rounded-full hover:bg-rose-500/20 transition-colors"
                title="Delete status"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleReply}
              className="w-full max-w-md mx-auto flex items-center gap-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                placeholder="Reply to status..."
                className="flex-1 glass-input rounded-full px-5 py-2.5 text-sm text-white placeholder-white/50 border border-white/20 bg-black/40 backdrop-blur-md outline-none focus:border-cyan-400/60 transition-colors"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="p-3 bg-gradient-to-tr from-blue-600 via-cyan-500 to-purple-600 text-white rounded-full shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
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
