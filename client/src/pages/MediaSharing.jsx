import React from 'react';
import { motion } from 'framer-motion';
import { FiImage, FiVideo, FiFileText, FiLock, FiZap, FiCheck, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const MediaSharing = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl text-center"
      >
        <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 rounded-full">
          Rich Communication
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 mb-4 tracking-tight">
          Seamless Media Sharing
        </h1>
        <p className="text-base sm:text-lg text-slate-300/80 mb-14 max-w-2xl mx-auto leading-relaxed">
          Share your memories, creative designs, documents, and recordings instantly in full resolution with edge-powered caching.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left mb-16">
          <div className="glass-card-interactive p-8 flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-6 text-cyan-400 shadow-lg shadow-cyan-500/10 group-hover:scale-110 transition-transform">
              <FiImage size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors">High-Res Photos</h3>
            <p className="text-slate-300/80 text-sm leading-relaxed mb-4">
              Share high-resolution images with zero aggressive compression artifacts. Full EXIF data retention and instant lightbox preview.
            </p>
            <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-cyan-400 font-semibold">
              <FiCheck size={14} /> Lossless Preview
            </div>
          </div>
          
          <div className="glass-card-interactive p-8 flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-6 text-blue-400 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform">
              <FiVideo size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors">Ultra HD Videos</h3>
            <p className="text-slate-300/80 text-sm leading-relaxed mb-4">
              Stream and watch videos directly in conversation threads. Adaptive bitrate streaming ensures smooth playback on any connection.
            </p>
            <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-blue-400 font-semibold">
              <FiCheck size={14} /> Instant Inline Player
            </div>
          </div>

          <div className="glass-card-interactive p-8 flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 shadow-lg shadow-purple-500/10 group-hover:scale-110 transition-transform">
              <FiFileText size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">Any File Format</h3>
            <p className="text-slate-300/80 text-sm leading-relaxed mb-4">
              Send PDFs, spreadsheets, audio clips, code snippets, and design archives up to 100MB with end-to-end security verification.
            </p>
            <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-purple-400 font-semibold">
              <FiCheck size={14} /> Virus & Hash Checked
            </div>
          </div>
        </div>

        <div className="glass-card p-8 border border-white/15 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h4 className="text-lg font-bold text-white mb-1">Ready to share your vibe?</h4>
            <p className="text-xs text-slate-300/70">Connect with friends and start uploading media in real-time.</p>
          </div>
          <Link to="/chat" className="btn-glow px-6 py-2.5 text-sm font-semibold flex items-center gap-2 shrink-0">
            <span>Open Messenger</span>
            <FiArrowRight size={15} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default MediaSharing;
