import React from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/useAuthStore";

const App = () => {
  const authUser = useAuthStore((state) => state.authUser);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/chat" element={authUser ? <Chat/> : <Navigate to="/login" />}/>
        <Route path="/login" element={!authUser ? <Login/> : <Navigate to="/chat" />}/>
        <Route path="/register" element={!authUser ? <Register/> : <Navigate to="/chat" />}/>
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
};

export default App;
