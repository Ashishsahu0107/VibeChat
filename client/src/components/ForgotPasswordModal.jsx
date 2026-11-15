import React, { useState, useEffect } from "react";
import {
  FiMail,
  FiLock,
  FiKey,
  FiEye,
  FiEyeOff,
  FiX,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../config/api";

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = "" }) => {
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP & New Password, 3 = Success
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync initialEmail when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialEmail) setEmail(initialEmail);
      setStep(1);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setDevOtp(null);
      setErrorMessage("");
    }
  }, [isOpen, initialEmail]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateEmail = (val) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(val).trim().toLowerCase());
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      toast.success(res.data.message || "Verification code sent!");
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
      }
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

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      toast.success("New verification code sent!");
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setResendCooldown(60);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }
    if (otp.trim().length !== 6) {
      toast.error("Verification code must be 6 digits");
      return;
    }
    if (!newPassword) {
      toast.error("Please enter your new password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

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
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[390px] rounded-[32px] bg-white border border-purple-100 shadow-[0_25px_70px_rgba(109,40,217,0.25)] p-7 sm:p-8 relative overflow-hidden text-gray-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <FiX size={18} />
        </button>

        {/* STEP 1: ENTER EMAIL */}
        {step === 1 && (
          <div>
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] border border-purple-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <FiLock size={24} />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                Forgot Password?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                Enter your registered email address and we'll send you a 6-digit
                code to reset your password.
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
                  email && !validateEmail(email) ? "border-rose-500" : "border-gray-200"
                }`}
              >
                <FiMail className="text-gray-400 shrink-0" size={18} />
                <input
                  type="email"
                  className="grow bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
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

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Back to Login
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: ENTER OTP & NEW PASSWORD */}
        {step === 2 && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-3 transition-colors cursor-pointer"
            >
              <FiArrowLeft size={14} /> Change email
            </button>

            <div className="text-center mb-4">
              <div className="w-13 h-13 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] border border-purple-200 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <FiLock size={22} />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                Reset Password
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Code sent to{" "}
                <span className="font-semibold text-[#6D28D9]">{email}</span>
              </p>
            </div>

            {/* Dev Mode OTP Banner (if simulated) */}
            {devOtp && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-2.5 mb-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-purple-700 block text-[11px]">
                    Demo Code:
                  </span>
                  <span className="text-sm font-mono tracking-widest font-bold text-[#6D28D9]">
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
              {/* 6-Digit OTP */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-600">
                    6-Digit Code
                  </span>
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
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-gray-900 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:bg-white">
                  <FiKey className="text-gray-400 shrink-0" size={17} />
                  <input
                    type="text"
                    maxLength={6}
                    className="grow font-mono tracking-widest text-center text-lg font-bold bg-transparent text-gray-900 focus:outline-none"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">
                  New Password
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-gray-900 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:bg-white">
                  <FiLock className="text-gray-400 shrink-0" size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="grow bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block">
                  Confirm Password
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-gray-900 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:bg-white">
                  <FiLock className="text-gray-400 shrink-0" size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="grow bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
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

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <FiCheckCircle size={32} />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              Password Reset!
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-5 leading-relaxed">
              Your password has been changed successfully. You can now log in
              with your new credentials.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-full font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-lg shadow-purple-600/30 transition-all duration-200 cursor-pointer text-sm sm:text-base"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
