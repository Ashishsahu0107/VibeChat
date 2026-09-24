import React, { useState, useEffect } from 'react';
import RecentChat from '../components/chat/RecentChat';
import Chatting from '../components/chat/Chatting';
import CallsList from '../components/chat/sidebar/CallsList';
import ContactsList from '../components/chat/sidebar/ContactsList';
import SettingsView from '../components/chat/sidebar/SettingsView';
import { FiMessageSquare, FiPhone, FiUsers, FiSettings, FiPlus } from "react-icons/fi";
import useChatStore from '../store/useChatStore';

const Chat = () => {
  const [activeTab, setActiveTab] = useState('chats'); // chats, calls, contacts, settings
  const { selectedChat, setSelectedChat } = useChatStore();

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSelectedChat(null); // On mobile/desktop, switching main tabs usually closes the active chat or we can keep it open on desktop. 
  };

  const navItems = [
    { id: 'chats', icon: <FiMessageSquare size={20} /> },
    { id: 'calls', icon: <FiPhone size={20} /> },
    { id: 'contacts', icon: <FiUsers size={20} /> },
    { id: 'settings', icon: <FiSettings size={20} /> },
  ];

  const renderSidebar = () => {
    switch(activeTab) {
      case 'calls': return <CallsList />;
      case 'contacts': return <ContactsList onSelectChat={(c) => { setSelectedChat(c); setActiveTab('chats'); }} />;
      case 'settings': return <SettingsView />;
      case 'chats':
      default:
        return <RecentChat 
            selectedUser={selectedChat} 
            onSelectUser={setSelectedChat} 
            isCollapsed={false}
            setIsCollapsed={() => {}}
          />;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-base-200 overflow-hidden relative">
      {/* Desktop Left Tabs Navigation */}
      <div className="hidden md:flex flex-col items-center py-4 bg-base-100 border-r border-base-300 w-[72px] h-full justify-between z-10 shrink-0">
        <div className="flex flex-col gap-4 w-full items-center">
          {navItems.map((item) => (
             <button 
                key={item.id} 
                onClick={() => handleTabSwitch(item.id)}
                className={`btn btn-circle ${activeTab === item.id ? 'bg-primary text-primary-content shadow-md shadow-primary/30' : 'btn-ghost text-base-content/70'}`}
             >
                {item.icon}
             </button>
          ))}
        </div>
      </div>

      <div className="w-full flex h-full shadow-2xl overflow-hidden pb-[4.5rem] md:pb-0">
        
        {/* Sidebar Area (Chats, Contacts, etc.) */}
        <div className={`border-r border-base-300 transition-all duration-300 md:w-1/3 lg:w-1/4 ${selectedChat ? "hidden md:block" : "w-full block"}`}>
          {renderSidebar()}
        </div>
        
        {/* Right Chat Area */}
        <div className={`h-full transition-all duration-300 md:w-2/3 lg:w-3/4 ${selectedChat ? "w-full block" : "hidden md:block w-full"}`}>
          {selectedChat ? (
            <div className="h-full flex flex-col relative">
              <div className="md:hidden absolute top-2 left-2 z-50">
                 <button className="btn btn-sm btn-circle btn-ghost bg-base-100/50 backdrop-blur-sm shadow-sm" onClick={() => setSelectedChat(null)}>
                    ?
                 </button>
              </div>
              <Chatting selectedUser={selectedChat} />
            </div>
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full bg-base-200/50 text-base-content/50">
               <div className="w-24 h-24 rounded-full bg-base-300 flex items-center justify-center mb-6">
                  <FiMessageSquare size={48} className="text-base-content/30" />
               </div>
               <h2 className="text-2xl font-bold mb-2 text-base-content/70">VibeChat Web</h2>
               <p className="max-w-md text-center">Select a chat to start messaging or go to Contacts to find someone new.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Tabs Navigation */}
      <div className={`md:hidden fixed bottom-0 left-0 w-full px-6 py-3 bg-base-100/90 backdrop-blur-md border-t border-base-300 z-50 flex justify-between items-center transition-transform duration-300 ${selectedChat ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="flex justify-between items-center w-full">
          {navItems.map((item) => (
             <button 
                key={item.id}
                onClick={() => handleTabSwitch(item.id)}
                className={`btn btn-ghost btn-circle btn-sm ${activeTab === item.id ? 'text-primary bg-primary/10' : 'text-base-content/70'}`}
             >
                {item.icon}
             </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;
