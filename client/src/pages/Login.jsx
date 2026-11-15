import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEyeOff, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../config/api";
import useAuthStore from "../store/useAuthStore";
import { useGoogleAuth } from "../config/GoogleAuth";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

// ChatApp Purple Logo (from Figma Screens 1, 5, 6, 7, 8)
const ChatAppLogo = ({ size = 56, className = "" }) => (
  <div
    className={`inline-flex items-center justify-center rounded-2xl bg-[#7C3AED] text-white shadow-lg shadow-purple-600/35 border border-purple-400/30 ${className}`}
    style={{ width: size, height: size }}
  >
    <svg
      width={size * 0.55}
      height={size * 0.55}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3C6.477 3 2 6.918 2 11.75C2 14.156 3.12 16.326 4.965 17.868C4.52 19.467 3.53 20.843 3.495 20.892C3.33 21.121 3.376 21.439 3.6 21.611C3.722 21.706 3.869 21.75 4.015 21.75C4.12 21.75 4.225 21.724 4.321 21.671C6.273 20.605 7.828 19.866 8.529 19.504C9.627 19.824 10.792 20 12 20C17.523 20 22 16.082 22 11.75C22 6.918 17.523 3 12 3Z"
        fill="currentColor"
      />
      <circle cx="8" cy="11.75" r="1.5" fill="#FFFFFF" />
      <circle cx="12" cy="11.75" r="1.5" fill="#FFFFFF" />
      <circle cx="16" cy="11.75" r="1.5" fill="#FFFFFF" />
    </svg>
  </div>
);

const Login = () => {
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useGoogleAuth();

  const handleGoogleSuccess = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/googleLogin", userData);
      setAuthUser(res.data);
      toast.success(res.data.message || "Logged in with Google!");
      setFormData({ email: "", password: "" });
      navigate("/chat", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const GoogleLogin = () => {
    signInWithGoogle(handleGoogleSuccess, (error) => {
      console.error("Google login failed:", error);
      toast.error("Google login failed. Please try again.");
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (emailStr) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(emailStr).trim().toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      setAuthUser(res.data);
      toast.success(res.data.message || "Logged in successfully!");
      navigate("/chat", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8 relative z-10 font-sans">
      {/* =====================================================================
          EXACT FIGMA SCREEN 5: LOGIN (Clean White Mobile Card)
          ===================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[390px] rounded-[32px] bg-white border border-purple-100 shadow-[0_25px_70px_rgba(109,40,217,0.22)] p-7 sm:p-8 relative overflow-hidden text-gray-900"
      >
        {/* Header: ChatApp Logo + Welcome Back + Subtitle */}
        <div className="text-center mb-6">
          <ChatAppLogo size={52} className="mb-3.5" />
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome Back 👋
          </h2>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
            Login to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email or Phone */}
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-gray-900 transition-all focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:bg-white">
            <FiMail className="text-gray-400 shrink-0" size={18} />
            <input
              type="email"
              name="email"
              className="grow bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              placeholder="Email or Phone"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-gray-900 transition-all focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:bg-white">
            <FiLock className="text-gray-400 shrink-0" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="grow bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-700 transition-colors focus:outline-none cursor-pointer"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-[#6D28D9] hover:text-[#5B21B6] transition-colors font-semibold cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Solid Purple Pill Button: Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-full font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-lg shadow-purple-600/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center cursor-pointer disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Divider: or continue with */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <span className="relative bg-white px-3 text-xs text-gray-400 font-medium">
            or continue with
          </span>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={GoogleLogin}
          className="w-full py-3 px-4 rounded-full bg-[#F9FAFB] border border-gray-200 hover:bg-gray-100/70 hover:border-gray-300 text-xs sm:text-sm font-semibold text-gray-700 flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-xs"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
          >
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.653-3.342-11.124-7.868l-6.57 4.819C9.656 39.663 16.318 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer: Don't have an account? Sign Up */}
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-5">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#6D28D9] hover:text-[#5B21B6] font-bold transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </motion.div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        initialEmail={formData.email}
      />
    </div>
  );
};

export default Login;
