import React, { useState, useEffect } from "react";
import { FiSearch, FiMenu, FiLogOut } from "react-icons/fi";
import useAuthStore from "../../store/useAuthStore";
import api from "../../config/api";

const RecentChat = ({ selectedUser, onSelectUser, isCollapsed, setIsCollapsed }) => {
  const [search, setSearch] = useState("");
  const { authUser, logout } = useAuthStore();
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => onSelectUser(user)}
            className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
              selectedUser?._id === user._id
                ? "bg-primary/10 border-l-4 border-primary"
                : "hover:bg-base-200 border-l-4 border-transparent"
            } ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? user.fullName : ""}
          >
            <div className="avatar">
              <div className="w-12 h-12 rounded-full">
                <img
                  src={
                    user.profilePic || user.image ||
                    `https://ui-avatars.com/api/?name=${user.fullName}&background=random`
                  }
                  alt={user.fullName}
                />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-base-content capitalize truncate">
                    {user.fullName}
                  </h3>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Profile Footer */}
      {authUser && (
        <div className="p-4 border-t border-base-300 bg-base-200 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="avatar online">
              <div className="w-10 h-10 rounded-full bg-base-300">
                <img src={authUser.profilePic || `https://ui-avatars.com/api/?name=${authUser.fullName}`} alt={authUser.fullName} />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate w-32">
                <span className="font-semibold text-sm truncate">{authUser.fullName}</span>
                <span className="text-xs text-base-content/60 truncate">{authUser.email}</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={logout} 
            className={`btn btn-ghost btn-circle btn-sm text-error hover:bg-error/10 ${isCollapsed ? 'hidden' : ''}`}
            title="Logout"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentChat;
