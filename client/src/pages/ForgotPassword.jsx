import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../config/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateEmail = (val) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(val).trim().toLowerCase());
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    if (!email.trim()) return toast.error("Please enter your email");
    if (!validateEmail(email))
      return toast.error("Please enter a valid email address");

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      toast.success(res.data.message || "Verification code sent!");
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
      setResendCooldown(60);
      setStep(2);
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        "Failed to send reset code. Please check your network.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      toast.success("New verification code sent!");
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
      setResendCooldown(60);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (!otp.trim()) return toast.error("Please enter the 6-digit code");
    if (otp.trim().length !== 6) return toast.error("Code must be 6 digits");
    if (!newPassword) return toast.error("Please enter new password");
    if (newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });
      toast.success(res.data.message || "Password reset successful!");
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.error || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8 relative z-10 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[390px] rounded-[32px] bg-white border border-purple-100 shadow-[0_25px_70px_rgba(109,40,217,0.22)] p-7 sm:p-8 relative overflow-hidden text-gray-900"
      >
        {step === 1 && (
          <div>
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#7C3AED] border border-purple-200 w-14 h-14 mb-3 shadow-xs">
                <FiLock size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Forgot Password
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Enter your registered email to receive a 6-digit verification code.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-4 text-xs text-rose-600 font-medium text-center leading-relaxed">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#F9FAFB] border text-gray-900 transition-all focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:bg-white ${
                  email && !validateEmail(email)
                    ? "border-rose-500"
                    : "border-gray-200"
                }`}
              >
                <FiMail className="text-gray-400 shrink-0" size={18} />
                <input
                  type="email"
                  className="grow bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-full font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-lg shadow-purple-600/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center cursor-pointer disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Send Verification Code"
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-gray-500 hover:text-[#6D28D9] transition-colors inline-flex items-center gap-1.5"
                >
                  <FiArrowLeft size={13} /> Back to Login
                </Link>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-3 transition-colors cursor-pointer"
            >
              <FiArrowLeft size={14} /> Change email
            </button>

            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#7C3AED] border border-purple-200 w-13 h-13 mb-2 shadow-xs">
                <FiLock size={22} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Reset Password
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Code sent to <span className="font-semibold text-[#6D28D9]">{email}</span>
              </p>
            </div>

            {devOtp && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-2.5 mb-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-purple-700 block text-[11px]">
                    Demo Code:
                  </span>
                  <span className="text-sm font-mono font-bold text-[#6D28D9] tracking-widest">
                    {devOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-gray-900 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:bg-white">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-Digit Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 font-mono tracking-widest text-center focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-gray-900 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:bg-white">
                <FiLock className="text-gray-400 shrink-0" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="grow bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-gray-900 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:bg-white">
                <FiLock className="text-gray-400 shrink-0" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="grow bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-[#6D28D9] hover:underline font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Code"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-full font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-lg shadow-purple-600/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center cursor-pointer disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3.5 rounded-full font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-lg shadow-purple-600/30 transition-all duration-200 cursor-pointer text-sm sm:text-base"
            >
              Sign In Now
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
