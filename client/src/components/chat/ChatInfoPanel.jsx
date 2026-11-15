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
  FiChevronRight,
  FiImage,
  FiFileText,
  FiLink,
  FiArrowLeft,
  FiShield,
} from "react-icons/fi";
import { MdAdminPanelSettings } from "react-icons/md";
import { BsPinAngle } from "react-icons/bs";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import api from "../../config/api";
import toast from "react-hot-toast";
import {
  MuteModal,
  DisappearingMessagesModal,
  ExportChatModal,
  ClearChatModal,
  ReportBlockModal,
} from "./AttachmentModals";

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
  const [activeMediaTab, setActiveMediaTab] = useState("media"); // "media", "files", "links"
  const [showMediaSection, setShowMediaSection] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
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

  // Group name edit
  const handleSaveName = async () => {
    try {
      await renameGroup(chat._id, groupName, groupDesc);
      setIsEditingName(false);
      toast.success("Group updated");
    } catch {
      toast.error("Failed to update group");
    }
  };

  // Group avatar
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

  // Add member search
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

  const handleRemoveMember = async (userId) => {
    if (!confirm("Remove this member?")) return;
    try {
      await removeFromGroup(chat._id, userId);
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      await makeAdmin(chat._id, userId);
      toast.success("Admin assigned");
    } catch {
      toast.error("Failed to assign admin");
    }
  };

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
    if (!confirm(isGroupChat ? "Exit group?" : "Delete this chat?")) return;
    await deleteChat(chat._id);
    toast.success(isGroupChat ? "Exited group" : "Chat deleted");
    onClose();
  };

  const chatPic = isGroupChat
    ? chat?.groupAvatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.groupName || "G")}&background=7c3aed&color=fff`
    : otherUser?.profilePic ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.fullName || "U")}&background=7c3aed&color=fff`;

  const displayName = isGroupChat ? chat?.groupName : otherUser?.fullName;

  return (
    <div className="absolute inset-0 z-50 bg-[#0E0C15] flex flex-col overflow-hidden text-white font-sans animate-in slide-in-from-right-4 duration-200">
      {/* Header (Figma Screen 24: Group Settings) */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-[#12111A]">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/[0.08] rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <FiArrowLeft size={18} />
        </button>
        <h2 className="font-bold text-base text-white">
          {isGroupChat ? "Group Settings" : "Contact Info"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Avatar + Group Info */}
        <div className="flex flex-col items-center py-7 px-4 bg-gradient-to-b from-[#7C3AED]/15 to-transparent border-b border-white/10">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#7C3AED]/50 p-0.5 bg-slate-900 shadow-xl shadow-purple-900/30">
              <img
                src={chatPic}
                alt={displayName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {isGroupChat && isAdmin && (
              <>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center text-white shadow-lg border border-white/20 cursor-pointer"
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

          {/* Name & Subtitle */}
          {isGroupChat && isAdmin && isEditingName ? (
            <div className="flex flex-col items-center gap-2.5 w-full max-w-xs">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="text-sm w-full text-center font-bold px-3 py-2 rounded-xl bg-white/[0.06] border border-purple-500/40 text-white focus:outline-none"
                autoFocus
              />
              <textarea
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                placeholder="Group description"
                className="text-xs w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white resize-none focus:outline-none"
                rows={2}
              />
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleSaveName}
                  className="flex-1 py-1.5 rounded-full font-bold text-xs text-white bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center gap-1.5"
                >
                  <FiCheck size={14} /> Save
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="flex-1 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white bg-white/10"
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
                    className="p-1 hover:bg-white/[0.08] rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <FiEdit2 size={14} />
                  </button>
                )}
              </div>
              {isGroupChat ? (
                <p className="text-xs text-purple-300 font-medium mt-1">
                  {chat?.users?.length || 1} Members
                </p>
              ) : (
                <p className="text-xs text-purple-300 font-mono mt-1">
                  {otherUser?.email}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Figma Screen 24 Menu Options */}
        <div className="p-4 space-y-2">
          {/* Media, Links & Files (Screen 25) */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowMediaSection(!showMediaSection)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                  <FiImage size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Media, Links & Files</div>
                  <div className="text-[10px] text-gray-400">Photos, docs, and links shared</div>
                </div>
              </div>
              <FiChevronRight size={16} className={`text-gray-400 transition-transform ${showMediaSection ? "rotate-90" : ""}`} />
            </button>

            {/* Media Tabs Drawer (Screen 25) */}
            {showMediaSection && (
              <div className="p-3 border-t border-white/10 bg-black/20">
                <div className="flex items-center gap-1.5 mb-3">
                  {[
                    { id: "media", label: "Media" },
                    { id: "files", label: "Files" },
                    { id: "links", label: "Links" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMediaTab(tab.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        activeMediaTab === tab.id
                          ? "bg-[#7C3AED] text-white"
                          : "bg-white/[0.06] text-gray-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeMediaTab === "media" && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150",
                      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=150",
                      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=150"].map((img, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-800 border border-white/10">
                        <img src={img} alt="media" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {activeMediaTab === "files" && (
                  <div className="space-y-1.5 text-xs text-gray-400 p-2">
                    <div className="flex items-center gap-2 text-white">
                      <FiFileText size={14} className="text-purple-400" />
                      <span>Project_Document.pdf</span>
                    </div>
                  </div>
                )}
                {activeMediaTab === "links" && (
                  <div className="space-y-1.5 text-xs text-gray-400 p-2">
                    <div className="flex items-center gap-2 text-white">
                      <FiLink size={14} className="text-purple-400" />
                      <span className="text-[#A78BFA] underline">https://github.com/project</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Options: Mute (Screen 50), Disappearing (Screen 51), Export (Screen 58) */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden divide-y divide-white/5">
            <button
              onClick={() => setShowMuteModal(true)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-left text-xs font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-400 text-base">{userState?.isMuted ? <FiBellOff /> : <FiBell />}</span>
                <span>Mute Notifications</span>
              </div>
              <FiChevronRight size={16} className="text-gray-400" />
            </button>
            <button
              onClick={() => setShowDisappearingModal(true)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-left text-xs font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-400 text-base"><FiClock /></span>
                <span>Disappearing Messages</span>
              </div>
              <FiChevronRight size={16} className="text-gray-400" />
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-left text-xs font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-400 text-base"><FiDownload /></span>
                <span>Export Chat</span>
              </div>
              <FiChevronRight size={16} className="text-gray-400" />
            </button>
            <button
              onClick={handlePin}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-left text-xs font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-400 text-base"><BsPinAngle /></span>
                <span>{userState?.isPinned ? "Unpin Conversation" : "Pin Conversation"}</span>
              </div>
              <FiChevronRight size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Clear, Report & Exit Actions (Screens 59 & 60) */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden divide-y divide-white/5">
            <button
              onClick={() => setShowClearModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-left text-xs font-semibold text-amber-400"
            >
              <FiTrash2 size={16} />
              <span>Clear Messages</span>
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-left text-xs font-semibold text-rose-300"
            >
              <FiShield size={16} />
              <span>Report & Block</span>
            </button>
            <button
              onClick={handleDeleteChat}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-left text-xs font-semibold text-rose-400"
            >
              <FiTrash2 size={16} />
              <span>{isGroupChat ? "Exit Group" : "Delete Chat"}</span>
            </button>
          </div>
        </div>

        {/* Members Section */}
        {isGroupChat && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-purple-400">
                Manage Members ({chat?.users?.length})
              </h4>
            </div>

            {isAdmin && (
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Add member by name/email..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-gray-500 text-xs focus:outline-none focus:border-[#7C3AED]"
                    value={addUserSearch}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                  />
                  <FiUserPlus
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={14}
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-1 bg-[#1A1826] border border-white/15 rounded-xl shadow-xl overflow-hidden p-1 space-y-1">
                    {searchResults.slice(0, 5).map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/[0.06] rounded-lg cursor-pointer"
                        onClick={() => handleAddMember(u._id)}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/15">
                          <img src={u.profilePic} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs text-white truncate">{u.fullName}</div>
                          <div className="text-[10px] text-gray-400 truncate">{u.email}</div>
                        </div>
                        <button className="px-3 py-1 rounded-full text-xs font-bold bg-[#7C3AED] text-white">
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
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-purple-400/20">
                      <img
                        src={
                          member.profilePic ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            member.fullName || "User",
                          )}&background=7c3aed&color=fff`
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                        <span className="truncate">{member.fullName}</span>
                        {isSelf && <span className="text-[10px] text-gray-400">(You)</span>}
                        {isAdminMember && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">{member.email}</div>
                    </div>
                    {isAdmin && !isSelf && (
                      <div className="flex gap-1 shrink-0">
                        {!isAdminMember && (
                          <button
                            onClick={() => handleMakeAdmin(memberId)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
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

      {/* Screen 50: Mute Modal */}
      <MuteModal
        isOpen={showMuteModal}
        onClose={() => setShowMuteModal(false)}
        onMute={handleMute}
      />

      {/* Screen 51: Disappearing Messages Modal */}
      <DisappearingMessagesModal
        isOpen={showDisappearingModal}
        onClose={() => setShowDisappearingModal(false)}
        onSave={() => {}}
      />

      {/* Screen 58: Export Chat Modal */}
      <ExportChatModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={() => {}}
      />

      {/* Screen 59: Clear Chat Modal */}
      <ClearChatModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onClear={handleClearChat}
      />

      {/* Screen 60: Report & Block Modal */}
      <ReportBlockModal
        isOpen={showReportModal}
        userName={displayName}
        onClose={() => setShowReportModal(false)}
        onAction={() => {}}
      />
    </div>
  );
};

export default ChatInfoPanel;