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
      toast.error(error.response?.data?.error || "Failed to send reset code");
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
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");

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
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300"
      >
        <div className="card-body">
          {step === 1 && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 border border-primary/20">
                <FiKey size={26} />
              </div>
              <h2 className="text-3xl font-bold text-center text-primary mb-1">
                Forgot Password
              </h2>
              <p className="text-center text-base-content/70 mb-6 text-sm">
                Enter your registered email to receive a 6-digit verification code.
              </p>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Email</span>
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
                      placeholder="hello@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
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
                  className="btn btn-primary w-full text-lg mt-2"
                >
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </button>

                <div className="text-center pt-2">
                  <Link to="/login" className="link link-hover text-sm text-base-content/70 inline-flex items-center gap-1.5">
                    <FiArrowLeft size={14} /> Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs text-base-content/60 hover:text-base-content mb-2"
              >
                <FiArrowLeft size={14} /> Change email
              </button>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 border border-primary/20">
                <FiLock size={26} />
              </div>
              <h2 className="text-3xl font-bold text-center text-primary mb-1">
                Reset Password
              </h2>
              <p className="text-center text-base-content/70 mb-4 text-xs">
                Code sent to <span className="font-semibold text-base-content">{email}</span>
              </p>

              {devOtp && (
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-primary block">Test Code (Demo):</span>
                    <span className="text-sm font-mono font-bold text-base-content tracking-widest">{devOtp}</span>
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

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">New Password</span>
                  </label>
                  <label className="input input-bordered border-base-300 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                    <FiLock className="text-base-content/50" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="grow"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </label>
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Confirm Password</span>
                  </label>
                  <label className="input input-bordered border-base-300 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                    <FiLock className="text-base-content/50" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="grow"
                      placeholder="••••••••"
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
                  className="btn btn-primary w-full text-lg mt-2"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4 border border-success/20">
                <FiCheckCircle size={32} />
              </div>
              <h2 className="text-3xl font-bold text-center text-primary mb-2">
                Password Reset!
              </h2>
              <p className="text-center text-base-content/70 mb-6 text-sm">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="btn btn-primary w-full text-lg"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
