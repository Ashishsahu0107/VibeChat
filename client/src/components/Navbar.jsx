import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMessageSquare, FiMenu } from "react-icons/fi";

import useAuthStore from "../store/useAuthStore";

const Navbar = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [selectedTheme, setSelectedTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedTheme]);

  const handleThemeChange = (e) => {
    setSelectedTheme(e.target.value);
  };

  const themes = [
    "light", "dark", "black", "claude", "corporate", "ghibli", "gourmet", 
    "luxury", "mintlify", "pastel", "perplexity", "shadcn", "slack", 
    "soft", "spotify", "valorant", "vscode"
  ];

  return (
    <nav className={`sticky top-0 w-full transition-all duration-300 ${isScrolled ? "bg-base-100/80 backdrop-blur-lg shadow-sm" : "bg-base-100"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-content shadow-lg shadow-primary/30">
              <FiMessageSquare size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              VibeChat
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/recentchat" className="text-base-content/80 hover:text-primary transition-colors font-medium">Chats</Link>
            <Link to="/contact" className="text-base-content/80 hover:text-primary transition-colors font-medium">Contact</Link>
            
            <div className="flex items-center gap-4 border-l border-base-content/20 pl-6">
              <select
                className="select select-bordered select-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={selectedTheme}
                onChange={handleThemeChange}
              >
                {themes.map((theme) => (
                  <option key={theme} value={theme}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
                ))}
              </select>
              {!authUser && (
                <>
                  <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                  <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <select
                className="select select-bordered select-sm w-24 focus:outline-none"
                value={selectedTheme}
                onChange={handleThemeChange}
              >
                {themes.map((theme) => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            <button className="btn btn-ghost btn-circle">
              <FiMenu size={24} className="text-base-content" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
