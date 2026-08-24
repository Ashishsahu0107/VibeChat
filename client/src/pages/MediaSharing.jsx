import React from 'react';
import { motion } from 'framer-motion';
import { FiImage, FiVideo, FiFileText } from 'react-icons/fi';

const MediaSharing = () => {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center pt-24 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl px-4 text-center"
      >
        <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">Seamless Media Sharing</h1>
        <p className="text-xl text-base-content/70 mb-16 max-w-2xl mx-auto">
          Share your moments, documents, and files instantly with high quality and top-notch security on VibeChat.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <FiImage size={32} />
              </div>
              <h3 className="card-title text-2xl mb-2">High-Res Photos</h3>
              <p className="text-base-content/70">Share your favorite memories in stunning clarity without compression limits.</p>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 text-secondary">
                <FiVideo size={32} />
              </div>
              <h3 className="card-title text-2xl mb-2">HD Videos</h3>
              <p className="text-base-content/70">Send high-definition videos instantly. Perfect for capturing the whole story.</p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                <FiFileText size={32} />
              </div>
              <h3 className="card-title text-2xl mb-2">Any Document</h3>
              <p className="text-base-content/70">From PDFs to presentations, share any file format securely with your team.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MediaSharing;
