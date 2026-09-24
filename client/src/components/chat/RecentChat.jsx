import React, { useState, useEffect } from "react";
import { FiSearch, FiMenu, FiLogOut, FiPlus } from "react-icons/fi";
import useAuthStore from "../../store/useAuthStore";
import useChatStore from "../../store/useChatStore";
import { useSocket } from "../../context/SocketContext";

const RecentChat = ({ selectedUser, onSelectUser }) => {
  const [search, setSearch] = useState("");
  const { authUser } = useAuthStore();
  const { onlineUsers } = useSocket();
  const { chats, fetchChats } = useChatStore();

  useEffect(() => {
    fetchChats();
  }, []);

  const filteredChats = chats.filter((chat) => {
    const chatName = chat.isGroupChat ? chat.groupName : chat.users?.find(u => String(u._id) !== String(authUser._id))?.fullName;
    return chatName?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full w-full bg-base-100 p-2">
      {/* Header */}
      <div className="p-2 pb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold text-base-content">Chats</h2>
        </div>
        
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="input input-bordered input-sm w-full pl-9 bg-base-200 focus:outline-none rounded-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1">
        {filteredChats.length > 0 ? filteredChats.map((chat) => {
          const otherUser = chat.isGroupChat ? null : chat.users?.find(u => String(u._id) !== String(authUser._id));
          const chatName = chat.isGroupChat ? chat.groupName : otherUser?.fullName;
          const chatPic = chat.isGroupChat ? (chat.groupAvatar || `https://ui-avatars.com/api/?name=${chatName}`) : otherUser?.profilePic;
          const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;
          const userState = chat.userStates?.find(s => s.userId === authUser._id);
          const unreadCount = userState?.unreadCount || 0;

          return (
            <div
              key={chat._id}
              onClick={() => onSelectUser(chat)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                selectedUser?._id === chat._id ? "bg-base-200" : "hover:bg-base-200/50"
              }`}
            >
              <div className="relative shrink-0">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img src={chatPic} alt={chatName} />
                  </div>
                </div>
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-base-100 rounded-full bg-success"></span>
                )}
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center border-b border-base-300/50 pb-3 pt-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-base truncate text-base-content">{chatName}</h3>
                  {chat.latestMessage && (
                    <span className="text-xs whitespace-nowrap text-base-content/50">
                      {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm truncate text-base-content/60">
                    {chat.latestMessage ? (
                       chat.latestMessage.sender?._id === authUser._id 
                         ? `You: ${chat.latestMessage.content}` 
                         : chat.latestMessage.content
                    ) : "Start chatting"}
                  </p>
                  {unreadCount > 0 && (
                    <div className="badge badge-primary badge-sm rounded-full shrink-0">{unreadCount}</div>
                  )}
                </div>
              </div>
            </div>
          )
        }) : (
          <div className="flex flex-col items-center justify-center h-40 text-base-content/40">
            <p className="text-sm">No chats found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentChat;



