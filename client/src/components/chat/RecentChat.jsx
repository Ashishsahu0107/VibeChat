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

  const handleSearch = async (q) => {
    setSearch(q);
    if (!q.trim()) return setUsers([]);
    setLoading(true);
    try {
      const res = await api.get(`/users?search=${q}`);
      setUsers(res.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
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

// ── New Group Modal ────────────────────────────────────────────────────────────
const NewGroupModal = ({ onClose, onSelectChat }) => {
  const [step, setStep] = useState(1); // 1: name, 2: members
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { createGroup } = useChatStore();

  const handleSearch = async (q) => {
    setSearch(q);
    setLoading(true);
    try {
      const res = await api.get(`/users?search=${q}`);
      setAllUsers(res.data || []);
    } catch {
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
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
    if (!groupName.trim()) return toast.error("Group name required");
    if (selectedUsers.length < 1) return toast.error("Add at least 1 member");
    setCreating(true);
    try {
      const group = await createGroup(groupName, selectedUsers, groupDesc);
      onSelectChat(group);
      onClose();
      toast.success("Group created!");
    } catch {
      toast.error("Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-sm overflow-hidden border border-white/20 shadow-2xl shadow-purple-950/50 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <h3 className="font-bold text-white flex-1 text-base">Create New Group</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {step === 1 && (
          <div className="px-5 py-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block mb-1.5">
                Group Name *
              </label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Design Systems, Team Vibe"
                className="glass-input text-xs w-full px-3.5 py-2.5"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block mb-1.5">
                Description (optional)
              </label>
              <textarea
                placeholder="What's this group about?"
                className="glass-input text-xs w-full px-3.5 py-2.5 resize-none block"
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                rows={2}
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!groupName.trim()}
              className="btn-glow w-full py-2.5 text-xs font-semibold mt-2"
            >
              Next: Select Members
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
                {selectedUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 text-xs rounded-full px-2.5 py-0.5"
                  >
                    <span>{u.fullName.split(" ")[0]}</span>
                    <button onClick={() => toggleUser(u)} className="hover:text-white cursor-pointer">
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="px-4 py-2.5">
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search participants..."
                  className="glass-input text-xs w-full pl-9 pr-3 py-2"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto px-3 space-y-1">
              {allUsers.map((u) => {
                const isSelected = selectedUsers.some((x) => x._id === u._id);
                return (
                  <div
                    key={u._id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                      isSelected 
                        ? "bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border border-cyan-500/30 text-white" 
                        : "hover:bg-white/[0.05] text-slate-200"
                    }`}
                    onClick={() => toggleUser(u)}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10">
                      <img
                        src={
                          u.profilePic ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}`
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">{u.fullName}</div>
                    </div>
                    {isSelected && (
                      <FiCheck size={14} className="text-cyan-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 px-4 py-3 border-t border-white/10 mt-2">
              <button
                onClick={() => setStep(1)}
                className="btn-glass flex-1 py-2 text-xs font-medium"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || selectedUsers.length < 1}
                className="btn-glow flex-1 py-2 text-xs font-semibold"
              >
                {creating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  "Create Group"
                )}
              </button>
            </div>
          </div>
        )}
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

      return matchesSearch && (showArchived ? isArchived : !isArchived);
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
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
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
              className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/25 border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
                              : "bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-md shadow-cyan-500/30"
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
