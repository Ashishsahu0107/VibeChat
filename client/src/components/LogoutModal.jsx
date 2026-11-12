import React, { useState, useEffect } from "react";
import { FiLogOut, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";

/**
 * Reusable Logout Confirmation Modal
 * Replaces standard browser window.confirm with a modern, glassmorphic popup.
 */
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setLoading(true);
    try {
      if (onConfirm) {
        await onConfirm();
      } else {
        await logout();
        navigate("/login");
        toast.success("Logged out successfully");
      }
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div
        className="glass-card w-full max-w-sm overflow-hidden border border-white/20 p-6 flex flex-col items-center text-center relative shadow-2xl shadow-rose-950/40 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top rose/purple accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <FiX size={18} />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/15">
          <FiLogOut size={24} className="translate-x-0.5" />
        </div>

        {/* Text */}
        <h3
          id="logout-modal-title"
          className="text-xl font-bold text-white mb-2"
        >
          Confirm Sign Out
        </h3>
        <p className="text-sm text-slate-300/80 mb-6 leading-relaxed">
          Are you sure you want to end your session? You can sign back in at any time.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-glass flex-1 py-2.5 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border border-white/20 shadow-lg shadow-rose-600/30 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign Out"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
