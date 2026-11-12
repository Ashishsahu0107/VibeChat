import React, { useState, useRef } from "react";
import {
  FiX,
  FiCamera,
  FiEdit2,
  FiCheck,
  FiTrash2,
  FiUserPlus,
  FiUserMinus,
  FiBell,
  FiBellOff,
  FiArchive,
} from "react-icons/fi";
import { MdAdminPanelSettings } from "react-icons/md";
import { BsPinAngle } from "react-icons/bs";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import api from "../../config/api";
import toast from "react-hot-toast";

const ChatInfoPanel = ({ chat, onClose, authUser }) => {
  const {
    renameGroup,
    addToGroup,
    removeFromGroup,
    makeAdmin,
    updateChatState,
    deleteChat,
  } = useChatStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(chat?.groupName || "");
  const [groupDesc, setGroupDesc] = useState(chat?.groupDescription || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [addUserSearch, setAddUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const avatarInputRef = useRef(null);

  const isGroupChat = chat?.isGroupChat;
  const isAdmin =
    isGroupChat &&
    chat?.groupAdmins?.some(
      (a) => (a._id || a)?.toString() === authUser._id.toString(),
    );

  const otherUser = !isGroupChat
    ? chat?.users?.find((u) => u._id?.toString() !== authUser._id.toString())
    : null;

  const userState = chat?.userStates?.find(
    (s) => s.userId?.toString() === authUser._id.toString(),
  );

  // ── Group name edit ─────────────────────────────────────────────────────
  const handleSaveName = async () => {
    try {
      await renameGroup(chat._id, groupName, groupDesc);
      setIsEditingName(false);
      toast.success("Group updated");
    } catch {
      toast.error("Failed to update group");
    }
  };

  // ── Group avatar ───────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be 5 MB or less");
      e.target.value = "";
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await api.put(`/chats/${chat._id}/avatar`, formData);
      toast.success("Group photo updated");
    } catch {
      toast.error("Failed to update group photo");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ── Add member search ──────────────────────────────────────────────────
  const handleSearchUsers = async (q) => {
    setAddUserSearch(q);
    if (!q.trim()) return setSearchResults([]);
    try {
      const res = await api.get(`/users?search=${q}`);
      const existing = chat?.users?.map((u) => u._id?.toString()) || [];
      setSearchResults(
        (res.data || []).filter((u) => !existing.includes(u._id.toString())),
      );
    } catch {
      setSearchResults([]);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await addToGroup(chat._id, userId);
      setAddUserSearch("");
      setSearchResults([]);
      toast.success("Member added");
    } catch {
      toast.error("Failed to add member");
    }
  };

  // ── Remove member ─────────────────────────────────────────────────────
  const handleRemoveMember = async (userId) => {
    if (!confirm("Remove this member?")) return;
    try {
      await removeFromGroup(chat._id, userId);
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  // ── Make admin ────────────────────────────────────────────────────────
  const handleMakeAdmin = async (userId) => {
    try {
      await makeAdmin(chat._id, userId);
      toast.success("Admin assigned");
    } catch {
      toast.error("Failed to assign admin");
    }
  };

  // ── Chat State actions ─────────────────────────────────────────────────
  const handleMute = async () => {
    await updateChatState(chat._id, { isMuted: !userState?.isMuted });
    toast.success(userState?.isMuted ? "Unmuted" : "Muted");
  };

  const handlePin = async () => {
    await updateChatState(chat._id, { isPinned: !userState?.isPinned });
    toast.success(userState?.isPinned ? "Unpinned" : "Pinned");
  };

  const handleArchive = async () => {
    await updateChatState(chat._id, { isArchived: !userState?.isArchived });
    toast.success(userState?.isArchived ? "Unarchived" : "Archived");
  };

  const handleClearChat = async () => {
    if (!confirm("Clear all messages? This cannot be undone.")) return;
    await updateChatState(chat._id, { clearChat: true });
    toast.success("Chat cleared");
    onClose();
  };

  const handleDeleteChat = async () => {
    if (!confirm(isGroupChat ? "Leave group?" : "Delete this chat?")) return;
    await deleteChat(chat._id);
    toast.success(isGroupChat ? "Left group" : "Chat deleted");
    onClose();
  };

  const chatPic = isGroupChat
    ? chat?.groupAvatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.groupName || "G")}&background=7c3aed&color=fff`
    : otherUser?.profilePic ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.fullName || "U")}`;

  const displayName = isGroupChat ? chat?.groupName : otherUser?.fullName;

  return (
    <div className="absolute inset-0 z-50 glass-panel bg-[#0a0f1d]/95 backdrop-blur-2xl flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-[#0a0f1d]/80">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/[0.08] rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <FiX size={18} />
        </button>
        <h2 className="font-bold text-base text-white">
          {isGroupChat ? "Group Info" : "Contact Info"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center py-7 px-4 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent border-b border-white/10">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-cyan-400/40 p-0.5 bg-slate-900 shadow-xl shadow-cyan-500/20">
              <img
                src={chatPic}
                alt={displayName}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            {isGroupChat && isAdmin && (
              <>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-8 h-8 btn-glow rounded-xl flex items-center justify-center text-white shadow-lg border border-white/20 cursor-pointer"
                >
                  {isUploadingAvatar ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FiCamera size={14} />
                  )}
                </button>
                <input
                  type="file"
                  ref={avatarInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </>
            )}
          </div>

          {/* Name */}
          {isGroupChat && isAdmin && isEditingName ? (
            <div className="flex flex-col items-center gap-2.5 w-full max-w-xs">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="glass-input text-sm w-full text-center font-bold px-3 py-2"
                autoFocus
              />
              <textarea
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                placeholder="Group description"
                className="glass-input text-xs w-full px-3 py-2 resize-none"
                rows={2}
              />
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleSaveName}
                  className="btn-glow flex-1 py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <FiCheck size={14} /> Save
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="btn-glass flex-1 py-1.5 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-xl font-bold text-white">{displayName}</h3>
                {isGroupChat && isAdmin && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <FiEdit2 size={14} />
                  </button>
                )}
              </div>
              {isGroupChat ? (
                <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                  {chat?.groupDescription || "No description provided"}
                </p>
              ) : (
                <>
                  <p className="text-xs text-cyan-400 font-mono mt-1">
                    {otherUser?.email}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {otherUser?.about || "Hey there! I am using VibeChat."}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 space-y-1.5">
          <ActionButton
            icon={userState?.isMuted ? <FiBellOff /> : <FiBell />}
            label={userState?.isMuted ? "Unmute Notifications" : "Mute Notifications"}
            onClick={handleMute}
          />
          <ActionButton
            icon={<BsPinAngle />}
            label={userState?.isPinned ? "Unpin Conversation" : "Pin Conversation"}
            onClick={handlePin}
          />
          <ActionButton
            icon={<FiArchive />}
            label={userState?.isArchived ? "Unarchive Conversation" : "Archive Conversation"}
            onClick={handleArchive}
          />
          <div className="my-2 border-t border-white/10" />
          <ActionButton
            icon={<FiTrash2 />}
            label="Clear Chat Messages"
            onClick={handleClearChat}
            className="text-amber-400 hover:text-amber-300"
          />
          <ActionButton
            icon={<FiTrash2 />}
            label={isGroupChat ? "Leave Group" : "Delete Chat"}
            onClick={handleDeleteChat}
            className="text-rose-400 hover:text-rose-300"
          />
        </div>

        {/* Group Members */}
        {isGroupChat && (
          <div className="p-4 border-t border-white/10">
            <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400 mb-3">
              {chat?.users?.length} Members
            </h4>

            {isAdmin && (
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search user to add..."
                    className="glass-input text-xs w-full pl-9 pr-3 py-2"
                    value={addUserSearch}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                  />
                  <FiUserPlus
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={14}
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-1 glass-card border border-white/15 rounded-xl shadow-xl overflow-hidden p-1 space-y-1">
                    {searchResults.slice(0, 5).map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/[0.06] rounded-lg cursor-pointer"
                        onClick={() => handleAddMember(u._id)}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/15">
                          <img
                            src={u.profilePic}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs text-white truncate">
                            {u.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {u.email}
                          </div>
                        </div>
                        <button className="btn-glow px-2.5 py-1 text-[11px] font-semibold">
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              {(chat?.users || []).map((member) => {
                const memberId = member._id?.toString();
                const isSelf = memberId === authUser._id.toString();
                const isAdminMember = chat?.groupAdmins?.some(
                  (a) => (a._id || a)?.toString() === memberId,
                );

                return (
                  <div
                    key={memberId}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/[0.05]"
                  >
                    <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-white/15">
                      <img
                        src={
                          member.profilePic ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}`
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                        <span className="truncate">{member.fullName}</span>
                        {isSelf && (
                          <span className="text-[10px] text-slate-400">
                            (You)
                          </span>
                        )}
                        {isAdminMember && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {member.email}
                      </div>
                    </div>
                    {isAdmin && !isSelf && (
                      <div className="flex gap-1 shrink-0">
                        {!isAdminMember && (
                          <button
                            onClick={() => handleMakeAdmin(memberId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
                            title="Make group admin"
                          >
                            <MdAdminPanelSettings size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(memberId)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer"
                          title="Remove from group"
                        >
                          <FiUserMinus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors text-left text-xs font-semibold cursor-pointer ${className}`}
  >
    <span className="text-slate-400 text-base">{icon}</span>
    <span>{label}</span>
  </button>
);

export default ChatInfoPanel;
