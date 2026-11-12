import React, { useEffect, useState } from "react";
import { FiPlus, FiCamera, FiEdit3 } from "react-icons/fi";
import useStatusStore from "../../../store/useStatusStore";
import useAuthStore from "../../../store/useAuthStore";
import CreateStatusModal from "../Status/CreateStatusModal";
import StatusViewer from "../Status/StatusViewer";

const StatusList = () => {
  const { statuses, myStatuses, fetchStatuses, isFetching } = useStatusStore();
  const { authUser } = useAuthStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("image"); // 'image' or 'text'
  const [viewerData, setViewerData] = useState(null); // { statuses, initialIndex, ownerName, isMine }

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const handleCreateText = () => {
    setCreateType("text");
    setShowCreateModal(true);
  };

  const handleCreateMedia = () => {
    setCreateType("image"); // handles image & video
    setShowCreateModal(true);
  };

  // Group statuses by user
  const groupedStatuses = statuses.reduce((acc, status) => {
    const senderId = status.sender._id;
    if (!acc[senderId]) {
      acc[senderId] = {
        user: status.sender,
        statuses: [],
        hasUnviewed: false,
      };
    }
    acc[senderId].statuses.push(status);
    
    // Check if viewed
    const hasViewed = status.viewers?.some(v => v.user?._id === authUser._id || v.user === authUser._id);
    if (!hasViewed) acc[senderId].hasUnviewed = true;

    return acc;
  }, {});

  const recentUpdates = Object.values(groupedStatuses).filter(g => g.hasUnviewed);
  const viewedUpdates = Object.values(groupedStatuses).filter(g => !g.hasUnviewed);

  const openMyStatus = () => {
    if (myStatuses.length === 0) {
      handleCreateMedia();
    } else {
      setViewerData({ statuses: myStatuses, initialIndex: 0, ownerName: "My Status", isMine: true });
    }
  };

  const openContactStatus = (group) => {
    setViewerData({
      statuses: group.statuses,
      initialIndex: 0,
      ownerName: group.user.fullName,
      isMine: false,
    });
  };

  // Render a status ring
  const renderRing = (count, hasUnviewed) => {
    if (count === 0) return null;
    const gap = count > 1 ? 4 : 0;
    const dashlength = (100 - count * gap) / count;
    const strokeClass = hasUnviewed ? "text-cyan-400" : "text-white/20";

    return (
      <svg
        className={`absolute inset-0 w-full h-full -rotate-90 ${strokeClass}`}
        viewBox="0 0 36 36"
      >
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={`${dashlength} ${gap}`}
        />
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full w-full select-none">
      {/* Header */}
      <div className="p-4 border-b border-white/10 shrink-0 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight">Status</h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCreateText}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Create Text Status"
          >
            <FiEdit3 size={16} />
          </button>
          <button
            onClick={handleCreateMedia}
            className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/25 border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Add Media Status"
          >
            <FiCamera size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {/* My Status */}
        <div
          className="p-3 cursor-pointer hover:bg-white/[0.05] rounded-2xl transition-all flex items-center gap-3.5 border border-transparent hover:border-white/[0.05]"
          onClick={openMyStatus}
        >
          <div className="relative w-12 h-12 shrink-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/20 relative z-10 bg-slate-900">
              <img
                src={
                  authUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.fullName || 'Me')}&background=7c3aed&color=fff`
                }
                alt="My Status"
                className="w-full h-full object-cover"
              />
            </div>
            {myStatuses.length > 0 && renderRing(myStatuses.length, false)}
            {myStatuses.length === 0 && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-tr from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center border-2 border-[#0c1324] z-20 shadow-md">
                <FiPlus size={11} strokeWidth={3} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-white">My Status</div>
            <div className="text-xs text-slate-400 truncate">
              {myStatuses.length > 0
                ? "Tap to view your status updates"
                : "Tap to add status update"}
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        {recentUpdates.length > 0 && (
          <div className="pt-2">
            <div className="px-3 py-1 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
              Recent updates
            </div>
            {recentUpdates.map((group) => (
              <div
                key={group.user._id}
                className="p-3 cursor-pointer hover:bg-white/[0.05] rounded-2xl transition-all flex items-center gap-3.5 border border-transparent hover:border-white/[0.05]"
                onClick={() => openContactStatus(group)}
              >
                <div className="relative w-12 h-12 p-0.5 shrink-0">
                  {renderRing(group.statuses.length, true)}
                  <div className="w-full h-full rounded-2xl overflow-hidden p-0.5 bg-slate-900">
                    <img
                      src={
                        group.user.profilePic ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(group.user.fullName)}`
                      }
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white truncate">
                    {group.user.fullName}
                  </div>
                  <div className="text-xs text-cyan-300/80">
                    {new Date(
                      group.statuses[group.statuses.length - 1].createdAt,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Viewed Updates */}
        {viewedUpdates.length > 0 && (
          <div className="pt-2">
            <div className="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Viewed updates
            </div>
            {viewedUpdates.map((group) => (
              <div
                key={group.user._id}
                className="p-3 cursor-pointer hover:bg-white/[0.04] rounded-2xl transition-all flex items-center gap-3.5 border border-transparent hover:border-white/[0.04] opacity-75"
                onClick={() => openContactStatus(group)}
              >
                <div className="relative w-12 h-12 p-0.5 shrink-0">
                  {renderRing(group.statuses.length, false)}
                  <div className="w-full h-full rounded-2xl overflow-hidden p-0.5 bg-slate-900 opacity-60">
                    <img
                      src={
                        group.user.profilePic ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(group.user.fullName)}`
                      }
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-300 truncate">
                    {group.user.fullName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(
                      group.statuses[group.statuses.length - 1].createdAt,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isFetching && (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateStatusModal
          type={createType}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {viewerData && (
        <StatusViewer data={viewerData} onClose={() => setViewerData(null)} />
      )}
    </div>
  );
};

export default StatusList;
