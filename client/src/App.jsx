import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Jobs from "./pages/Jobs";
import MediaSharing from "./pages/MediaSharing";
import GroupChats from "./pages/GroupChats";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Settings from "./pages/Settings";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/useAuthStore";
import useChatStore from "./store/useChatStore";
import IncomingCallModal from "./components/chat/IncomingCallModal";
import BackgroundOrbs from "./components/BackgroundOrbs";

// Routes that should NOT show the navbar
const NO_NAVBAR_ROUTES = ["/chat", "/status", "/media-viewer", "/message"];

const AppLayout = ({ authUser }) => {
  const location = useLocation();
  const showNavbar = !NO_NAVBAR_ROUTES.some((r) =>
    location.pathname.startsWith(r),
  );

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient background glowing orbs */}
      <BackgroundOrbs />

      {/* Main app content layer */}
      <div className="relative z-10 flex-1 flex flex-col">
        {showNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/media-sharing" element={<MediaSharing />} />
          <Route path="/group-chats" element={<GroupChats />} />
          <Route
            path="/settings/*"
            element={authUser ? <Settings /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile/*"
            element={authUser ? <Settings /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/chat/*"
            element={authUser ? <Chat /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/status/*"
            element={authUser ? <Chat /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/media-viewer/*"
            element={authUser ? <Chat /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/message/*"
            element={authUser ? <Chat /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={!authUser ? <Login /> : <Navigate to="/chat" replace />}
          />
          <Route
            path="/register"
            element={!authUser ? <Register /> : <Navigate to="/chat" replace />}
          />
          <Route
            path="/forgot-password"
            element={!authUser ? <ForgotPassword /> : <Navigate to="/chat" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <IncomingCallModal />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "rgba(15, 23, 42, 0.90)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#f8fafc",
            borderRadius: "14px",
            padding: "12px 18px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 20px 40px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          },
        }}
      />
    </div>
  );
};

const App = () => {
  const { authUser, checkAuth } = useAuthStore();
  const chats = useChatStore((state) => state.chats);

  // Validate session on mount ONLY if an existing session is in storage
  useEffect(() => {
    const hasExistingSession =
      localStorage.getItem("authUser") ||
      sessionStorage.getItem("authUser") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (hasExistingSession) {
      checkAuth();
    }
  }, []); // Run only once on mount

  // Apply saved theme on mount (default to dark)
  useEffect(() => {
    const savedTheme =
      authUser?.settings?.theme || localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, [authUser]);

  // Update document title for unread badges
  useEffect(() => {
    if (!authUser) {
      document.title = "VibeChat";
      return;
    }

    let totalUnread = 0;
    chats.forEach((chat) => {
      const userState = chat.userStates?.find(
        (s) =>
          s.userId?.toString() === authUser._id.toString() ||
          s.userId === authUser._id,
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
