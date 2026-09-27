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
    const hasViewed = status.viewers.some(v => v.user._id === authUser._id || v.user === authUser._id);
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
    setViewerData({ statuses: group.statuses, initialIndex: 0, ownerName: group.user.fullName, isMine: false });
  };

  // Render a status ring
  const renderRing = (count, hasUnviewed) => {
    if (count === 0) return null;
    const dasharray = 100;
    const gap = count > 1 ? 4 : 0;
    const dashlength = (100 - (count * gap)) / count;
    const strokeColor = hasUnviewed ? "currentColor" : "#888";
    
    return (
      <svg className={`absolute inset-0 w-full h-full -rotate-90 ${hasUnviewed ? "text-primary" : "text-base-300"}`} viewBox="0 0 36 36">
        <circle 
          cx="18" cy="18" r="16"
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="2" 
          strokeDasharray={`${dashlength} ${gap}`}
        />
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full bg-base-100">
      <div className="px-4 py-3 border-b border-base-300 shrink-0 flex items-center justify-between">
        <h2 className="text-xl font-bold">Status</h2>
        <div className="flex gap-2">
          <button onClick={handleCreateText} className="p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/60">
            <FiEdit3 size={18} />
          </button>
          <button onClick={handleCreateMedia} className="p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/60">
            <FiCamera size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {/* My Status */}
        <div className="px-2 py-3 cursor-pointer hover:bg-base-200 rounded-xl transition-colors flex items-center gap-4" onClick={openMyStatus}>
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-base-300 relative z-10">
              <img src={authUser?.profilePic || `https://ui-avatars.com/api/?name=Me`} alt="My Status" className="w-full h-full object-cover" />
            </div>
            {myStatuses.length > 0 && renderRing(myStatuses.length, false)}
            {myStatuses.length === 0 && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary text-primary-content rounded-full flex items-center justify-center border-2 border-base-100 z-20">
                <FiPlus size={10} strokeWidth={4} />
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-[15px]">My Status</div>
            <div className="text-xs text-base-content/60">
              {myStatuses.length > 0 ? "Tap to view your status update" : "Tap to add status update"}
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        {recentUpdates.length > 0 && (
          <div className="mt-4">
            <div className="px-4 py-1 text-xs font-semibold text-base-content/50 uppercase tracking-wide">Recent updates</div>
            {recentUpdates.map((group) => (
              <div key={group.user._id} className="px-2 py-3 cursor-pointer hover:bg-base-200 rounded-xl transition-colors flex items-center gap-4" onClick={() => openContactStatus(group)}>
                <div className="relative w-12 h-12 p-0.5">
                  {renderRing(group.statuses.length, true)}
                  <div className="w-full h-full rounded-full overflow-hidden p-0.5">
                    <img src={group.user.profilePic || `https://ui-avatars.com/api/?name=${group.user.fullName}`} alt="" className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="font-medium text-[15px]">{group.user.fullName}</div>
                  <div className="text-xs text-base-content/50">
                    {new Date(group.statuses[group.statuses.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Viewed Updates */}
        {viewedUpdates.length > 0 && (
          <div className="mt-4">
            <div className="px-4 py-1 text-xs font-semibold text-base-content/50 uppercase tracking-wide">Viewed updates</div>
            {viewedUpdates.map((group) => (
              <div key={group.user._id} className="px-2 py-3 cursor-pointer hover:bg-base-200 rounded-xl transition-colors flex items-center gap-4" onClick={() => openContactStatus(group)}>
                <div className="relative w-12 h-12 p-0.5">
                  {renderRing(group.statuses.length, false)}
                  <div className="w-full h-full rounded-full overflow-hidden p-0.5 opacity-60">
                    <img src={group.user.profilePic || `https://ui-avatars.com/api/?name=${group.user.fullName}`} alt="" className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="font-medium text-[15px] text-base-content/70">{group.user.fullName}</div>
                  <div className="text-xs text-base-content/40">
                    {new Date(group.statuses[group.statuses.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isFetching && (
           <div className="flex justify-center py-4"><span className="loading loading-spinner text-primary"></span></div>
        )}

      </div>

      {showCreateModal && (
        <CreateStatusModal type={createType} onClose={() => setShowCreateModal(false)} />
      )}

      {viewerData && (
        <StatusViewer 
          data={viewerData} 
          onClose={() => setViewerData(null)} 
        />
      )}
    </div>
  );
};

export default StatusList;
