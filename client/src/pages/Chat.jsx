import React, { useState, useEffect } from 'react';
import RecentChat from '../components/chat/RecentChat';
import Chatting from '../components/chat/Chatting';
import ContactsList from '../components/chat/sidebar/ContactsList';
import SettingsView from '../components/chat/sidebar/SettingsView';
import StatusList from '../components/chat/sidebar/StatusList';
import { FiMessageSquare, FiPhone, FiUsers, FiSettings, FiSearch, FiCircle } from 'react-icons/fi';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import { useSocket } from '../context/SocketContext';
import IncomingCallModal from '../components/chat/IncomingCallModal';
import GlobalSearchModal from '../components/chat/GlobalSearchModal';

const NAV_ITEMS = [
  { id: 'chats', icon: <FiMessageSquare size={20} />, label: 'Chats' },
  { id: 'status', icon: <FiCircle size={20} />, label: 'Status' },
  { id: 'search', icon: <FiSearch size={20} />, label: 'Search' },
  { id: 'contacts', icon: <FiUsers size={20} />, label: 'Contacts' },
  { id: 'settings', icon: <FiSettings size={20} />, label: 'Settings' },
];

const Chat = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { selectedChat, setSelectedChat } = useChatStore();
  const { authUser } = useAuthStore();
  const { socketConnected } = useSocket();

  const handleTabSwitch = (tab) => {
    if (tab === 'search') {
      setShowSearchModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  const renderSidebar = () => {
    switch (activeTab) {
      case 'status':
        return <StatusList />;
      case 'contacts':
        return (
          <ContactsList
            onSelectChat={(c) => {
              setSelectedChat(c);
              setActiveTab('chats');
            }}
          />
        );
      case 'settings':
        return <SettingsView />;
      case 'chats':
      default:
        return (
          <RecentChat
            selectedUser={selectedChat}
            onSelectUser={setSelectedChat}
          />
        );
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-base-200 overflow-hidden">
      {/* ── Desktop Left Icon Nav ───────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col items-center py-4 bg-base-100 border-r border-base-300 w-[72px] shrink-0 justify-between">
        <div className="flex flex-col gap-2 w-full items-center">
          {/* Profile avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20 mb-2">
            <img
              src={authUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.fullName || 'U')}&background=7c3aed&color=fff`}
              alt={authUser?.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              title={item.label}
              onClick={() => handleTabSwitch(item.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                activeTab === item.id
                  ? 'bg-primary text-primary-content shadow-md shadow-primary/30'
                  : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
              }`}
            >
              {item.icon}
            </button>
          ))}
        </div>
        {/* Connection indicator */}
        <div className={`w-2 h-2 rounded-full mb-2 ${socketConnected ? 'bg-success' : 'bg-error'}`} title={socketConnected ? 'Connected' : 'Disconnected'} />
      </div>

      {/* ── Main Layout ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 h-full overflow-hidden pb-[4.5rem] md:pb-0">
        {/* Sidebar */}
        <div
          className={`shrink-0 border-r border-base-300 transition-all duration-200 md:w-[320px] lg:w-[360px] xl:w-[400px] ${
            selectedChat ? 'hidden md:block' : 'w-full block'
          }`}
        >
          {renderSidebar()}
        </div>

        {/* Chat Window */}
        <div
          className={`flex-1 h-full transition-all duration-200 ${
            selectedChat ? 'flex flex-col' : 'hidden md:flex flex-col'
          }`}
        >
          {selectedChat ? (
            <Chatting
              selectedUser={selectedChat}
              onBack={handleBack}
            />
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full bg-base-200/50 select-none">
              <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <FiMessageSquare size={56} className="text-primary/30" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-base-content/60">VibeChat Web</h2>
              <p className="text-sm text-base-content/40 max-w-xs text-center">
                Select a conversation from the left to start messaging,
                or click <strong>+</strong> to start a new chat.
              </p>
              {!socketConnected && (
                <div className="mt-6 flex items-center gap-2 bg-warning/10 text-warning px-4 py-2 rounded-full text-sm">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                  Connecting…
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Bottom Nav ────────────────────────────────────────────────── */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-base-100/95 backdrop-blur-md border-t border-base-300 z-50 transition-transform duration-200 ${
          selectedChat ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-around items-center px-4 py-2 pb-safe">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabSwitch(item.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors ${
                activeTab === item.id
                  ? 'text-primary'
                  : 'text-base-content/50'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <IncomingCallModal />
      {showSearchModal && (
        <GlobalSearchModal 
          onClose={() => setShowSearchModal(false)}
          onSelectChat={setSelectedChat}
        />
      )}
    </div>
  );
};

export default Chat;
