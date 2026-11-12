import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiSend, FiUser, FiMessageSquare } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../config/api";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const res = await api.post("/public/contact", formData);
      toast.success(res.data.message || "Form submitted successfully!");
      
      // Clear fields after successful submission
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.error || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative z-10">
      <div className="max-w-6xl w-full mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 rounded-full">
            Support & Inquiries
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 mb-3 tracking-tight">
            Get in Touch
          </h2>
          <p className="text-base sm:text-lg text-slate-300/80 max-w-xl mx-auto">
            Have questions about VibeChat? We're here to help. Send us a message and our team will get back to you shortly.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-0 glass-card border border-white/15 overflow-hidden shadow-2xl shadow-blue-950/40">
          {/* Left Column: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-2/5 p-8 sm:p-12 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-slate-900/60 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Contact Information</h3>
              <p className="mb-10 text-slate-300/80 leading-relaxed text-sm sm:text-base">
                Fill out the form and our team will get back to you within 24 hours.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
                    <FiPhone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Call Us</p>
                    <p className="font-semibold text-white text-base">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
                    <FiMail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Email Us</p>
                    <p className="font-semibold text-white text-base">hello@vibechat.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10 shrink-0">
                    <FiMapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Our Location</p>
                    <p className="font-semibold text-white text-base">
                      123 Vibe Street, Tech City
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-10 text-xs text-slate-400">
              Live support available Mon – Fri, 9am – 6pm PST
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:w-3/5 p-8 sm:p-12 flex flex-col justify-center"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                  Your Name
                </label>
                <div className="glass-input flex items-center gap-3 px-3.5 py-3">
                  <FiUser className="text-slate-400 shrink-0" size={17} />
                  <input
                    type="text"
                    name="name"
                    className="grow bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="glass-input flex items-center gap-3 px-3.5 py-3">
                  <FiMail className="text-slate-400 shrink-0" size={17} />
                  <input
                    type="email"
                    name="email"
                    className="grow bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
                    placeholder="hello@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                  Message
                </label>
                <textarea
                  name="message"
                  className="glass-input w-full h-32 px-3.5 py-3 text-sm text-white focus:outline-none placeholder:text-slate-500 resize-none block"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-glow w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 mt-4 shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Message</span>
                    <FiSend size={16} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
