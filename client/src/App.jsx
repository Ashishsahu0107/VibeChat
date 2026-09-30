import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Jobs from "./pages/Jobs";
import MediaSharing from "./pages/MediaSharing";
import GroupChats from "./pages/GroupChats";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/useAuthStore";
import useChatStore from "./store/useChatStore";
import IncomingCallModal from "./components/chat/IncomingCallModal";

// Routes that should NOT show the navbar
const NO_NAVBAR_ROUTES = ["/chat", "/status", "/media-viewer", "/message"];

const AppLayout = ({ authUser }) => {
  const location = useLocation();
  const showNavbar = !NO_NAVBAR_ROUTES.some((r) => location.pathname.startsWith(r));

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/media-sharing" element={<MediaSharing />} />
        <Route path="/group-chats" element={<GroupChats />} />
        <Route
          path="/settings/*"
          element={authUser ? <Settings /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/*"
          element={authUser ? <Settings /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat/*"
          element={authUser ? <Chat /> : <Navigate to="/login" />}
        />
        <Route
          path="/status/*"
          element={authUser ? <Chat /> : <Navigate to="/login" />}
        />
        <Route
          path="/media-viewer/*"
          element={authUser ? <Chat /> : <Navigate to="/login" />}
        />
        <Route
          path="/message/*"
          element={authUser ? <Chat /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/chat" />}
        />
        <Route
          path="/register"
          element={!authUser ? <Register /> : <Navigate to="/chat" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <IncomingCallModal />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "13px",
          },
        }}
      />
    </>
  );
};

const App = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const chats = useChatStore((state) => state.chats);

  // Apply saved theme on mount
  useEffect(() => {
    const savedTheme = authUser?.settings?.theme || localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, [authUser]);

  // Update document title for unread badges
  useEffect(() => {
    if (!authUser) {
      document.title = "VibeChat";
      return;
    }
    
    let totalUnread = 0;
    chats.forEach(chat => {
      const userState = chat.userStates?.find(
        (s) => s.userId?.toString() === authUser._id.toString() || s.userId === authUser._id
      );
      if (userState && userState.unreadCount > 0 && !userState.isMuted) {
        totalUnread += userState.unreadCount;
      }
    });

    if (totalUnread > 0) {
      document.title = `(${totalUnread}) VibeChat`;
    } else {
      document.title = "VibeChat";
    }
  }, [chats, authUser]);

  return (
    <BrowserRouter>
      <AppLayout authUser={authUser} />
    </BrowserRouter>
  );
};

export default App;
