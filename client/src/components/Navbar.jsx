import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiMessageSquare,
  FiMenu,
  FiX,
  FiSettings,
  FiLogOut,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import useAuthStore from "../store/useAuthStore";
import LogoutModal from "./LogoutModal";

const Navbar = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(
    localStorage.getItem("theme") || "dark",
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleThemeChange = (e) => {
    setSelectedTheme(e.target.value);
  };

  const themes = [
    "dark",
    "luxury",
    "black",
    "spotify",
    "valorant",
    "vscode",
    "light",
    "corporate",
    "mintlify",
    "shadcn",
    "slack",
  ];

  const navLinks = [
    { to: "/chat", label: "Chats" },
    { to: "/group-chats", label: "Groups" },
    { to: "/media-sharing", label: "Media" },
    { to: "/jobs", label: "Careers" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#0a0f1d]/75 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/30"
          : "bg-[#07090e]/60 backdrop-blur-md border-b border-white/[0.06]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-white/20 group-hover:scale-105 transition-transform">
              <FiMessageSquare size={20} className="drop-shadow" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient tracking-tight">
                VibeChat
              </span>
              <span className="text-[10px] text-cyan-400/80 uppercase font-semibold tracking-widest -mt-1">
                Real-Time
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] p-1 rounded-full backdrop-blur-md">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3 border-l border-white/10 pl-5">
              <select
                className="glass-input text-xs py-1.5 px-3 w-28 cursor-pointer focus:ring-1 focus:ring-cyan-500"
                value={selectedTheme}
                onChange={handleThemeChange}
                aria-label="Theme selector"
              >
                {themes.map((theme) => (
                  <option
                    key={theme}
                    value={theme}
                    className="bg-slate-900 text-slate-100"
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>

              {authUser ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/settings"
                    className="btn-glass px-3 py-1.5 text-xs flex items-center gap-1.5 font-medium hover:border-cyan-500/40"
                  >
                    <FiSettings size={13} />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="px-3 py-1.5 text-xs rounded-xl font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all flex items-center gap-1.5"
                  >
                    <FiLogOut size={13} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="btn-glass px-4 py-1.5 text-xs font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-glow px-4 py-1.5 text-xs font-semibold"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button & Quick Theme */}
          <div className="md:hidden flex items-center gap-3">
            <select
              className="glass-input text-xs py-1 px-2 w-24"
              value={selectedTheme}
              onChange={handleThemeChange}
              aria-label="Theme selector mobile"
            >
              {themes.map((theme) => (
                <option
                  key={theme}
                  value={theme}
                  className="bg-slate-900 text-slate-100"
                >
                  {theme}
                </option>
              ))}
            </select>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-slate-200 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/15 px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2 mt-2">
              {authUser ? (
                <>
                  <Link
                    to="/settings"
                    className="btn-glass w-full py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <FiSettings size={15} />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-rose-300 bg-rose-500/10 border border-rose-500/30 flex items-center justify-center gap-2"
                  >
                    <FiLogOut size={15} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="btn-glass py-2.5 text-center text-sm font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-glow py-2.5 text-center text-sm font-semibold"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </nav>
  );
};

export default Navbar;
