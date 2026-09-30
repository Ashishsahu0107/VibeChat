import React, { useState, useEffect, useRef, useCallback } from "react";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import { useSocket } from "../../context/SocketContext";
import EmojiPicker from "emoji-picker-react";
import {
  FiSend, FiPaperclip, FiSmile, FiMoreVertical, FiVideo, FiPhone,
  FiMic, FiTrash, FiX, FiEdit2, FiCornerUpLeft, FiChevronDown,
  FiSearch, FiArrowLeft, FiInfo, FiCheck, FiCopy, FiMessageSquare
} from "react-icons/fi";
import { BsCheck, BsCheckAll, BsMicFill, BsFillStarFill } from "react-icons/bs";
import { MdOutlineReply, MdDelete, MdEdit, MdForward, MdContentCopy, MdStar, MdStarOutline } from "react-icons/md";
import AudioCall from "./AudioCall";
import VideoCall from "./VideoCall";
import CustomAudioPlayer from "./CustomAudioPlayer";
import ChatInfoPanel from "./ChatInfoPanel";
import MediaViewerModal from "./MediaViewerModal";
import toast from "react-hot-toast";
import {
  IoDocumentText,
  IoImages,
  IoCamera,
  IoHeadset,
  IoPerson,
  IoBarChart,
  IoCalendar,
  IoSparkles
} from "react-icons/io5";
import { PollModal, ContactModal, EventModal } from "./AttachmentModals";

// ── Date Separator ─────────────────────────────────────────────────────────────
const DateSeparator = ({ date }) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let label;
  if (d.toDateString() === today.toDateString()) label = "Today";
  else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
  else label = d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="flex items-center gap-3 my-3 px-4">
      <div className="flex-1 h-px bg-base-300" />
      <span className="text-[11px] font-medium text-base-content/50 bg-base-200 px-3 py-1 rounded-full whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-base-300" />
    </div>
  );
};

// ── Reaction Emoji Bar ──────────────────────────────────────────────────────────
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const ReactionBar = ({ onReact, onClose }) => (
  <div className="flex items-center gap-1 bg-base-100 border border-base-300 rounded-full px-2 py-1 shadow-lg">
    {QUICK_EMOJIS.map((emoji) => (
      <button
        key={emoji}
        className="text-xl hover:scale-125 transition-transform cursor-pointer p-0.5"
        onClick={() => { onReact(emoji); onClose(); }}
      >
        {emoji}
      </button>
    ))}
  </div>
);

// ── Message Context Menu ─────────────────────────────────────────────────────
const MessageContextMenu = ({ x, y, message, isMe, onClose, onReply, onEdit, onDelete, onCopy, onStar, onForward, onReact }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[1000] bg-base-100 border border-base-300 rounded-xl shadow-2xl overflow-hidden w-52"
      style={{ top: y, left: x }}
    >
      {/* Quick Reactions */}
      <div className="px-3 py-2 border-b border-base-300">
        <ReactionBar onReact={onReact} onClose={onClose} />
      </div>

      <div className="py-1">
        <MenuItem icon={<MdOutlineReply size={16} />} label="Reply" onClick={() => { onReply(); onClose(); }} />
        <MenuItem icon={<MdContentCopy size={16} />} label="Copy" onClick={() => { onCopy(); onClose(); }} />
        <MenuItem icon={<MdForward size={16} />} label="Forward" onClick={() => { onForward(); onClose(); }} />
        <MenuItem icon={<MdStar size={16} />} label="Star message" onClick={() => { onStar(); onClose(); }} />
        {isMe && !message.isDeleted && (
          <MenuItem icon={<MdEdit size={16} />} label="Edit" onClick={() => { onEdit(); onClose(); }} />
        )}
        {isMe && !message.isDeleted && (
          <MenuItem icon={<MdDelete size={16} />} label="Delete for everyone" onClick={() => { onDelete(true); onClose(); }} className="text-error" />
        )}
        <MenuItem icon={<MdDelete size={16} />} label="Delete for me" onClick={() => { onDelete(false); onClose(); }} className="text-error" />
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, onClick, className = "" }) => (
  <button
    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-base-200 transition-colors text-left ${className}`}
    onClick={onClick}
  >
    <span className="text-base-content/60">{icon}</span>
    <span>{label}</span>
  </button>
);

// ── Read Ticks ─────────────────────────────────────────────────────────────────
const ReadTicks = ({ msg, authUserId }) => {
  if (msg.sender?._id !== authUserId) return null;
  if (msg.isDeleted) return null;
  if (msg.readBy?.length > 0) return <BsCheckAll size={14} className="text-blue-400 shrink-0" />;
  if (msg.deliveredTo?.length > 0) return <BsCheckAll size={14} className="text-base-content/40 shrink-0" />;
  return <BsCheck size={14} className="text-base-content/40 shrink-0" />;
};

// ── Attachment Renderer ─────────────────────────────────────────────────────────
const AttachmentRenderer = ({ attachment, onMediaClick }) => {
  if (attachment.type === "image") {
    return (
      <img
        src={attachment.url}
        alt={attachment.name || "Image"}
        onClick={() => onMediaClick && onMediaClick(attachment.url)}
        className="rounded-lg max-w-[220px] max-h-[220px] object-cover mt-1 cursor-pointer hover:opacity-90 transition-opacity"
        loading="lazy"
      />
    );
  }
  if (attachment.type === "video") {
    return (
      <div className="relative cursor-pointer mt-1 max-w-[260px] max-h-[180px] rounded-lg overflow-hidden" onClick={() => onMediaClick && onMediaClick(attachment.url)}>
        <video
          src={attachment.url}
          className="w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
          <FiPlay size={32} className="text-white drop-shadow-md" />
        </div>
      </div>
    );
  }
  if (attachment.type === "audio") {
    return <CustomAudioPlayer src={attachment.url} />;
  }
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 bg-base-200/50 rounded-lg px-3 py-2 mt-1 hover:bg-base-300/50 transition-colors max-w-[240px]"
    >
      <FiPaperclip size={18} className="shrink-0" />
      <span className="text-sm truncate">{attachment.name || "Document"}</span>
    </a>
  );
};

// ── Message Bubble ──────────────────────────────────────────────────────────────
const MessageBubble = ({ msg, isMe, isGroup, authUser, onContextMenu, onReact, onMediaClick }) => {
  const isDeleted = msg.isDeleted;
  const starredByMe = msg.starredBy?.some((id) => id === authUser._id || id?.toString() === authUser._id);

  const reactionGroups = (msg.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      id={`msg-${msg._id}`}
      className={`flex ${isMe ? "justify-end" : "justify-start"} group px-2`}
    >
      {/* Avatar for group non-me messages */}
      {!isMe && isGroup && (
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mr-2 mt-auto mb-1">
          <img
            src={msg.sender?.profilePic || `https://ui-avatars.com/api/?name=${msg.sender?.fullName}`}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className={`max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
        {/* Sender name (group) */}
        {!isMe && isGroup && (
          <span className="text-[11px] font-semibold text-primary ml-1 mb-0.5">
            {msg.sender?.fullName}
          </span>
        )}

        {/* Reply preview */}
        {msg.replyTo && !isDeleted && (
          <div
            className={`flex gap-2 mb-1 rounded-lg px-3 py-1.5 text-xs border-l-4 border-primary max-w-full cursor-pointer ${
              isMe ? "bg-primary/20 border-primary-content/30" : "bg-base-200 border-primary"
            }`}
            onClick={() => {
              const el = document.getElementById(`msg-${msg.replyTo._id}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <div className="min-w-0">
              <div className="font-semibold text-primary truncate">
                {msg.replyTo.sender?.fullName || "Unknown"}
              </div>
              <div className="truncate text-base-content/70">
                {msg.replyTo.content || (msg.replyTo.attachments?.length ? "📎 Attachment" : "")}
              </div>
            </div>
          </div>
        )}

        {/* Forwarded tag */}
        {msg.isForwarded && !isDeleted && (
          <span className="text-[10px] text-base-content/50 flex items-center gap-1 mb-0.5 italic">
            <MdForward size={12} /> Forwarded
          </span>
        )}

        {/* Bubble */}
        <div
          onContextMenu={(e) => onContextMenu(e, msg)}
          className={`relative px-3 py-2 rounded-2xl shadow-sm cursor-pointer select-text
            ${isMe
              ? "bg-primary text-primary-content rounded-br-sm"
              : "bg-base-100 text-base-content rounded-bl-sm border border-base-200"
            }
            ${isDeleted ? "opacity-60 italic" : ""}
          `}
        >
          {/* Attachments */}
          {!isDeleted && msg.attachments?.length > 0 && (
            <div className="mb-1">
              {msg.attachments.map((att, i) => (
                <AttachmentRenderer key={i} attachment={att} onMediaClick={onMediaClick} />
              ))}
            </div>
          )}

          {/* Text */}
          {msg.content && (
            <p className="text-[14.5px] leading-snug break-words whitespace-pre-wrap">
              {msg.content}
            </p>
          )}

          {/* Edited badge */}
          {msg.isEdited && !isDeleted && (
            <span className={`text-[10px] ${isMe ? "text-primary-content/60" : "text-base-content/40"} ml-1`}>
              (edited)
            </span>
          )}

          {/* Time + ticks */}
          <div className={`flex items-center gap-1 mt-0.5 justify-end`}>
            <span className={`text-[10px] ${isMe ? "text-primary-content/60" : "text-base-content/40"} whitespace-nowrap`}>
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {isMe && <ReadTicks msg={msg} authUserId={authUser._id} />}
            {starredByMe && <BsFillStarFill size={10} className={isMe ? "text-yellow-300" : "text-yellow-500"} />}
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(reactionGroups).length > 0 && (
          <div
            className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}
          >
            {Object.entries(reactionGroups).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact(msg._id, emoji)}
                className="flex items-center gap-0.5 bg-base-200 border border-base-300 rounded-full px-1.5 py-0.5 text-xs hover:bg-base-300 transition-colors"
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-base-content/60">{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = ({ typingList, isGroup }) => {
  if (!typingList || typingList.length === 0) return null;

  let label;
  if (isGroup) {
    const names = typingList.map((t) => t.userName?.split(" ")[0]).join(", ");
    label = `${names} ${typingList.length === 1 ? "is" : "are"} typing…`;
  } else {
    label = "typing…";
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-[11px] text-primary font-medium">{label}</span>
    </div>
  );
};

// ── Main Chatting Component ────────────────────────────────────────────────────
const Chatting = ({ selectedUser, onBack }) => {
  const [content, setContent] = useState("");
  const {
    messages, fetchMessages, sendMessage, uploadAttachment, messagesLoading,
    editMessage, deleteMessage, reactToMessage, starMessage, searchMessages,
    loadMoreMessages, messagesPagination, markAsRead, chats,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { socket, onlineUsers, typingUsers, playNotificationSound } = useSocket();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typing, setTyping] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState(null);

  const allMedia = React.useMemo(() => {
    const media = [];
    messages.forEach((msg) => {
      msg.attachments?.forEach((att) => {
        if (att.type === 'image' || att.type === 'video') {
          media.push(att);
        }
      });
    });
    return media;
  }, [messages]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, message }
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [outgoingCallType, setOutgoingCallType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const photoVideoInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const isSendingRef = useRef(false);

  const clearFileInputs = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
    if (photoVideoInputRef.current) photoVideoInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const contactsList = React.useMemo(() => {
    const list = [];
    const seen = new Set();
    chats?.forEach((c) => {
      c.users?.forEach((u) => {
        if (String(u._id) !== String(authUser?._id) && !seen.has(String(u._id))) {
          seen.add(String(u._id));
          list.push(u);
        }
      });
    });
    return list;
  }, [chats, authUser]);

  const handleSendCustomMessage = async (customContent) => {
    if (!customContent?.trim()) return;
    try {
      await sendMessage(customContent.trim(), chatId, []);
      playNotificationSound("send");
      scrollToBottom();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send");
    }
  };

  const attachmentOptions = [
    {
      id: "document",
      label: "Document",
      icon: <IoDocumentText size={20} className="text-[#8b5cf6]" />,
      action: () => documentInputRef.current?.click(),
    },
    {
      id: "photos_videos",
      label: "Photos & videos",
      icon: <IoImages size={20} className="text-[#0284c7]" />,
      action: () => photoVideoInputRef.current?.click(),
    },
    {
      id: "camera",
      label: "Camera",
      icon: <IoCamera size={20} className="text-[#ec4899]" />,
      action: () => cameraInputRef.current?.click(),
    },
    {
      id: "audio",
      label: "Audio",
      icon: <IoHeadset size={20} className="text-[#f97316]" />,
      action: () => audioInputRef.current?.click(),
    },
    {
      id: "contact",
      label: "Contact",
      icon: <IoPerson size={20} className="text-[#06b6d4]" />,
      action: () => setShowContactModal(true),
    },
    {
      id: "poll",
      label: "Poll",
      icon: <IoBarChart size={20} className="text-[#eab308]" />,
      action: () => setShowPollModal(true),
    },
    {
      id: "event",
      label: "Event",
      icon: <IoCalendar size={20} className="text-[#f43f5e]" />,
      action: () => setShowEventModal(true),
    },
    {
      id: "sticker",
      label: "New sticker",
      icon: <IoSparkles size={20} className="text-[#10b981]" />,
      action: () => setShowEmojiPicker(true),
    },
  ];

  const chatId = selectedUser?._id;

  // Chat meta
  const chatName = selectedUser?.isGroupChat
    ? selectedUser?.groupName
    : selectedUser?.users?.find((u) => String(u._id) !== String(authUser._id))?.fullName;

  const chatPic = selectedUser?.isGroupChat
    ? selectedUser?.groupAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName || "G")}&background=7c3aed&color=fff`
    : selectedUser?.users?.find((u) => String(u._id) !== String(authUser._id))?.profilePic;

  const otherUser = !selectedUser?.isGroupChat
    ? selectedUser?.users?.find((u) => String(u._id) !== String(authUser._id))
    : null;

  const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;
  const currentTypers = typingUsers[chatId] || [];
  const isTyping = currentTypers.length > 0;

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId, 1);
      markAsRead(chatId);
      socket?.emit("join-chat", chatId);
    }
    return () => {
      if (chatId) socket?.emit("leave-chat", chatId);
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ── Scroll ────────────────────────────────────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollToBottom(distFromBottom > 300);

    // Load more when scrolled to top
    if (el.scrollTop < 60 && messagesPagination.hasMore && !messagesLoading) {
      const prevScrollHeight = el.scrollHeight;
      loadMoreMessages().then(() => {
        // Maintain scroll position
        el.scrollTop = el.scrollHeight - prevScrollHeight;
      });
    }
  };

  // ── Typing ────────────────────────────────────────────────────────────────
  const handleTypingChange = (e) => {
    setContent(e.target.value);
    if (!socket || !chatId) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", { chatId, userId: authUser._id, userName: authUser.fullName });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { chatId, userId: authUser._id });
      setTyping(false);
    }, 2000);
  };

  // ── File / Attachment ─────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_MEDIA_SIZE = 5 * 1024 * 1024; // 5 MB
    const isImageOrVideo = file.type.startsWith("image/") || file.type.startsWith("video/");
    if (isImageOrVideo && file.size > MAX_MEDIA_SIZE) {
      toast.error("Image and video size must be 5 MB or less");
      clearFileInputs();
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setFilePreview({ type: "image", url: URL.createObjectURL(file) });
    } else if (file.type.startsWith("video/")) {
      setFilePreview({ type: "video", name: file.name });
    } else if (file.type.startsWith("audio/")) {
      setFilePreview({ type: "audio", name: file.name });
    } else {
      setFilePreview({ type: "document", name: file.name });
    }
  };

  // ── Voice Recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
        setRecordedAudio({ file: audioFile, url: URL.createObjectURL(audioBlob) });
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
    }
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();

    if (isUploading || isSendingRef.current) return;

    if (editingMessage) {
      if (!content.trim()) return;
      try {
        await editMessage(editingMessage._id, content);
        setEditingMessage(null);
        setContent("");
        toast.success("Message edited");
      } catch {
        toast.error("Failed to edit message");
      }
      return;
    }

    if (!content.trim() && !recordedAudio && !selectedFile) return;

    if (selectedFile) {
      const isImageOrVideo = selectedFile.type.startsWith("image/") || selectedFile.type.startsWith("video/");
      if (isImageOrVideo && selectedFile.size > 5 * 1024 * 1024) {
        toast.error("Image and video size must be 5 MB or less");
        return;
      }
    }

    isSendingRef.current = true;
    socket?.emit("stop-typing", { chatId, userId: authUser._id });
    setTyping(false);

    try {
      setIsUploading(true);
      let attachments = [];

      if (recordedAudio) {
        const att = await uploadAttachment(recordedAudio.file);
        attachments.push(att);
      }
      if (selectedFile) {
        const att = await uploadAttachment(selectedFile);
        attachments.push(att);
      }

      await sendMessage(content, chatId, attachments, replyTo);
      playNotificationSound("send");

      setContent("");
      setRecordedAudio(null);
      setSelectedFile(null);
      setFilePreview(null);
      setReplyTo(null);
      clearFileInputs();
      inputRef.current?.focus();
      scrollToBottom();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to send message");
    } finally {
      setIsUploading(false);
      isSendingRef.current = false;
    }
  };

  // ── Context Menu ──────────────────────────────────────────────────────────
  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    if (msg.isDeleted) return;
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 300);
    setContextMenu({ x, y, message: msg });
  };

  // ── Message Actions ───────────────────────────────────────────────────────
  const handleReply = (msg) => {
    setReplyTo(msg);
    inputRef.current?.focus();
  };

  const handleEdit = (msg) => {
    setEditingMessage(msg);
    setContent(msg.content);
    inputRef.current?.focus();
  };

  const handleDelete = async (msg, forEveryone) => {
    if (!confirm(forEveryone ? "Delete for everyone?" : "Delete for you?")) return;
    try {
      await deleteMessage(msg._id, forEveryone);
      toast.success(forEveryone ? "Deleted for everyone" : "Deleted for you");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleCopy = (msg) => {
    navigator.clipboard.writeText(msg.content || "");
    toast.success("Copied to clipboard");
  };

  const handleStar = async (msg) => {
    await starMessage(msg._id);
    toast.success("Message starred");
  };

  const handleForward = (msg) => {
    // Simple: copy text to clipboard
    navigator.clipboard.writeText(msg.content || "");
    toast.success("Message copied (forward manually)");
  };

  const handleReact = async (messageId, emoji) => {
    await reactToMessage(messageId, emoji);
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = async (q) => {
    if (!q.trim() || !chatId) return setSearchResults([]);
    const results = await searchMessages(chatId, q);
    setSearchResults(Array.isArray(results) ? results : []);
  };

  // ── Emoji ────────────────────────────────────────────────────────────────
  const handleEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // ── Group typing label ────────────────────────────────────────────────────
  const onlineSubtitle = () => {
    if (isTyping) return null; // handled separately
    if (selectedUser?.isGroupChat) {
      return `${selectedUser.users?.length || 0} members`;
    }
    if (isOnline) return "online";
    if (otherUser) {
      const ls = otherUser.lastSeen;
      if (ls) return `last seen ${new Date(ls).toLocaleString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}`;
    }
    return "offline";
  };

  // ── Date separator logic ──────────────────────────────────────────────────
  const shouldShowDate = (messages, idx) => {
    if (idx === 0) return true;
    const curr = new Date(messages[idx].createdAt);
    const prev = new Date(messages[idx - 1].createdAt);
    return curr.toDateString() !== prev.toDateString();
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden">
      {/* ── Call overlays ─────────────────────────────────────────────────── */}
      {outgoingCallType === "video" && (
        <VideoCall
          authUser={authUser}
          calleeId={otherUser?._id}
          calleeName={chatName}
          isReceiving={false}
          onEndCall={() => setOutgoingCallType(null)}
        />
      )}
      {outgoingCallType === "audio" && (
        <AudioCall
          authUser={authUser}
          calleeId={otherUser?._id}
          calleeName={chatName}
          isReceiving={false}
          onEndCall={() => setOutgoingCallType(null)}
        />
      )}

      {/* ── Chat Info Panel ──────────────────────────────────────────────── */}
      {showChatInfo && (
        <ChatInfoPanel
          chat={selectedUser}
          onClose={() => setShowChatInfo(false)}
          authUser={authUser}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-base-100 border-b border-base-300 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-base-200 rounded-full transition-colors md:hidden"
            >
              <FiArrowLeft size={20} />
            </button>
          )}
          <button onClick={() => setShowChatInfo(true)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img src={chatPic || null} alt={chatName} className="w-full h-full object-cover" />
              </div>
              {isOnline && !selectedUser?.isGroupChat && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success border-2 border-base-100 rounded-full" />
              )}
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm leading-tight">{chatName}</div>
              <div className="text-[11px] text-base-content/50 leading-tight">
                {isTyping ? (
                  <span className="text-primary font-medium">
                    <TypingIndicator typingList={currentTypers} isGroup={selectedUser?.isGroupChat} />
                  </span>
                ) : onlineSubtitle()}
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/60 hover:text-base-content"
          >
            <FiSearch size={18} />
          </button>
          {!selectedUser?.isGroupChat && (
            <>
              <button
                onClick={() => setOutgoingCallType("video")}
                className="p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/60 hover:text-base-content flex items-center justify-center"
                title="Video Call"
              >
                <FiVideo size={18} />
              </button>
              <button
                onClick={() => setOutgoingCallType("audio")}
                className="p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/60 hover:text-base-content flex items-center justify-center"
                title="Voice Call"
              >
                <FiPhone size={18} />
              </button>
            </>
          )}
          <button
            onClick={() => setShowChatInfo(true)}
            className="p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/60 hover:text-base-content"
          >
            <FiMoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* ── Search Bar ───────────────────────────────────────────────────── */}
      {showSearch && (
        <div className="px-3 py-2 bg-base-200 border-b border-base-300 flex items-center gap-2 shrink-0">
          <FiSearch size={16} className="text-base-content/50 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search messages..."
            className="flex-1 bg-transparent outline-none text-sm"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
          />
          <button onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}>
            <FiX size={16} className="text-base-content/50" />
          </button>
        </div>
      )}

      {/* ── Search Results ────────────────────────────────────────────────── */}
      {showSearch && searchQuery && (
        <div className="absolute top-[4.5rem] left-0 right-0 z-50 bg-base-100 border-b border-base-300 max-h-64 overflow-y-auto shadow-lg">
          {searchResults.length > 0 ? (
            searchResults.map((msg) => (
              <div
                key={msg._id}
                className="px-4 py-3 hover:bg-base-200 cursor-pointer border-b border-base-300/50"
                onClick={() => {
                  const el = document.getElementById(`msg-${msg._id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    el.classList.add("ring-2", "ring-primary");
                    setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 2000);
                  }
                  setShowSearch(false);
                }}
              >
                <div className="text-xs text-base-content/50 mb-1">{msg.sender?.fullName}</div>
                <div className="text-sm truncate">{msg.content}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-base-content/50">No messages found</div>
          )}
        </div>
      )}

      {/* ── Messages Area ────────────────────────────────────────────────── */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-3 space-y-1"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        {messagesLoading && (
          <div className="flex flex-col gap-4 py-4 px-4 w-full">
            <div className="chat chat-start opacity-60 animate-pulse w-full">
              <div className="chat-image avatar"><div className="w-8 rounded-full bg-base-300"></div></div>
              <div className="chat-bubble bg-base-300/50 w-48 h-10"></div>
            </div>
            <div className="chat chat-end opacity-60 animate-pulse w-full">
              <div className="chat-bubble bg-primary/20 w-64 h-12"></div>
            </div>
            <div className="chat chat-start opacity-60 animate-pulse w-full">
              <div className="chat-image avatar"><div className="w-8 rounded-full bg-base-300"></div></div>
              <div className="chat-bubble bg-base-300/50 w-32 h-10"></div>
            </div>
          </div>
        )}

        {!messagesLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-base-content/40">
            <div className="w-16 h-16 rounded-full bg-base-300/50 flex items-center justify-center mb-4">
              <FiMessageSquare size={28} className="text-base-content/30" />
            </div>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation.</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = String(msg.sender?._id) === String(authUser._id);
          return (
            <React.Fragment key={msg._id}>
              {shouldShowDate(messages, idx) && <DateSeparator date={msg.createdAt} />}
              <MessageBubble
                msg={msg}
                isMe={isMe}
                isGroup={selectedUser?.isGroupChat}
                authUser={authUser}
                onContextMenu={handleContextMenu}
                onReact={handleReact}
                onMediaClick={(url) => setSelectedMediaUrl(url)}
              />
            </React.Fragment>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Typing indicator ──────────────────────────────────────────────── */}
      {isTyping && (
        <div className="px-4 py-1 shrink-0">
          <TypingIndicator typingList={currentTypers} isGroup={selectedUser?.isGroupChat} />
        </div>
      )}

      {/* ── Scroll to bottom button ───────────────────────────────────────── */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-4 w-10 h-10 bg-base-100 border border-base-300 shadow-lg rounded-full flex items-center justify-center hover:bg-base-200 transition-colors z-20"
        >
          <FiChevronDown size={20} />
        </button>
      )}

      {/* ── Context Menu ──────────────────────────────────────────────────── */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          message={contextMenu.message}
          isMe={String(contextMenu.message.sender?._id) === String(authUser._id)}
          onClose={() => setContextMenu(null)}
          onReply={() => handleReply(contextMenu.message)}
          onEdit={() => handleEdit(contextMenu.message)}
          onDelete={(forEveryone) => handleDelete(contextMenu.message, forEveryone)}
          onCopy={() => handleCopy(contextMenu.message)}
          onStar={() => handleStar(contextMenu.message)}
          onForward={() => handleForward(contextMenu.message)}
          onReact={(emoji) => handleReact(contextMenu.message._id, emoji)}
        />
      )}

      {/* ── Composer ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-base-100 border-t border-base-300 pb-[env(safe-area-inset-bottom,0px)]">
        {/* Edit Banner */}
        {editingMessage && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-b border-primary/20">
            <MdEdit size={16} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-primary">Editing message</span>
              <p className="text-xs text-base-content/60 truncate">{editingMessage.content}</p>
            </div>
            <button onClick={() => { setEditingMessage(null); setContent(""); }} className="shrink-0">
              <FiX size={16} className="text-base-content/50 hover:text-base-content" />
            </button>
          </div>
        )}

        {/* Reply Banner */}
        {replyTo && !editingMessage && (
          <div className="flex items-center gap-2 px-4 py-2 bg-base-200 border-b border-base-300">
            <MdOutlineReply size={16} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0 border-l-2 border-primary pl-2">
              <span className="text-xs font-semibold text-primary block">{replyTo.sender?.fullName}</span>
              <p className="text-xs text-base-content/60 truncate">
                {replyTo.content || (replyTo.attachments?.length ? "📎 Attachment" : "")}
              </p>
            </div>
            <button onClick={() => setReplyTo(null)} className="shrink-0">
              <FiX size={16} className="text-base-content/50 hover:text-base-content" />
            </button>
          </div>
        )}

        {/* File Preview */}
        {filePreview && (
          <div className="flex items-center gap-3 px-4 py-2 bg-base-200 border-b border-base-300">
            <div className="relative">
              {filePreview.type === "image" ? (
                <img src={filePreview.url} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
              ) : (
                <div className="h-14 w-14 bg-base-300 rounded-lg flex flex-col items-center justify-center gap-1">
                  <FiPaperclip size={20} className="text-base-content/50" />
                  <span className="text-[10px] text-base-content/50 uppercase">
                    {filePreview.type}
                  </span>
                </div>
              )}
            </div>
            {filePreview.name && (
              <span className="text-sm truncate max-w-[200px] text-base-content/70">{filePreview.name}</span>
            )}
            <button
              onClick={() => { setSelectedFile(null); setFilePreview(null); clearFileInputs(); }}
              className="ml-auto p-1.5 hover:bg-base-300 rounded-full"
            >
              <FiTrash size={16} className="text-error" />
            </button>
          </div>
        )}

        {/* Voice Preview */}
        {recordedAudio && (
          <div className="flex items-center gap-2 px-4 py-2 bg-base-200 border-b border-base-300">
            <CustomAudioPlayer src={recordedAudio.url} />
            <button onClick={() => setRecordedAudio(null)} className="ml-2 p-1.5 hover:bg-base-300 rounded-full">
              <FiTrash size={16} className="text-error" />
            </button>
          </div>
        )}

        {/* Main Input Row */}
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Emoji */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-full transition-colors"
            >
              <FiSmile size={22} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} theme="auto" height={380} width={320} />
              </div>
            )}
          </div>

          {/* Attachment Menu Popup */}
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={documentInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={photoVideoInputRef}
              className="hidden"
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={cameraInputRef}
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={audioInputRef}
              className="hidden"
              accept="audio/*"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => {
                setShowAttachmentMenu((prev) => !prev);
                setShowEmojiPicker(false);
              }}
              className={`p-2 rounded-full transition-colors ${
                showAttachmentMenu
                  ? "bg-primary text-primary-content"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-200"
              }`}
              title="Attach"
            >
              <FiPaperclip size={20} />
            </button>

            {/* Popup Menu */}
            {showAttachmentMenu && (
              <div className="absolute bottom-12 left-0 z-50 w-52 py-2 bg-base-100/95 backdrop-blur-md rounded-2xl shadow-2xl border border-base-300 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
                {attachmentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      opt.action();
                    }}
                    className="flex items-center gap-3.5 px-4 py-2 hover:bg-base-200 text-left transition-colors cursor-pointer group"
                  >
                    <span className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                      {opt.icon}
                    </span>
                    <span className="text-[14px] font-medium text-base-content/90 group-hover:text-base-content">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text Input */}
          <div className="flex-1 bg-base-200 rounded-full px-4 py-2 flex items-center min-h-[44px]">
            <input
              ref={inputRef}
              type="text"
              placeholder={editingMessage ? "Edit message..." : "Type a message"}
              className="flex-1 bg-transparent outline-none text-sm"
              value={content}
              onChange={handleTypingChange}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
            />
          </div>

          {/* Send / Mic */}
          {content.trim() || recordedAudio || selectedFile ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={isUploading}
              className="w-11 h-11 bg-primary text-primary-content rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
            >
              {isUploading ? (
                <div className="loading loading-spinner loading-xs" />
              ) : (
                <FiSend size={18} />
              )}
            </button>
          ) : isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="w-11 h-11 bg-error text-white rounded-full flex items-center justify-center animate-pulse"
            >
              <BsStopCircle size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="w-11 h-11 bg-primary text-primary-content rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-md"
            >
              <BsMicFill size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ── Click outside to close emoji / attachment menu ─────────────────── */}
      {(showEmojiPicker || showAttachmentMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowEmojiPicker(false);
            setShowAttachmentMenu(false);
          }}
        />
      )}

      {/* Attachment Modals */}
      <PollModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        onSendPoll={handleSendCustomMessage}
      />
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSendContact={handleSendCustomMessage}
        contacts={contactsList}
      />
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSendEvent={handleSendCustomMessage}
      />

      {/* Media Viewer Modal */}
      {selectedMediaUrl && (
        <MediaViewerModal
          mediaList={allMedia}
          initialIndex={allMedia.findIndex(m => m.url === selectedMediaUrl)}
          onClose={() => setSelectedMediaUrl(null)}
        />
      )}
    </div>
  );
};

export default Chatting;
