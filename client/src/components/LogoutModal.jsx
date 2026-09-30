import React, { useState, useEffect } from "react";
import { FiLogOut, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";

/**
 * Reusable Logout Confirmation Modal
 * Replaces standard browser window.confirm with a modern, responsive popup.
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
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div
        className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-base-300 p-6 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-base-content/40 hover:text-base-content hover:bg-base-200 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <FiX size={18} />
        </button>

        {/* Warning / Logout Icon */}
        <div className="w-14 h-14 rounded-full bg-error/10 text-error flex items-center justify-center mb-4 border border-error/20 shadow-inner">
          <FiLogOut size={26} className="translate-x-0.5" />
        </div>

        {/* Title & Description */}
        <h3 id="logout-modal-title" className="text-xl font-bold text-base-content mb-2">
          Log Out?
        </h3>
        <p className="text-sm text-base-content/70 mb-6 leading-relaxed px-2">
          Are you sure you want to log out of VibeChat? You will need to sign in again to access your messages and calls.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 btn btn-ghost border border-base-300 hover:bg-base-200 text-base-content rounded-xl font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 btn btn-error text-white rounded-xl font-semibold shadow-md shadow-error/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <FiLogOut size={16} />
                <span>Log Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
