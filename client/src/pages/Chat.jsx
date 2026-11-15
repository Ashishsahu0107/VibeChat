import React, { useState, useEffect } from 'react';
import RecentChat from '../components/chat/RecentChat';
import Chatting from '../components/chat/Chatting';
import ContactsList from '../components/chat/sidebar/ContactsList';
import CallsList from '../components/chat/sidebar/CallsList';
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
  { id: 'calls', icon: <FiPhone size={20} />, label: 'Calls' },
  { id: 'contacts', icon: <FiUsers size={20} />, label: 'Contacts' },
  { id: 'status', icon: <FiCircle size={20} />, label: 'Status' },
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
      case 'calls':
        return <CallsList onBack={() => setActiveTab('chats')} />;
      case 'status':
        return <StatusList />;
      case 'contacts':
        return (
          <ContactsList
            onSelectChat={(c) => {
              setSelectedChat(c);
              setActiveTab('chats');
            }}
            onBack={() => setActiveTab('chats')}
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
    <div className="h-screen h-[100dvh] flex bg-[#07090e] overflow-hidden relative font-sans text-slate-100">
      {/* ── Desktop Left Icon Rail ───────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col items-center py-5 bg-[#0a0f1d]/85 backdrop-blur-2xl border-r border-white/10 w-[74px] shrink-0 justify-between z-20 shadow-xl shadow-black/40">
        <div className="flex flex-col gap-3 w-full items-center">
          {/* Profile avatar with glowing ring */}
          <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] shadow-lg shadow-purple-600/25 mb-3 cursor-pointer hover:scale-105 transition-transform" onClick={() => handleTabSwitch('settings')}>
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
              <img
                src={authUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.fullName || 'U')}&background=7c3aed&color=fff`}
                alt={authUser?.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-2 w-full items-center">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  title={item.label}
                  onClick={() => handleTabSwitch(item.id)}
                  className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-600/35 border border-purple-400/25 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {item.icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Connection indicator */}
        <div className="flex flex-col items-center gap-1.5 pb-2">
          <div 
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              socketConnected 
                ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' 
                : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse'
            }`} 
            title={socketConnected ? 'Connected to live network' : 'Disconnected / Reconnecting'} 
          />
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────────────────────────── */}
      <div className={`flex flex-1 h-full overflow-hidden ${selectedChat ? 'pb-0' : 'pb-[4.5rem]'} md:pb-0 relative z-10`}>
        {/* Sidebar */}
        <div
          className={`shrink-0 border-r border-white/10 transition-all duration-200 md:w-[320px] lg:w-[360px] xl:w-[400px] bg-[#0c1324]/80 backdrop-blur-2xl ${
            selectedChat ? 'hidden md:block' : 'w-full block'
          }`}
        >
          {renderSidebar()}
        </div>

        {/* Chat Window */}
        <div
          className={`flex-1 h-full transition-all duration-200 bg-[#07090e]/70 backdrop-blur-md ${
            selectedChat ? 'flex flex-col' : 'hidden md:flex flex-col'
          }`}
        >
          {selectedChat ? (
            <Chatting
              selectedUser={selectedChat}
              onBack={handleBack}
            />
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full p-8 select-none relative overflow-hidden text-center">
              {/* Center glow aura */}
              <div className="w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-purple-600/15 blur-[80px] pointer-events-none absolute" />

              <div className="relative z-10 glass-card p-10 max-w-md border border-white/15 shadow-2xl shadow-blue-950/40">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-white/15 flex items-center justify-center mb-6 mx-auto text-cyan-400 shadow-xl shadow-cyan-500/15">
                  <FiMessageSquare size={36} className="drop-shadow" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">VibeChat Workspace</h2>
                <p className="text-sm text-slate-300/80 leading-relaxed max-w-sm mx-auto mb-6">
                  Select an active conversation from the sidebar or click the <strong className="text-cyan-400 font-semibold">+</strong> button to start a new chat.
                </p>
                {!socketConnected ? (
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-4 py-2 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                    Reconnecting to live server…
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-4 py-1.5 rounded-full text-xs font-medium">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    Ready for real-time messaging
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Bottom Navigation ─────────────────────────────────────────── */}
      {!selectedChat && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0f1d]/90 backdrop-blur-2xl border-t border-white/10 z-50 shadow-2xl">
          <div className="flex justify-around items-center px-4 py-2 pb-safe">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSwitch(item.id)}
                  className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#A78BFA] font-semibold scale-105'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={isActive ? 'drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]' : ''}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
