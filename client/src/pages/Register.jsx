import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiShield, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../config/api';
import useAuthStore from "../store/useAuthStore";

const Register = () => {
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const validateEmail = (emailStr) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(emailStr).trim().toLowerCase());
  };

  const handleSubmit = async (e) => {
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
      toast.error("Please enter a valid email address (e.g. user@example.com)");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setAuthUser(res.data);
      toast.success(res.data.message || "Account created successfully!");
      navigate("/chat", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
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
        {/* Top glowing specular highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 mb-4 shadow-lg shadow-purple-500/10">
            <FiShield size={22} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Account
          </h2>
          <p className="text-sm text-slate-300/70 mt-1.5">
            Join VibeChat to unlock modern real-time connection
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
              Full Name
            </label>
            <div className="glass-input flex items-center gap-3 px-3.5 py-3">
              <FiUser className="text-slate-400 shrink-0" size={17} />
              <input 
                type="text" 
                className="grow bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500" 
                placeholder="Alex Morgan" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
              Email Address
            </label>
            <div className={`glass-input flex items-center gap-3 px-3.5 py-3 ${email && !validateEmail(email) ? 'border-rose-500/70' : ''}`}>
              <FiMail className="text-slate-400 shrink-0" size={17} />
              <input 
                type="email" 
                className="grow bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500" 
                placeholder="alex@example.com" 
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
              Password
            </label>
            <div className="glass-input flex items-center gap-3 px-3.5 py-3">
              <FiLock className="text-slate-400 shrink-0" size={17} />
              <input 
                type="password" 
                className="grow bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500" 
                placeholder="At least 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <span className="text-[11px] text-slate-400 block">
              Must be at least 6 characters long
            </span>
          </div>

          <button
            type="submit"
            className="btn-glow w-full py-3.5 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 mt-4 shadow-xl"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Your Account</span>
                <FiArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
