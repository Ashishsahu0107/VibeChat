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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-base-300">
          <h3 className="font-semibold flex-1">New Chat</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-base-200 rounded-full"><FiX size={18} /></button>
        </div>
        <div className="px-4 py-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
            <input
              autoFocus
              type="text"
              placeholder="Search users..."
              className="input input-bordered input-sm w-full pl-9 rounded-full"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto px-2 pb-3">
          {loading && (
            <div className="flex justify-center py-6"><div className="loading loading-spinner loading-sm" /></div>
          )}
          {!loading && users.length === 0 && search && (
            <div className="text-center py-8 text-sm text-base-content/50">No users found</div>
          )}
          {!loading && !search && (
            <div className="text-center py-8 text-sm text-base-content/50">Search for a user to start chatting</div>
          )}
          {users.map((u) => (
            <div
              key={u._id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-base-200 cursor-pointer transition-colors"
              onClick={() => handleStartChat(u._id)}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img src={u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{u.fullName}</div>
                <div className="text-xs text-base-content/50 truncate">{u.email}</div>
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

  useEffect(() => { handleSearch(""); }, []);

  const toggleUser = (u) => {
    setSelectedUsers((prev) =>
      prev.find((x) => x._id === u._id) ? prev.filter((x) => x._id !== u._id) : [...prev, u]
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-base-300">
          <h3 className="font-semibold flex-1">New Group</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-base-200 rounded-full"><FiX size={18} /></button>
        </div>

        {step === 1 && (
          <div className="px-4 py-4 space-y-3">
            <div>
              <label className="label-text text-xs font-medium text-base-content/70">Group Name *</label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Team Alpha"
                className="input input-bordered input-sm w-full mt-1"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text text-xs font-medium text-base-content/70">Description (optional)</label>
              <textarea
                placeholder="What's this group about?"
                className="textarea textarea-bordered textarea-sm w-full mt-1"
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                rows={2}
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!groupName.trim()}
              className="btn btn-primary btn-sm w-full"
            >
              Next: Add Members
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-base-300 bg-base-200/50">
                {selectedUsers.map((u) => (
                  <div key={u._id} className="flex items-center gap-1 bg-primary/20 text-primary text-xs rounded-full px-2 py-1">
                    <span>{u.fullName.split(" ")[0]}</span>
                    <button onClick={() => toggleUser(u)}><FiX size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="px-3 py-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={14} />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input input-bordered input-sm w-full pl-9 rounded-full"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto px-2">
              {allUsers.map((u) => {
                const isSelected = selectedUsers.some((x) => x._id === u._id);
                return (
                  <div
                    key={u._id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-base-200"}`}
                    onClick={() => toggleUser(u)}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <img src={u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{u.fullName}</div>
                    </div>
                    {isSelected && <FiCheck size={16} className="text-primary shrink-0" />}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 px-3 py-3 border-t border-base-300">
              <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm flex-1">Back</button>
              <button
                onClick={handleCreate}
                disabled={creating || selectedUsers.length < 1}
                className="btn btn-primary btn-sm flex-1"
              >
                {creating ? <div className="loading loading-spinner loading-xs" /> : "Create Group"}
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
      className="fixed z-[200] bg-base-100 border border-base-300 rounded-xl shadow-2xl w-44 py-1 overflow-hidden"
      style={{ top: y, left: Math.min(x, window.innerWidth - 190) }}
    >
      <CMenuBtn icon={<BsPinAngle size={14} />} label={userState?.isPinned ? "Unpin" : "Pin"} onClick={() => { onAction("pin"); onClose(); }} />
      <CMenuBtn icon={userState?.isMuted ? <FiBellOff size={14} /> : <FiBell size={14} />} label={userState?.isMuted ? "Unmute" : "Mute"} onClick={() => { onAction("mute"); onClose(); }} />
      <CMenuBtn icon={<FiArchive size={14} />} label={userState?.isArchived ? "Unarchive" : "Archive"} onClick={() => { onAction("archive"); onClose(); }} />
      <CMenuBtn icon={<FiTrash2 size={14} />} label="Clear chat" onClick={() => { onAction("clear"); onClose(); }} className="text-warning" />
      <CMenuBtn icon={<FiTrash2 size={14} />} label={chat.isGroupChat ? "Leave group" : "Delete chat"} onClick={() => { onAction("delete"); onClose(); }} className="text-error" />
    </div>
  );
};

const CMenuBtn = ({ icon, label, onClick, className = "" }) => (
  <button
    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-base-200 transition-colors text-left ${className}`}
    onClick={onClick}
  >
    <span className="text-base-content/60">{icon}</span>
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

  const filteredChats = chats.filter((chat) => {
    const chatName = chat.isGroupChat
      ? chat.groupName
      : chat.users?.find((u) => String(u._id) !== String(authUser._id))?.fullName;
    const matchesSearch = chatName?.toLowerCase().includes(search.toLowerCase());
    const userState = chat.userStates?.find((s) => s.userId?.toString() === authUser._id.toString() || s.userId === authUser._id);
    const isArchived = userState?.isArchived;

    return matchesSearch && (showArchived ? isArchived : !isArchived);
  }).sort((a, b) => {
    const getUserState = (chat) => chat.userStates?.find(
      (s) => s.userId?.toString() === authUser._id.toString() || s.userId === authUser._id
    );
    const aState = getUserState(a);
    const bState = getUserState(b);
    if (aState?.isPinned && !bState?.isPinned) return -1;
    if (!aState?.isPinned && bState?.isPinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const archivedCount = chats.filter((c) => {
    const s = c.userStates?.find((s) => s.userId?.toString() === authUser._id.toString() || s.userId === authUser._id);
    return s?.isArchived;
  }).length;

  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    const y = Math.min(e.clientY, window.innerHeight - 200);
    setContextMenu({ chat, x: e.clientX, y });
  };

  const handleContextAction = async (chat, action) => {
    const userState = chat.userStates?.find(
      (s) => s.userId?.toString() === authUser._id.toString() || s.userId === authUser._id
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
          await updateChatState(chat._id, { isArchived: !userState?.isArchived });
          break;
        case "clear":
          if (confirm("Clear all messages?")) await updateChatState(chat._id, { clearChat: true });
          break;
        case "delete":
          if (confirm(chat.isGroupChat ? "Leave group?" : "Delete chat?")) {
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
    <div className="flex flex-col h-full w-full bg-base-100">
      {/* Header */}
      <div className="px-4 py-3 border-b border-base-300 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Chats</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNewGroup(true)}
              className="p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/60 hover:text-base-content"
              title="New Group"
            >
              <FiUsers size={18} />
            </button>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/60 hover:text-base-content"
              title="New Chat"
            >
              <FiPlus size={20} />
            </button>
          </div>
        </div>

        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={15} />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="input input-bordered input-sm w-full pl-9 rounded-full bg-base-200 border-none focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Archived toggle */}
      {archivedCount > 0 && (
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors border-b border-base-300 ${showArchived ? "bg-primary/10 text-primary" : "hover:bg-base-200 text-base-content/60"}`}
        >
          <FiArchive size={14} />
          <span>Archived Chats</span>
          <span className="ml-auto badge badge-sm badge-neutral">{archivedCount}</span>
        </button>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-base-content/40">
            <BsChatDotsFill size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">No chats yet</p>
            <p className="text-xs mt-1">Click + to start a conversation</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherUser = chat.isGroupChat
              ? null
              : chat.users?.find((u) => String(u._id) !== String(authUser._id));
            const chatName = chat.isGroupChat ? chat.groupName : otherUser?.fullName;
            const chatPic = chat.isGroupChat
              ? (chat.groupAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName || "G")}&background=7c3aed&color=fff`)
              : (otherUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName || "U")}`);
            const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;
            const userState = chat.userStates?.find(
              (s) => s.userId?.toString() === authUser._id.toString() || s.userId === authUser._id
            );
            const unreadCount = userState?.unreadCount || 0;
            const isPinned = userState?.isPinned;
            const isMuted = userState?.isMuted;

            const lastMessage = chat.latestMessage;
            const lastMsgText = lastMessage
              ? lastMessage.sender?._id === authUser._id
                ? `You: ${lastMessage.content || (lastMessage.attachments?.length ? "📎 Attachment" : "")}`
                : lastMessage.content || (lastMessage.attachments?.length ? "📎 Attachment" : "")
              : "Start chatting";

            return (
              <div
                key={chat._id}
                onContextMenu={(e) => handleContextMenu(e, chat)}
                onClick={() => onSelectUser(chat)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-base-300/40 ${
                  selectedUser?._id === chat._id
                    ? "bg-base-200"
                    : "hover:bg-base-200/50"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img src={chatPic} alt={chatName} className="w-full h-full object-cover" />
                  </div>
                  {isOnline && !chat.isGroupChat && (
                    <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-success border-2 border-base-100 rounded-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isPinned && <BsPinAngle size={11} className="text-base-content/40 shrink-0" />}
                      <span className="font-semibold text-sm truncate">{chatName}</span>
                    </div>
                    <span className="text-[10px] text-base-content/40 whitespace-nowrap ml-2 shrink-0">
                      {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-base-content/55 truncate flex-1">{lastMsgText}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      {isMuted && <FiBellOff size={11} className="text-base-content/40" />}
                      {unreadCount > 0 && (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isMuted ? "bg-base-300 text-base-content/60" : "bg-primary text-primary-content"}`}>
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
            (s) => s.userId?.toString() === authUser._id.toString()
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
          onSelectChat={(chat) => { onSelectUser(chat); setShowNewChat(false); }}
        />
      )}
      {showNewGroup && (
        <NewGroupModal
          onClose={() => setShowNewGroup(false)}
          onSelectChat={(chat) => { onSelectUser(chat); setShowNewGroup(false); }}
        />
      )}
    </div>
  );
};

export default RecentChat;
