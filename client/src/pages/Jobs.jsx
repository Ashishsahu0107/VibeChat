import React from 'react';
import { motion } from 'framer-motion';

const Jobs = () => {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center pt-24 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl px-4 text-center"
      >
        <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">Join Our Team</h1>
        <p className="text-xl text-base-content/70 mb-12">
          Help us build the future of communication. We're looking for passionate people to join VibeChat.
        </p>
        
        <div className="space-y-6">
          <div className="card bg-base-200 shadow-xl text-left">
            <div className="card-body">
              <h2 className="card-title text-2xl">Senior Frontend Engineer</h2>
              <p className="text-base-content/70 mb-4">Remote • Full-time</p>
              <p>We're looking for an experienced React developer to help build scalable, real-time UI components.</p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary">Apply Now</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl text-left">
            <div className="card-body">
              <h2 className="card-title text-2xl">Backend Engineer</h2>
              <p className="text-base-content/70 mb-4">San Francisco, CA • Full-time</p>
              <p>Join our backend team to scale our real-time messaging infrastructure using Node.js and WebSockets.</p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary">Apply Now</button>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow-xl text-left">
            <div className="card-body">
              <h2 className="card-title text-2xl">Product Designer</h2>
              <p className="text-base-content/70 mb-4">Remote • Full-time</p>
              <p>Help us design beautiful, intuitive interfaces that our users love.</p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary">Apply Now</button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Jobs;
