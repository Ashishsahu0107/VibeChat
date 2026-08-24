import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiMessageSquare, FiSettings } from 'react-icons/fi';

const GroupChats = () => {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center pt-24 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl px-4 text-center"
      >
        <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">Group Chats</h1>
        <p className="text-xl text-base-content/70 mb-16 max-w-2xl mx-auto">
          Connect with your team, friends, or community. Create dedicated spaces for all your different vibes.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <FiUsers size={32} />
              </div>
              <h3 className="card-title text-2xl mb-2">Unlimited Members</h3>
              <p className="text-base-content/70">Add as many people as you need. Perfect for large communities or small teams.</p>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 text-secondary">
                <FiMessageSquare size={32} />
              </div>
              <h3 className="card-title text-2xl mb-2">Threaded Replies</h3>
              <p className="text-base-content/70">Keep conversations organized and easy to follow with threaded replies.</p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                <FiSettings size={32} />
              </div>
              <h3 className="card-title text-2xl mb-2">Admin Controls</h3>
              <p className="text-base-content/70">Manage permissions, moderate content, and customize your group settings.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GroupChats;
