import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImg from "../assets/hero.png";
import { 
  FiMessageCircle, FiShield, FiSmile, FiStar,
  FiTwitter, FiGithub, FiLinkedin, FiMail, FiChevronDown,
  FiZap, FiLock, FiGlobe, FiArrowRight
} from "react-icons/fi";
import useAuthStore from "../store/useAuthStore";

const FaqItem = ({ question, answer, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="glass-card mb-4 overflow-hidden transition-all duration-300 hover:border-white/20">
      <button 
        className="flex justify-between items-center w-full p-6 text-left focus:outline-none cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-lg md:text-xl font-semibold text-slate-100">{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.05] border border-white/10 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-slate-400'}`}>
          <FiChevronDown size={18} />
        </div>
      </button>
      <div 
        className={`px-6 text-slate-300/80 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="border-t border-white/[0.06] pt-4">{answer}</p>
      </div>
    </div>
  );
};

const Home = () => {
  const authUser = useAuthStore((state) => state.authUser);

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden">
      {/* ── Hero Section ──────────────────────────────────────────────────────── */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 flex flex-col-reverse lg:flex-row items-center justify-between gap-12 mt-4 relative z-10">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-1/2 flex flex-col items-start text-left"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm shadow-cyan-500/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>✨ Welcome to VibeChat 2.0</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight text-white">
            Connect on a <br />
            <span className="text-gradient drop-shadow-sm">Different Vibe</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300/80 mb-10 leading-relaxed max-w-lg font-normal">
            Experience ultra-fast real-time messaging, crisp voice and video calls, and encrypted sharing in a sleek, glassmorphic workspace.
          </p>

          {/* Action Buttons */}
          {!authUser ? (
            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              <Link 
                to="/register" 
                className="btn-glow px-8 py-3.5 text-base flex items-center justify-center gap-2 font-semibold shadow-xl"
              >
                <span>Get Started Free</span>
                <FiArrowRight size={18} />
              </Link>
              <Link 
                to="/login" 
                className="btn-glass px-8 py-3.5 text-base flex items-center justify-center font-medium hover:border-white/30"
              >
                Login Now
              </Link>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link 
                to="/chat" 
                className="btn-glow px-8 py-3.5 text-base flex items-center gap-2 font-semibold shadow-xl"
              >
                <span>Open Messenger</span>
                <FiArrowRight size={18} />
              </Link>
            </div>
          )}

          {/* Key Metrics Pill */}
          <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-white/10 w-full max-w-md">
            <div>
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-xs text-slate-400 font-medium">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400">&lt;50ms</div>
              <div className="text-xs text-slate-400 font-medium">Message Latency</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">E2EE</div>
              <div className="text-xs text-slate-400 font-medium">Encrypted Privacy</div>
            </div>
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, type: "spring", bounce: 0.2 }}
          className="lg:w-1/2 relative flex justify-center items-center"
        >
          {/* Ambient radial aura behind hero */}
          <div className="absolute w-80 sm:w-96 md:w-[480px] h-80 sm:h-96 md:h-[480px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-purple-600/20 rounded-full blur-[90px] -z-10" />

          {/* Floating glass illustration wrapper */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="relative z-10 p-3 sm:p-5 rounded-3xl glass-card border border-white/15 shadow-2xl shadow-blue-950/60 max-w-lg"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-white/[0.04] to-transparent p-2">
              <img 
                src={heroImg} 
                alt="VibeChat Modern Interface" 
                className="w-full max-w-md drop-shadow-2xl object-contain rounded-xl" 
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Features Section ──────────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 mt-6 relative z-10"
      >
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 rounded-full">
            State-of-the-art Features
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold mt-4 mb-4 text-white">Why Choose VibeChat?</h2>
          <p className="text-slate-300/80 text-base sm:text-lg max-w-xl mx-auto">
            Everything you need for fast, seamless, and deeply engaging digital conversations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-card-interactive p-8 flex flex-col items-start text-left group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-6 text-cyan-400 shadow-lg shadow-cyan-500/10 group-hover:scale-110 transition-transform">
              <FiZap size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors">Real-Time Sync</h3>
            <p className="text-slate-300/80 leading-relaxed text-sm sm:text-base">
              Built on resilient WebSocket pipelines for instantaneous message delivery with sub-second sync and live typing cues.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="glass-card-interactive p-8 flex flex-col items-start text-left group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 shadow-lg shadow-purple-500/10 group-hover:scale-110 transition-transform">
              <FiShield size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">End-to-End Secure</h3>
            <p className="text-slate-300/80 leading-relaxed text-sm sm:text-base">
              Your confidential thoughts stay strictly between you and your recipients with modern encryption, token auth, and zero data leakage.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card-interactive p-8 flex flex-col items-start text-left group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-pink-500/30 flex items-center justify-center mb-6 text-pink-400 shadow-lg shadow-pink-500/10 group-hover:scale-110 transition-transform">
              <FiSmile size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-pink-300 transition-colors">Express Yourself</h3>
            <p className="text-slate-300/80 leading-relaxed text-sm sm:text-base">
              Interactive voice notes, rich media previews, polls, emojis, message reactions, and customizable themes to match your mood.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── How it Works Section ──────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 relative z-10"
      >
        <div className="glass-card p-8 sm:p-14 border border-white/15">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 rounded-full">
              Quick Setup
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold mt-4 mb-4 text-white">How It Works</h2>
            <p className="text-slate-300/80 text-base sm:text-lg">Start chatting in three effortless steps.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 text-center relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-6 z-10 shadow-lg shadow-cyan-500/25 border border-white/20 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Create an Account</h3>
              <p className="text-slate-300/70 text-sm leading-relaxed max-w-xs">
                Sign up in seconds via email or single-click Google authentication and customize your profile.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-6 z-10 shadow-lg shadow-blue-500/25 border border-white/20 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connect & Discover</h3>
              <p className="text-slate-300/70 text-sm leading-relaxed max-w-xs">
                Instant search contacts, find colleagues, or start group rooms with unlimited members.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl font-bold mb-6 z-10 shadow-lg shadow-purple-500/25 border border-white/20 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Start Vibeing</h3>
              <p className="text-slate-300/70 text-sm leading-relaxed max-w-xs">
                Exchange instant messages, HD audio calls, video meetings, and live status stories smoothly.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Testimonials Section ──────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 relative z-10"
      >
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 rounded-full">
            Community Love
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold mt-4 mb-4 text-white">What Our Users Say</h2>
          <p className="text-slate-300/80 text-base sm:text-lg">Don't just take our word for it.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Ashish Sahu", role: "Product Designer", text: "VibeChat has completely changed how I collaborate with my team. Fast, secure, and the frosted glass aesthetic feels truly next-gen." },
            { name: "Michael T.", role: "Fullstack Engineer", text: "The UI is incredibly slick, and WebSocket sync is flawless. Best real-time communication tool I've used in years." },
            { name: "Emma R.", role: "Engineering Lead", text: "I love the themes, responsive performance, and voice note quality. Keeps our remote distributed team connected seamlessly." }
          ].map((testimonial, idx) => (
            <div key={idx} className="glass-card-interactive p-8 flex flex-col justify-between">
              <div>
                <div className="flex gap-1.5 text-amber-400 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} fill="currentColor" size={16} />
                  ))}
                </div>
                <p className="text-slate-200/90 italic leading-relaxed mb-6 text-sm sm:text-base">
                  "{testimonial.text}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-white/[0.08]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── FAQ Section ───────────────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl px-4 sm:px-6 py-20 mx-auto relative z-10"
      >
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 rounded-full">
            Help & Info
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 mb-3 text-white">Frequently Asked Questions</h2>
          <p className="text-slate-300/80 text-sm sm:text-base">Everything you need to know about getting started.</p>
        </div>

        <div className="w-full">
          <FaqItem 
            question="Is VibeChat free to use?" 
            answer="Yes, VibeChat is completely free for standard use. We believe in accessible, premium communication for everyone." 
            defaultOpen={true}
          />
          <FaqItem 
            question="Are my messages secure?" 
            answer="Absolutely. We prioritize your privacy and use industry-standard encryption, guarded token verification, and strict access controls." 
          />
          <FaqItem 
            question="Can I change the app's appearance?" 
            answer="Yes! We provide dynamic theme selections including our signature Dark Glassmorphic mode, Spotify, Luxury, Valorant, and more anytime from the top bar." 
          />
        </div>
      </motion.div>

      {/* ── CTA Banner ────────────────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 mb-20 relative z-10"
      >
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-16 border border-white/20 shadow-2xl bg-gradient-to-r from-blue-900/60 via-purple-900/50 to-cyan-900/40 backdrop-blur-2xl">
          {/* Inner ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 text-white tracking-tight">
              Ready to catch the vibe?
            </h2>
            <p className="text-base sm:text-lg mb-8 text-slate-200/85 leading-relaxed">
              Join thousands of users who have already upgraded their chat experience. It takes less than a minute to get started.
            </p>
            <Link 
              to={authUser ? "/chat" : "/register"} 
              className="btn-glow inline-flex items-center gap-2 px-10 py-4 text-base font-semibold shadow-2xl"
            >
              <span>{authUser ? "Go to Messenger" : "Join VibeChat Today"}</span>
              <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-white/10 bg-[#06080d]/80 backdrop-blur-xl text-slate-300 py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-white/20">
                <FiMessageCircle size={22} />
              </div>
              <span className="text-xl font-bold text-gradient">VibeChat</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-4">
              Next-generation messaging engineered for high performance, intuitive design, and seamless connections.
            </p>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} VibeChat Ltd. All rights reserved.
            </p>
          </div> 

          <div>
            <h6 className="text-xs uppercase font-bold text-slate-200 tracking-wider mb-3">Services</h6> 
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/chat" className="hover:text-cyan-400 transition-colors">Direct Messaging</Link></li>
              <li><Link to="/group-chats" className="hover:text-cyan-400 transition-colors">Group Chats</Link></li>
              <li><Link to="/media-sharing" className="hover:text-cyan-400 transition-colors">Media Sharing</Link></li>
            </ul>
          </div> 

          <div>
            <h6 className="text-xs uppercase font-bold text-slate-200 tracking-wider mb-3">Company</h6> 
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
              <li><Link to="/jobs" className="hover:text-cyan-400 transition-colors">Careers</Link></li>
            </ul>
          </div> 

          <div>
            <h6 className="text-xs uppercase font-bold text-slate-200 tracking-wider mb-3">Connect</h6> 
            <div className="flex gap-2">
              <a href="#" className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all">
                <FiTwitter size={16} />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all">
                <FiGithub size={16} />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all">
                <FiLinkedin size={16} />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all">
                <FiMail size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
