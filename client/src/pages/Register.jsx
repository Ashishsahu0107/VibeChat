import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiRefreshCw,
  FiEdit3,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../config/api";
import useAuthStore from "../store/useAuthStore";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

// Lavender OTP Badge Logo (Screen 7)
const OtpBadgeLogo = ({ size = 64 }) => (
  <div
    className="inline-flex items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#7C3AED] border border-purple-200 shadow-sm mx-auto mb-3"
    style={{ width: size, height: size }}
  >
    <div className="relative flex items-center justify-center">
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
          fill="#C4B5FD"
          stroke="#7C3AED"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 6L12 13L2 6"
          stroke="#7C3AED"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute -bottom-1 font-mono text-[9px] font-extrabold tracking-widest text-[#6D28D9] bg-white px-1 rounded shadow-xs">
        OTP
      </span>
    </div>
  </div>
);

const Register = () => {
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const navigate = useNavigate();

  // Step: "form" (Screen 6) | "otp" (Screen 7)
  const [step, setStep] = useState("form");

  // Form State (Screen 6)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [ipBlocked, setIpBlocked] = useState(false);

  // OTP State (Screen 7: 6 individual square boxes)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);

  // Timers & Loading states
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiryCountdown, setExpiryCountdown] = useState(300);

  // 60-second resend cooldown timer
  useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // 5-minute expiry countdown timer
  useEffect(() => {
    let interval = null;
    if (step === "otp" && expiryCountdown > 0) {
      interval = setInterval(() => {
        setExpiryCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, expiryCountdown]);

  // Auto-focus first box in Step 2
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    }
  }, [step]);

  const validateEmail = (emailStr) => {
    return EMAIL_REGEX.test(String(emailStr).trim().toLowerCase());
  };

  const formatSeconds = (sec) => {
    const s = sec % 60;
    return `00:${s < 10 ? "0" : ""}${s}`;
  };

  /**
   * Screen 6: Sign Up button handler
   */
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/send-register-otp", {
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      toast.success(res.data.message || "Verification code sent to your email!");

      if (res.data.devOtp) {
        toast(`[Dev Mode] Verification Code: ${res.data.devOtp}`, {
          icon: "🔑",
          duration: 10000,
        });
        const digits = String(res.data.devOtp).split("").slice(0, 6);
        setOtp(digits);
      } else {
        setOtp(["", "", "", "", "", ""]);
      }

      setResendCooldown(res.data.resendCooldown || 60);
      setExpiryCountdown(res.data.expiresIn || 300);
      setIpBlocked(Boolean(res.data.ipBlocked));
      setStep("otp");
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "Failed to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Screen 7: OTP Digit Input Handling
   */
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value ? value.slice(-1) : "";
    setOtp(newOtp);

    // Auto-advance to next box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      if (idx < 6) newOtp[idx] = digit;
    });
    setOtp(newOtp);

    const nextIdx = Math.min(digits.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  /**
   * Screen 7: Verify button handler
   */
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();

    const fullCode = otp.join("");
    if (fullCode.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    if (expiryCountdown <= 0) {
      toast.error("Verification code has expired. Please request a new code.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-register-otp", {
        email: email.trim().toLowerCase(),
        otp: fullCode,
      });

      setAuthUser(res.data);
      toast.success(res.data.message || "Account verified and created!");
      navigate("/chat", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "Verification failed. Please check your code and try again."
      );
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Screen 7: Resend OTP
   */
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    try {
      const res = await api.post("/auth/resend-register-otp", {
        email: email.trim().toLowerCase(),
      });

      toast.success(res.data.message || "New verification code sent!");

      if (res.data.devOtp) {
        toast(`[Dev Mode] New Code: ${res.data.devOtp}`, {
          icon: "🔑",
          duration: 10000,
        });
        const digits = String(res.data.devOtp).split("").slice(0, 6);
        setOtp(digits);
      } else {
        setOtp(["", "", "", "", "", ""]);
      }

      setResendCooldown(res.data.resendCooldown || 60);
      setExpiryCountdown(res.data.expiresIn || 300);
      otpInputRefs.current[0]?.focus();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to resend verification code"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8 relative z-10 font-sans">
      {/* =====================================================================
          EXACT FIGMA MOBILE CARD CONTAINER (Clean White Screen on Deep Purple Canvas)
          ===================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[390px] rounded-[32px] bg-white border border-purple-100 shadow-[0_25px_70px_rgba(109,40,217,0.22)] p-7 sm:p-8 relative overflow-hidden text-gray-900"
      >
        <AnimatePresence mode="wait">
          {step === "form" ? (
            /* =====================================================================
               SCREEN 6: REGISTER (Create Account / Join ChatApp)
               ===================================================================== */
            <motion.div
              key="screen-6-register"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
            >
              {/* Header: ChatApp Logo + Create Account + Join ChatApp */}
              <div className="text-center mb-6">
                <ChatAppLogo size={52} className="mb-3.5" />
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Create Account
                </h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
                  Join ChatApp
                </p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-3.5">
                {/* 1. Full Name */}
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-gray-900 transition-all focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:bg-white">
                  <FiUser className="text-gray-400 shrink-0" size={18} />
                  <input
                    type="text"
                    className="grow bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* 2. Email or Phone */}
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
                    placeholder="Email or Phone"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* 3. Password */}
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-gray-900 transition-all focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:bg-white">
                  <FiLock className="text-gray-400 shrink-0" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="grow bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-700 transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {/* 4. Confirm Password */}
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-gray-900 transition-all focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 focus-within:bg-white">
                  <FiLock className="text-gray-400 shrink-0" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="grow bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-700 transition-colors focus:outline-none cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={16} />
                    ) : (
                      <FiEye size={16} />
                    )}
                  </button>
                </div>

                {/* Solid Purple Pill Button: Sign Up */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3.5 rounded-full font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-lg shadow-purple-600/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center cursor-pointer disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>

              {/* Footer: Already have an account? Login */}
              <p className="text-center text-xs sm:text-sm text-gray-500 mt-5">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#6D28D9] hover:text-[#5B21B6] font-bold transition-colors"
                >
                  Login
                </Link>
              </p>
            </motion.div>
          ) : (
            /* =====================================================================
               SCREEN 7: OTP VERIFY (Verify OTP / Enter 6-digit code)
               ===================================================================== */
            <motion.div
              key="screen-7-otp"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.22 }}
            >
              {/* Back button */}
              <button
                type="button"
                onClick={() => setStep("form")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2 cursor-pointer transition-colors"
              >
                <FiArrowLeft size={14} />
                <span>Back</span>
              </button>

              {/* Header: Lavender OTP Badge + Verify OTP */}
              <div className="text-center mb-5">
                <OtpBadgeLogo size={58} />
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Verify OTP
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Enter the 6-digit code sent to
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[#6D28D9] text-xs font-semibold">
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="text-purple-400 hover:text-[#6D28D9] transition-colors cursor-pointer"
                    title="Change email"
                  >
                    <FiEdit3 size={11} />
                  </button>
                </div>

                {ipBlocked && (
                  <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 animate-in fade-in">
                    <div className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
                      <span>⚠️ Brevo IP Authorization Required</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                      Brevo blocked delivery to your inbox (525). To receive emails in your inbox, check your Gmail for Brevo's <strong>"Validate IP address"</strong> email, or disable IP blocking in <em>Brevo &gt; Security &gt; Authorized IPs</em>.
                    </p>
                  </div>
                )}
              </div>

              {/* 6 Individual Square OTP Boxes */}
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div
                  className="flex justify-center items-center gap-1.5 sm:gap-2 my-2"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-extrabold rounded-2xl transition-all duration-200 focus:outline-none ${
                        digit
                          ? "border-2 border-[#7C3AED] bg-purple-50/60 text-[#6D28D9] shadow-sm"
                          : "border border-gray-200 bg-[#F9FAFB] text-gray-900 focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20"
                      }`}
                    />
                  ))}
                </div>

                {/* Resend OTP in 00:xx (Figma Screen 7) */}
                <div className="text-center text-xs">
                  {resendCooldown > 0 ? (
                    <span className="text-[#6D28D9] font-semibold font-mono">
                      Resend OTP in {formatSeconds(resendCooldown)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resending}
                      className="inline-flex items-center gap-1 text-[#6D28D9] hover:text-[#5B21B6] font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <FiRefreshCw
                        size={12}
                        className={resending ? "animate-spin" : ""}
                      />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>

                {/* Solid Purple Pill Button: Verify (Figma Screen 7) */}
                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6 || expiryCountdown <= 0}
                  className="w-full py-3.5 rounded-full font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-lg shadow-purple-600/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Register;
