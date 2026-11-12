import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEyeOff, FiEye, FiArrowRight, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../config/api";
import useAuthStore from "../store/useAuthStore";
import { useGoogleAuth } from "../config/GoogleAuth";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

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
  const { isLoading, error, isInitialized, signInWithGoogle } = useGoogleAuth();

  const handleGoogleSuccess = async (userData) => {
    console.log("Google Login Data", userData);
    setLoading(true);
    try {
      const res = await api.post("/auth/googleLogin", userData);

      toast.success(res.data.message);
      setAuthUser(res.data);
      setFormData({ email: "", password: "" });
      navigate("/chat");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const GoogleLogin = () => {
    signInWithGoogle(handleGoogleSuccess, handleGoogleFailure);
  };

  const handleGoogleFailure = (error) => {
    console.error("Google login failed:", error);
    toast.error("Google login failed. Please try again.");
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
      toast.error("Please enter a valid email address (e.g. user@example.com)");
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
      navigate("/chat");
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-card p-8 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle top specular glow highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-300 mb-4 shadow-lg shadow-cyan-500/10">
            <FiLock size={22} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-300/70 mt-1.5">
            Log in to your VibeChat account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
              Email Address
            </label>
            <div className={`glass-input flex items-center gap-3 px-3.5 py-3 ${formData.email && !validateEmail(formData.email) ? 'border-rose-500/70' : ''}`}>
              <FiMail className="text-slate-400 shrink-0" size={17} />
              <input
                type="email"
                name="email"
                className="grow bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {formData.email && !validateEmail(formData.email) && (
              <span className="text-xs text-rose-400 block pt-0.5">
                Please enter a valid email address
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="glass-input flex items-center gap-3 px-3.5 py-3">
              <FiLock className="text-slate-400 shrink-0" size={17} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="grow bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-glow w-full py-3.5 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 mt-2 shadow-xl"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <FiArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className="relative my-7 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-[#0d1424] px-4 text-xs uppercase tracking-wider text-slate-400 font-semibold rounded-full border border-white/[0.06]">
            Or continue with
          </span>
        </div>

        <button 
          type="button"
          className="btn-glass w-full py-3 px-4 flex items-center justify-center gap-3 text-sm font-medium hover:border-white/30 cursor-pointer"
          onClick={GoogleLogin}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-5 h-5"
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
          <span className="text-slate-100 font-semibold">Sign in with Google</span>
        </button>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Create Account
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
