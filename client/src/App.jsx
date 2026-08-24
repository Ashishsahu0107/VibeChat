import React from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Jobs from "./pages/Jobs";
import MediaSharing from "./pages/MediaSharing";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/useAuthStore";
import IncomingCallModal from "./components/chat/IncomingCallModal";

const App = () => {
  const authUser = useAuthStore((state) => state.authUser);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/jobs" element={<Jobs/>}/>
        <Route path="/media-sharing" element={<MediaSharing/>}/>
        <Route path="/settings" element={authUser ? <Settings/> : <Navigate to="/login" />}/>
        <Route path="/chat" element={authUser ? <Chat/> : <Navigate to="/login" />}/>
        <Route path="/login" element={!authUser ? <Login/> : <Navigate to="/chat" />}/>
        <Route path="/register" element={!authUser ? <Register/> : <Navigate to="/chat" />}/>
      </Routes>
      <IncomingCallModal />
      <Toaster position="top-center" />
    </BrowserRouter>
  );
};

export default App;
