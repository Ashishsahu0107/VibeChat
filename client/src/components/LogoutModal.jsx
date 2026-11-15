import React, { useState, useEffect } from "react";
import { FiLogOut, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";

/**
 * Reusable Logout Confirmation Modal (Figma Screen 20: Logout)
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
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      {/* Clean White Card Modal (Figma Screen 20) */}
      <div
        className="w-full max-w-[340px] rounded-[28px] bg-white border border-gray-100 shadow-[0_25px_60px_rgba(0,0,0,0.35)] p-6 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-200 text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <FiX size={16} />
        </button>

        {/* Red Logout Circle Icon (Screen 20) */}
        <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-3.5 shadow-sm">
          <FiLogOut size={22} className="translate-x-0.5" />
        </div>

        {/* Text */}
        <h3
          id="logout-modal-title"
          className="text-xl font-bold text-gray-900 mb-1"
        >
          Log Out?
        </h3>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed px-2">
          Are you sure you want to log out from ChatApp?
        </p>

        {/* Action Buttons: Cancel (gray pill) & Log Out (red pill) */}
        <div className="flex gap-2.5 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] shadow-md shadow-rose-500/30 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Log Out"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;