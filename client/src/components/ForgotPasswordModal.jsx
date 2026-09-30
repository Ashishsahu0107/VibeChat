import React, { useState, useEffect } from "react";
import { FiMail, FiLock, FiKey, FiEye, FiEyeOff, FiX, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
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
      const msg = error.response?.data?.error || "Failed to send reset code. Please check your network.";
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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-base-300 p-6 sm:p-8 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-base-content/40 hover:text-base-content hover:bg-base-200 rounded-full transition-colors"
          aria-label="Close"
        >
          <FiX size={18} />
        </button>

        {/* STEP 1: ENTER EMAIL */}
        {step === 1 && (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-inner">
              <FiKey size={26} />
            </div>

            <h3 className="text-2xl font-bold text-center text-base-content mb-2">
              Forgot Password?
            </h3>
            <p className="text-sm text-center text-base-content/70 mb-6 leading-relaxed">
              Enter your registered email address and we'll send you a 6-digit code to reset your password.
            </p>

            {errorMessage && (
              <div className="bg-error/10 border border-error/20 rounded-2xl p-3 mb-4 text-xs text-error font-medium text-center leading-relaxed">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                    Email Address
                  </span>
                </label>
                <label
                  className={`input input-bordered flex items-center gap-2 transition-all ${
                    email && !validateEmail(email) ? "border-error" : "border-base-300"
                  } focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent`}
                >
                  <FiMail className="text-base-content/50" />
                  <input
                    type="email"
                    className="grow"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </label>
                {email && !validateEmail(email) && (
                  <span className="text-xs text-error mt-1 ml-1">
                    Please enter a valid email address
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-base font-semibold rounded-xl shadow-lg shadow-primary/25 mt-2"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Send Verification Code"
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost border border-base-300 w-full text-sm rounded-xl font-medium"
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
              className="inline-flex items-center gap-1.5 text-xs font-medium text-base-content/60 hover:text-base-content mb-4 transition-colors"
            >
              <FiArrowLeft size={14} /> Change email
            </button>

            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-inner">
              <FiLock size={26} />
            </div>

            <h3 className="text-2xl font-bold text-center text-base-content mb-1">
              Reset Password
            </h3>
            <p className="text-xs text-center text-base-content/70 mb-4 px-2">
              Code sent to <span className="font-semibold text-base-content">{email}</span>
            </p>

            {/* Dev Mode OTP Banner (if simulated) */}
            {devOtp && (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-primary block">Test Code (Demo):</span>
                  <span className="text-sm font-mono tracking-widest font-bold text-base-content">{devOtp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="btn btn-xs btn-primary rounded-lg"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* 6-Digit OTP */}
              <div className="form-control w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                    6-Digit Code
                  </span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                  </button>
                </div>
                <label className="input input-bordered border-base-300 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                  <FiKey className="text-base-content/50" />
                  <input
                    type="text"
                    maxLength={6}
                    className="grow font-mono tracking-widest text-center text-lg font-bold"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    autoFocus
                  />
                </label>
              </div>

              {/* New Password */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                    New Password
                  </span>
                </label>
                <label className="input input-bordered border-base-300 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                  <FiLock className="text-base-content/50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="grow"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-base-content/50 hover:text-base-content"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </label>
              </div>

              {/* Confirm Password */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                    Confirm New Password
                  </span>
                </label>
                <label className="input input-bordered border-base-300 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                  <FiLock className="text-base-content/50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="grow"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </label>
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className="text-xs text-error mt-1 ml-1">
                    Passwords do not match
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-base font-semibold rounded-xl shadow-lg shadow-primary/25 mt-2"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
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
            <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4 border border-success/20 shadow-inner">
              <FiCheckCircle size={32} />
            </div>

            <h3 className="text-2xl font-bold text-base-content mb-2">
              Password Reset!
            </h3>
            <p className="text-sm text-base-content/70 mb-6 leading-relaxed">
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary w-full text-base font-semibold rounded-xl shadow-lg shadow-primary/25"
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
