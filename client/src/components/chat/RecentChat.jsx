import React, { useState, useEffect } from "react";
import { FiSearch, FiMenu, FiLogOut } from "react-icons/fi";
import useAuthStore from "../../store/useAuthStore";
import api from "../../config/api";
import { useSocket } from "../../context/SocketContext";

const RecentChat = ({ selectedUser, onSelectUser, isCollapsed, setIsCollapsed }) => {
  const [search, setSearch] = useState("");
  const { authUser, logout } = useAuthStore();
  const { onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    if (authUser) {
      fetchUsers();
    }
  }, [authUser]);

  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full w-full bg-base-100 border-r border-base-300">
      {/* Header */}
      <div className="p-4 border-b border-base-300 flex flex-col gap-4">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <h2 className="text-2xl font-bold text-base-content">Chats</h2>}
          <button 
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FiMenu size={20} className="text-base-content/70" />
          </button>
        </div>
        
        {!isCollapsed && (
          <div className="relative transition-all">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
            <input
              type="text"
              placeholder="Search messages..."
              className="input input-bordered w-full pl-10 bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => onSelectUser(user)}
            className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-200 group relative ${
              selectedUser?._id === user._id
                ? "bg-primary text-primary-content shadow-md shadow-primary/20"
                : "hover:bg-base-200 text-base-content"
            } ${isCollapsed ? 'justify-center p-2' : ''}`}
            title={isCollapsed ? user.fullName : ""}
          >
            <div className="relative">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full ring-2 ring-offset-2 ring-offset-base-100 transition-all duration-300 group-hover:scale-105"
                     style={{ borderColor: selectedUser?._id === user._id ? 'transparent' : 'var(--fallback-b3,oklch(var(--b3)))' }}>
                  <img
                    src={
                      user.profilePic || user.image ||
                      `https://ui-avatars.com/api/?name=${user.fullName}&background=random`
                    }
                    alt={user.fullName}
                  />
                </div>
              </div>
              {/* Online status indicator */}
              {onlineUsers.includes(user._id) && (
                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-base-100 rounded-full ${selectedUser?._id === user._id ? 'bg-green-300' : 'bg-success'}`}></span>
              )}
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className={`font-semibold text-sm truncate ${selectedUser?._id === user._id ? 'text-primary-content' : 'text-base-content'}`}>
                    {user.fullName}
                  </h3>
                  <span className={`text-[10px] whitespace-nowrap ${selectedUser?._id === user._id ? 'text-primary-content/70' : 'text-base-content/50'}`}>
                    Just now
                  </span>
                </div>
                <p className={`text-xs truncate ${selectedUser?._id === user._id ? 'text-primary-content/80' : 'text-base-content/60'}`}>
                  Click to start chatting...
                </p>
              </div>
            )}
          </div>
        )) : (
          !isCollapsed && (
            <div className="flex flex-col items-center justify-center h-40 text-base-content/40">
              <span className="loading loading-dots loading-md mb-2"></span>
              <p className="text-sm">No users found</p>
            </div>
          )
        )}
      </div>

      {/* User Profile Footer */}
      {authUser && (
        <div className="p-4 border-t border-base-300 bg-base-100/50 backdrop-blur-sm flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="avatar">
              <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={authUser.profilePic || authUser.image || `https://ui-avatars.com/api/?name=${authUser.fullName}`} alt={authUser.fullName} />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate w-32">
                <span className="font-semibold text-sm truncate">{authUser.fullName}</span>
                <span className="text-[10px] text-base-content/60 truncate">Online</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={logout} 
            className={`btn btn-ghost btn-circle btn-sm text-error hover:bg-error hover:text-white transition-colors ${isCollapsed ? 'hidden' : ''}`}
            title="Logout"
          >
            <FiLogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentChat;
