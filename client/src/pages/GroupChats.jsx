import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiMessageSquare, FiSettings, FiShield, FiCheck, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const GroupChats = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl text-center"
      >
        <span className="text-xs uppercase tracking-widest font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 rounded-full">
          Collaborative Spaces
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 mb-4 tracking-tight">
          Modern Group Chats
        </h1>
        <p className="text-base sm:text-lg text-slate-300/80 mb-14 max-w-2xl mx-auto leading-relaxed">
          Bring your communities, friends, and teams together. Create distinct channels with granular controls and real-time syncing.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left mb-16">
          <div className="glass-card-interactive p-8 flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-6 text-cyan-400 shadow-lg shadow-cyan-500/10 group-hover:scale-110 transition-transform">
              <FiUsers size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors">Large Communities</h3>
            <p className="text-slate-300/80 text-sm leading-relaxed mb-4">
              Add hundreds of participants without performance bottlenecks. Fast membership searches and instant role synchronization.
            </p>
            <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-cyan-400 font-semibold">
              <FiCheck size={14} /> Zero Lag at Scale
            </div>
          </div>
          
          <div className="glass-card-interactive p-8 flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-6 text-blue-400 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform">
              <FiMessageSquare size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors">Threaded Context</h3>
            <p className="text-slate-300/80 text-sm leading-relaxed mb-4">
              Keep dynamic conversations organized. Quote replies, react with emojis, pin essential announcements, and search chat history.
            </p>
            <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-blue-400 font-semibold">
              <FiCheck size={14} /> Organized Discussions
            </div>
          </div>

          <div className="glass-card-interactive p-8 flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 shadow-lg shadow-purple-500/10 group-hover:scale-110 transition-transform">
              <FiSettings size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">Admin Authority</h3>
            <p className="text-slate-300/80 text-sm leading-relaxed mb-4">
              Control permissions, manage participants, promote co-admins, and customize room descriptions and icons in seconds.
            </p>
            <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-purple-400 font-semibold">
              <FiCheck size={14} /> Flexible Permissions
            </div>
          </div>
        </div>

        <div className="glass-card p-8 border border-white/15 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h4 className="text-lg font-bold text-white mb-1">Create a group now</h4>
            <p className="text-xs text-slate-300/70">Start talking with friends, teams, or study groups.</p>
          </div>
          <Link to="/chat" className="btn-glow px-6 py-2.5 text-sm font-semibold flex items-center gap-2 shrink-0">
            <span>Create Group</span>
            <FiArrowRight size={15} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default GroupChats;
