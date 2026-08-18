import React, { useState } from 'react';
import RecentChat from '../components/chat/RecentChat';
import Chatting from '../components/chat/Chatting';

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-base-200 overflow-hidden ">
      <div className="w-full mx-auto flex h-full shadow-2xl overflow-hidden ">
        {/* Left Sidebar */}
        <div className={`border-r border-base-300 hidden md:block transition-all duration-300 ${isCollapsed ? "w-20" : "w-1/3 lg:w-1/4"}`}>
          <RecentChat 
            selectedUser={selectedUser} 
            onSelectUser={setSelectedUser} 
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        </div>
        
        {/* For mobile, if user is selected show chat, else show recent chat */}
        <div className={`w-full h-full md:hidden transition-all duration-300 ${selectedUser ? "hidden" : "block"}`}>
           <RecentChat 
             selectedUser={selectedUser} 
             onSelectUser={setSelectedUser} 
             isCollapsed={false} // never collapse on mobile
             setIsCollapsed={setIsCollapsed}
           />
        </div>
        
        {/* Right Chat Area */}
        <div className={`h-full transition-all duration-300 ${isCollapsed ? "md:w-[calc(100%-5rem)]" : "md:w-2/3 lg:w-3/4"} ${selectedUser ? "w-full block" : "hidden md:block w-full"}`}>
          {selectedUser && (
            <div className="md:hidden bg-base-100 p-2 border-b border-base-300">
               <button className="btn btn-sm" onClick={() => setSelectedUser(null)}>
                  ← Back to Chats
               </button>
            </div>
          )}
          <Chatting selectedUser={selectedUser} />
        </div>
      </div>
    </div>
  );
};

export default Chat;