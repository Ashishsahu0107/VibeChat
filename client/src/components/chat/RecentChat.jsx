import React, { useState, useEffect, useRef } from "react";
import {
  FiSearch, FiPlus, FiUsers, FiX, FiCheck,
  FiBell, FiBellOff, FiArchive, FiTrash2, 
} from "react-icons/fi";
import { BsChatDotsFill, BsPinAngle } from "react-icons/bs";
import useAuthStore from "../../store/useAuthStore";
import useChatStore from "../../store/useChatStore";
import { useSocket } from "../../context/SocketContext";
import api from "../../config/api";
import toast from "react-hot-toast";

// ── New Chat Modal ─────────────────────────────────────────────────────────────
const NewChatModal = ({ onClose, onSelectChat }) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { accessChat } = useChatStore();
  const debounceRef = useRef(null);

  const handleSearch = (q) => {
    setSearch(q);
    if (!q.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users?search=${encodeURIComponent(q.trim())}`);
        setUsers(res.data || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const handleStartChat = async (userId) => {
    try {
      const chat = await accessChat(userId);
      onSelectChat(chat);
      onClose();
    } catch {
      toast.error("Failed to start chat");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-sm overflow-hidden border border-white/20 shadow-2xl shadow-blue-950/50 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <h3 className="font-bold text-white flex-1 text-base">Start New Chat</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="px-5 py-3">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              autoFocus
              type="text"
              placeholder="Search by name or email..."
              className="glass-input text-xs w-full pl-9 pr-3 py-2.5"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto px-3 pb-3 space-y-1">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          )}
          {!loading && users.length === 0 && search && (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">No users found</div>
          )}
          {!loading && !search && (
            <div className="text-center py-8 text-xs text-slate-400">Search for a user to start chatting</div>
          )}
          {users.map((u) => (
            <div
              key={u._id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] cursor-pointer transition-colors border border-transparent hover:border-white/[0.06]"
              onClick={() => handleStartChat(u._id)}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/15">
                <img src={u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-white">{u.fullName}</div>
                <div className="text-xs text-slate-400 truncate">{u.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── New Group Modal (Figma Screen 23: Create Group) ───────────────────────────
const NewGroupModal = ({ onClose, onSelectChat }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { createGroup } = useChatStore();
  const debounceRef = useRef(null);

  const handleSearch = (q) => {
    setSearch(q);
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users?search=${encodeURIComponent(q.trim())}`);
        setAllUsers(res.data || []);
      } catch {
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  useEffect(() => {
    handleSearch("");
  }, []);

  const toggleUser = (u) => {
    setSelectedUsers((prev) =>
      prev.find((x) => x._id === u._id)
        ? prev.filter((x) => x._id !== u._id)
        : [...prev, u],
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return toast.error("Group name is required");
    if (selectedUsers.length < 1) return toast.error("Please add at least 1 member");
    setCreating(true);
    try {
      const group = await createGroup(groupName, selectedUsers, groupDesc);
      onSelectChat(group);
      onClose();
      toast.success("Group created successfully!");
    } catch {
      toast.error("Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[32px] bg-[#12111A] border border-white/10 shadow-2xl shadow-purple-950/60 overflow-hidden font-sans text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-bold text-white text-base">Create Group</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Group Avatar Placeholder (Screen 23) */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#1E1B2E] border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-900/30">
                <FiUsers size={32} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-md">
                <FiCheck size={13} />
              </div>
            </div>
          </div>

          {/* Group Name input */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">
              Group Name
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Friends Group"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder:text-gray-400 text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Add Members section (Screen 23: Add Members (x/256)) */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-2">
              <span>Add Members</span>
              <span className="text-[#A78BFA] font-mono">({selectedUsers.length}/256)</span>
            </div>

            {/* Search participant */}
            <div className="relative mb-2">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search contact..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-gray-500 text-xs focus:outline-none focus:border-[#7C3AED]"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* List with Checkbox */}
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {allUsers.map((u) => {
                const isSelected = selectedUsers.some((x) => x._id === u._id);
                return (
                  <div
                    key={u._id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-white"
                        : "hover:bg-white/[0.05] text-gray-200 border border-transparent"
                    }`}
                    onClick={() => toggleUser(u)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-purple-400/20">
                        <img
                          src={
                            u.profilePic ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              u.fullName || "User",
                            )}&background=7c3aed&color=fff`
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-medium truncate">{u.fullName}</span>
                    </div>

                    {/* Purple checkbox (Figma Screen 23) */}
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#7C3AED] text-white shadow-xs"
                          : "border border-gray-600 bg-white/[0.04]"
                      }`}
                    >
                      {isSelected && <FiCheck size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create Group Solid Purple Pill Button */}
          <button
            onClick={handleCreate}
            disabled={creating || !groupName.trim() || selectedUsers.length < 1}
            className="w-full py-3 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center cursor-pointer disabled:opacity-50 text-xs sm:text-sm mt-2"
          >
            {creating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Chat Context Menu ──────────────────────────────────────────────────────────
const ChatContextMenu = ({ chat, userState, x, y, onClose, onAction }) => {
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
      className="fixed z-[200] glass-panel border border-white/15 rounded-2xl shadow-2xl w-48 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style={{ top: y, left: Math.min(x, window.innerWidth - 200) }}
    >
      <CMenuBtn
        icon={<BsPinAngle size={14} />}
        label={userState?.isPinned ? "Unpin Chat" : "Pin Chat"}
        onClick={() => {
          onAction("pin");
          onClose();
        }}
      />
      <CMenuBtn
        icon={
          userState?.isMuted ? <FiBellOff size={14} /> : <FiBell size={14} />
        }
        label={userState?.isMuted ? "Unmute Notifications" : "Mute Notifications"}
        onClick={() => {
          onAction("mute");
          onClose();
        }}
      />
      <CMenuBtn
        icon={<FiArchive size={14} />}
        label={userState?.isArchived ? "Unarchive Chat" : "Archive Chat"}
        onClick={() => {
          onAction("archive");
          onClose();
        }}
      />
      <div className="my-1 border-t border-white/10" />
      <CMenuBtn
        icon={<FiTrash2 size={14} />}
        label="Clear Messages"
        onClick={() => {
          onAction("clear");
          onClose();
        }}
        className="text-amber-400 hover:text-amber-300"
      />
      <CMenuBtn
        icon={<FiTrash2 size={14} />}
        label={chat.isGroupChat ? "Leave Group" : "Delete Chat"}
        onClick={() => {
          onAction("delete");
          onClose();
        }}
        className="text-rose-400 hover:text-rose-300"
      />
    </div>
  );
};

const CMenuBtn = ({ icon, label, onClick, className = "" }) => (
  <button
    className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium hover:bg-white/[0.08] transition-colors text-left text-slate-200 cursor-pointer ${className}`}
    onClick={onClick}
  >
    <span className="shrink-0">{icon}</span>
    <span>{label}</span>
  </button>
);

// ── Main RecentChat Component ─────────────────────────────────────────────────
const RecentChat = ({ selectedUser, onSelectUser }) => {
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [filterTab, setFilterTab] = useState("all"); // "all", "unread", "groups"

  const { authUser } = useAuthStore();
  const { onlineUsers } = useSocket();
  const { chats, fetchChats, updateChatState, deleteChat } = useChatStore();

  useEffect(() => {
    fetchChats();
  }, []);

  const filteredChats = chats
    .filter((chat) => {
      const chatName = chat.isGroupChat
        ? chat.groupName
        : chat.users?.find((u) => String(u._id) !== String(authUser._id))
            ?.fullName;
      const matchesSearch = chatName
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const userState = chat.userStates?.find(
        (s) =>
          s.userId?.toString() === authUser._id.toString() ||
          s.userId === authUser._id,
      );
      const isArchived = userState?.isArchived;

      if (matchesSearch && (showArchived ? isArchived : !isArchived)) {
        if (filterTab === "unread") {
          return (userState?.unreadCount || 0) > 0;
        }
        if (filterTab === "groups") {
          return Boolean(chat.isGroupChat);
        }
        if (filterTab === "pinned") {
          return Boolean(userState?.isPinned);
        }
        return true;
      }
      return false;
    })
    .sort((a, b) => {
      const getUserState = (chat) =>
        chat.userStates?.find(
          (s) =>
            s.userId?.toString() === authUser._id.toString() ||
            s.userId === authUser._id,
        );
      const aState = getUserState(a);
      const bState = getUserState(b);
      if (aState?.isPinned && !bState?.isPinned) return -1;
      if (!aState?.isPinned && bState?.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  const archivedCount = chats.filter((c) => {
    const s = c.userStates?.find(
      (s) =>
        s.userId?.toString() === authUser._id.toString() ||
        s.userId === authUser._id,
    );
    return s?.isArchived;
  }).length;

  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    const y = Math.min(e.clientY, window.innerHeight - 200);
    setContextMenu({ chat, x: e.clientX, y });
  };

  const handleContextAction = async (chat, action) => {
    const userState = chat.userStates?.find(
      (s) =>
        s.userId?.toString() === authUser._id.toString() ||
        s.userId === authUser._id,
    );
    try {
      switch (action) {
        case "pin":
          await updateChatState(chat._id, { isPinned: !userState?.isPinned });
          break;
        case "mute":
          await updateChatState(chat._id, { isMuted: !userState?.isMuted });
          break;
        case "archive":
          await updateChatState(chat._id, {
            isArchived: !userState?.isArchived,
          });
          break;
        case "clear":
          if (confirm("Clear all messages in this conversation?"))
            await updateChatState(chat._id, { clearChat: true });
          break;
        case "delete":
          if (confirm(chat.isGroupChat ? "Leave group conversation?" : "Delete this conversation?")) {
            await deleteChat(chat._id);
          }
          break;
      }
      fetchChats();
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="flex flex-col h-full w-full select-none">
      {/* Header */}
      <div className="p-4 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Chats</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-200">
              {filteredChats.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowNewGroup(true)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="New Group"
            >
              <FiUsers size={16} />
            </button>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#8B5CF6] text-white shadow-md shadow-purple-600/30 border border-purple-400/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="New Chat"
            >
              <FiPlus size={17} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            className="glass-input text-xs w-full pl-9 pr-3 py-2.5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Tabs: All | Unread | Groups | Pinned (Screens 10 & 48) */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-0.5">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "groups", label: "Groups" },
            { id: "pinned", label: "Pinned" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterTab === tab.id
                  ? "bg-[#7C3AED] text-white shadow-md shadow-purple-600/35"
                  : "bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Archived toggle */}
      {archivedCount > 0 && (
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors border-b border-white/10 cursor-pointer ${
            showArchived 
              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" 
              : "hover:bg-white/[0.04] text-slate-400"
          }`}
        >
          <FiArchive size={13} />
          <span>Archived Conversations</span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-300">
            {archivedCount}
          </span>
        </button>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400/60">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-3">
              <BsChatDotsFill size={28} className="opacity-40 text-cyan-400" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No conversations yet</p>
            <p className="text-xs text-slate-500 mt-1">Click the + button to start a chat</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherUser = chat.isGroupChat
              ? null
              : chat.users?.find((u) => String(u._id) !== String(authUser._id));
            const chatName = chat.isGroupChat
              ? chat.groupName
              : otherUser?.fullName;
            const chatPic = chat.isGroupChat
              ? chat.groupAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName || "G")}&background=7c3aed&color=fff`
              : otherUser?.profilePic ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName || "U")}`;
            const isOnline = otherUser
              ? onlineUsers.includes(otherUser._id)
              : false;
            const userState = chat.userStates?.find(
              (s) =>
                s.userId?.toString() === authUser._id.toString() ||
                s.userId === authUser._id,
            );
            const unreadCount = userState?.unreadCount || 0;
            const isPinned = userState?.isPinned;
            const isMuted = userState?.isMuted;

            const isSelected = selectedUser?._id === chat._id;

            const lastMessage = chat.latestMessage;
            const lastMsgText = lastMessage
              ? lastMessage.sender?._id === authUser._id
                ? `You: ${lastMessage.content || (lastMessage.attachments?.length ? "📎 Attachment" : "")}`
                : lastMessage.content ||
                  (lastMessage.attachments?.length ? "📎 Attachment" : "")
              : "Start chatting";

            return (
              <div
                key={chat._id}
                onContextMenu={(e) => handleContextMenu(e, chat)}
                onClick={() => onSelectUser(chat)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-150 border ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-600/25 via-purple-600/20 to-transparent border-cyan-500/40 shadow-lg shadow-black/20"
                    : "border-transparent hover:bg-white/[0.05] hover:border-white/[0.05]"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-2xl overflow-hidden border ${isSelected ? 'border-cyan-400/50 ring-2 ring-cyan-500/20' : 'border-white/15'}`}>
                    <img
                      src={chatPic}
                      alt={chatName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isOnline && !chat.isGroupChat && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0c1324] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isPinned && (
                        <BsPinAngle
                          size={12}
                          className="text-cyan-400 shrink-0 rotate-45"
                        />
                      )}
                      <span className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {chatName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 shrink-0">
                      {lastMessage
                        ? new Date(lastMessage.createdAt).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate flex-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {lastMsgText}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isMuted && (
                        <FiBellOff size={12} className="text-slate-500" />
                      )}
                      {unreadCount > 0 && (
                        <div
                          className={`min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isMuted 
                              ? "bg-slate-700 text-slate-300" 
                              : "bg-[#7C3AED] text-white shadow-md shadow-purple-600/35"
                          }`}
                        >
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ChatContextMenu
          chat={contextMenu.chat}
          userState={contextMenu.chat.userStates?.find(
            (s) => s.userId?.toString() === authUser._id.toString(),
          )}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAction={(action) => handleContextAction(contextMenu.chat, action)}
        />
      )}

      {/* Modals */}
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onSelectChat={(chat) => {
            onSelectUser(chat);
            setShowNewChat(false);
          }}
        />
      )}
      {showNewGroup && (
        <NewGroupModal
          onClose={() => setShowNewGroup(false)}
          onSelectChat={(chat) => {
            onSelectUser(chat);
            setShowNewGroup(false);
          }}
        />
      )}
    </div>
  );
};

export default RecentChat;
