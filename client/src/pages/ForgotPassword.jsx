import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiKey, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
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
    if (!validateEmail(email)) return toast.error("Please enter a valid email address");

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
      const msg = error.response?.data?.error || "Failed to send reset code. Please check your network.";
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-card p-8 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        {step === 1 && (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <FiKey size={26} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-2">
              Forgot Password
            </h2>
            <p className="text-center text-slate-300/70 mb-6 text-sm">
              Enter your registered email to receive a 6-digit verification code.
            </p>

            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 mb-4 text-xs text-rose-300 font-medium text-center leading-relaxed">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                  Email Address
                </label>
                <div
                  className={`glass-input flex items-center gap-3 px-3.5 py-3 ${
                    email && !validateEmail(email) ? "border-rose-500/70" : ""
                  }`}
                >
                  <FiMail className="text-slate-400 shrink-0" size={17} />
                  <input
                    type="email"
                    className="grow bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {email && !validateEmail(email) && (
                  <span className="text-xs text-rose-400 block pt-0.5">
                    Please enter a valid email address
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-glow w-full py-3.5 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 mt-4 shadow-xl"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Send Verification Code"
                )}
              </button>

              <div className="text-center pt-3">
                <Link
                  to="/login"
                  className="text-sm text-slate-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <FiArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4 transition-colors cursor-pointer"
            >
              <FiArrowLeft size={14} /> Change email
            </button>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 text-purple-300 flex items-center justify-center mx-auto mb-4 border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <FiLock size={26} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-1">
              Reset Password
            </h2>
            <p className="text-center text-slate-300/70 mb-4 text-xs">
              Code sent to <span className="font-semibold text-cyan-300">{email}</span>
            </p>

            {devOtp && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-cyan-300 block">
                    Test Code (Demo):
                  </span>
                  <span className="text-sm font-mono font-bold text-white tracking-widest">
                    {devOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-semibold border border-cyan-500/30 transition-colors"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    6-Digit Code
                  </span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="text-xs text-cyan-400 hover:underline font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"}
                  </button>
                </div>
                <div className="glass-input flex items-center gap-3 px-3.5 py-3">
                  <FiKey className="text-slate-400 shrink-0" size={17} />
                  <input
                    type="text"
                    maxLength={6}
                    className="grow font-mono tracking-widest text-center text-lg font-bold bg-transparent text-white focus:outline-none"
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                  New Password
                </label>
                <div className="glass-input flex items-center gap-3 px-3.5 py-3">
                  <FiLock className="text-slate-400 shrink-0" size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="grow bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                  Confirm Password
                </label>
                <div className="glass-input flex items-center gap-3 px-3.5 py-3">
                  <FiLock className="text-slate-400 shrink-0" size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="grow bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className="text-xs text-rose-400 block pt-0.5">
                    Passwords do not match
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-glow w-full py-3.5 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 mt-4 shadow-xl"
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
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 shadow-inner">
              <FiCheckCircle size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Password Reset!
            </h2>
            <p className="text-slate-300/70 mb-6 text-sm">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn-glow w-full py-3.5 text-base font-semibold rounded-xl shadow-xl"
            >
              Go to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
