import React, { useState, useRef } from "react";
import { FiX, FiCamera, FiEdit2, FiCheck, FiTrash2, FiUserPlus, FiUserMinus, FiBell, FiBellOff, FiArchive } from "react-icons/fi";
import { MdAdminPanelSettings } from "react-icons/md";
import { BsPinAngle } from "react-icons/bs";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import api from "../../config/api";
import toast from "react-hot-toast";

const ChatInfoPanel = ({ chat, onClose, authUser }) => {
  const { renameGroup, addToGroup, removeFromGroup, makeAdmin, updateChatState, deleteChat } = useChatStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(chat?.groupName || "");
  const [groupDesc, setGroupDesc] = useState(chat?.groupDescription || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [addUserSearch, setAddUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const avatarInputRef = useRef(null);

  const isGroupChat = chat?.isGroupChat;
  const isAdmin = isGroupChat && chat?.groupAdmins?.some(
    (a) => (a._id || a)?.toString() === authUser._id.toString()
  );

  const otherUser = !isGroupChat
    ? chat?.users?.find((u) => u._id?.toString() !== authUser._id.toString())
    : null;

  const userState = chat?.userStates?.find(
    (s) => s.userId?.toString() === authUser._id.toString()
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
      setSearchResults((res.data || []).filter((u) => !existing.includes(u._id.toString())));
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
    ? (chat?.groupAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.groupName || "G")}&background=7c3aed&color=fff`)
    : (otherUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.fullName || "U")}`);

  const displayName = isGroupChat ? chat?.groupName : otherUser?.fullName;

  return (
    <div className="absolute inset-0 z-50 bg-base-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-base-300 bg-base-100">
        <button onClick={onClose} className="p-2 hover:bg-base-200 rounded-full transition-colors">
          <FiX size={20} />
        </button>
        <h2 className="font-semibold text-base">{isGroupChat ? "Group Info" : "Contact Info"}</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center py-6 px-4 bg-base-200/50">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20">
              <img src={chatPic} alt={displayName} className="w-full h-full object-cover" />
            </div>
            {isGroupChat && isAdmin && (
              <>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center shadow-md hover:opacity-90"
                >
                  {isUploadingAvatar ? (
                    <div className="loading loading-spinner loading-xs" />
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
            <div className="flex flex-col items-center gap-2 w-full max-w-xs">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="input input-bordered input-sm w-full text-center font-semibold"
                autoFocus
              />
              <textarea
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                placeholder="Group description"
                className="textarea textarea-bordered textarea-sm w-full text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <button onClick={handleSaveName} className="btn btn-primary btn-sm">
                  <FiCheck size={14} /> Save
                </button>
                <button onClick={() => setIsEditingName(false)} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{displayName}</h3>
                {isGroupChat && isAdmin && (
                  <button onClick={() => setIsEditingName(true)} className="p-1 hover:bg-base-200 rounded-full">
                    <FiEdit2 size={14} className="text-base-content/50" />
                  </button>
                )}
              </div>
              {isGroupChat ? (
                <p className="text-sm text-base-content/60 mt-1 max-w-xs">{chat?.groupDescription || "No description"}</p>
              ) : (
                <>
                  <p className="text-sm text-base-content/60 mt-1">{otherUser?.email}</p>
                  <p className="text-sm text-base-content/60">{otherUser?.about}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-3 space-y-1">
          <ActionButton
            icon={userState?.isMuted ? <FiBellOff /> : <FiBell />}
            label={userState?.isMuted ? "Unmute" : "Mute"}
            onClick={handleMute}
          />
          <ActionButton
          icon={<BsPinAngle />}
            label={userState?.isPinned ? "Unpin" : "Pin Chat"}
            onClick={handlePin}
          />
          <ActionButton
            icon={<FiArchive />}
            label={userState?.isArchived ? "Unarchive" : "Archive Chat"}
            onClick={handleArchive}
          />
          <ActionButton
            icon={<FiTrash2 />}
            label="Clear Chat"
            onClick={handleClearChat}
            className="text-warning"
          />
          <ActionButton
            icon={<FiTrash2 />}
            label={isGroupChat ? "Leave Group" : "Delete Chat"}
            onClick={handleDeleteChat}
            className="text-error"
          />
        </div>

        {/* Group Members */}
        {isGroupChat && (
          <div className="px-4 py-3 border-t border-base-300">
            <h4 className="font-semibold text-sm text-base-content/70 mb-3">
              {chat?.users?.length} Members
            </h4>

            {isAdmin && (
              <div className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Add member..."
                    className="input input-bordered input-sm w-full pl-9"
                    value={addUserSearch}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                  />
                  <FiUserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={14} />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-1 bg-base-100 border border-base-300 rounded-xl shadow overflow-hidden">
                    {searchResults.slice(0, 5).map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-base-200 cursor-pointer"
                        onClick={() => handleAddMember(u._id)}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                          <img src={u.profilePic} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{u.fullName}</div>
                          <div className="text-xs text-base-content/50">{u.email}</div>
                        </div>
                        <button className="ml-auto btn btn-primary btn-xs">Add</button>
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
                  (a) => (a._id || a)?.toString() === memberId
                );

                return (
                  <div key={memberId} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-base-200 transition-colors">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <img
                        src={member.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        {member.fullName}
                        {isSelf && <span className="text-xs text-base-content/50">(You)</span>}
                        {isAdminMember && (
                          <span className="badge badge-primary badge-xs">Admin</span>
                        )}
                      </div>
                      <div className="text-xs text-base-content/50 truncate">{member.email}</div>
                    </div>
                    {isAdmin && !isSelf && (
                      <div className="flex gap-1 shrink-0">
                        {!isAdminMember && (
                          <button
                            onClick={() => handleMakeAdmin(memberId)}
                            className="btn btn-ghost btn-xs tooltip"
                            data-tip="Make admin"
                          >
                            <MdAdminPanelSettings size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(memberId)}
                          className="btn btn-ghost btn-xs text-error"
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
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-base-200 transition-colors text-left ${className}`}
  >
    <span className="text-base-content/50 text-lg">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default ChatInfoPanel;
