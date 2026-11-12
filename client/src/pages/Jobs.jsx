import React from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiMapPin, FiClock, FiArrowRight } from 'react-icons/fi';

const Jobs = () => {
  const jobsList = [
    {
      title: "Senior Frontend Engineer",
      type: "Full-time",
      location: "Remote",
      tag: "Engineering",
      desc: "Lead UI development of real-time messaging, WebRTC calling interfaces, and interactive collaborative features using React and modern CSS."
    },
    {
      title: "Backend Infrastructure Engineer",
      type: "Full-time",
      location: "San Francisco, CA / Remote",
      tag: "Platform",
      desc: "Scale our real-time messaging infrastructure, WebSocket pipelines, MongoDB sharding, and edge media relay network."
    },
    {
      title: "Product Designer (UI/UX)",
      type: "Full-time",
      location: "Remote",
      tag: "Design",
      desc: "Shape the next generation of glassmorphic, tactile chat interfaces, micro-interactions, accessibility patterns, and design systems."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl text-center"
      >
        <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 rounded-full">
          We Are Hiring
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 mb-4 tracking-tight">
          Join Our Team
        </h1>
        <p className="text-base sm:text-lg text-slate-300/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          Help us build the future of human communication. We're looking for passionate engineers and creators to join VibeChat.
        </p>
        
        <div className="space-y-6 text-left">
          {jobsList.map((job, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="glass-card-interactive p-6 sm:p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full mb-2 inline-block">
                    {job.tag}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{job.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1"><FiMapPin size={13} className="text-cyan-400" /> {job.location}</span>
                    <span className="flex items-center gap-1"><FiClock size={13} className="text-purple-400" /> {job.type}</span>
                  </div>
                </div>
                <button className="btn-glow px-6 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 self-start sm:self-auto shadow-lg">
                  <span>Apply Now</span>
                  <FiArrowRight size={15} />
                </button>
              </div>
              <p className="text-slate-300/80 text-sm leading-relaxed border-t border-white/[0.08] pt-4">
                {job.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Jobs;
