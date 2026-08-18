import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImg from "../assets/hero.png";
import { FiMessageCircle, FiShield, FiSmile } from "react-icons/fi";

const Home = () => {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full max-w-7xl px-4 pt-20 pb-16 flex flex-col-reverse lg:flex-row items-center justify-between gap-12 mt-10">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2 flex flex-col items-start text-left"
        >
          <div className="badge badge-primary badge-outline mb-6 p-4 text-sm font-semibold">
            ✨ Welcome to VibeChat
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight text-base-content">
            Connect on a <br/>
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Different Vibe</span>
          </h1>
          <p className="text-lg lg:text-xl text-base-content/70 mb-10 leading-relaxed max-w-lg">
            Experience real-time conversations with unmatched speed and privacy. Join a community where every message feels just right.
          </p>
          <div className="flex gap-4">
            <Link to="/register" className="btn btn-primary btn-lg shadow-lg shadow-primary/30">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Login Now
            </Link>
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="lg:w-1/2 relative flex justify-center"
        >
          <motion.div
             animate={{ y: [-10, 10, -10] }}
             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
             className="relative z-10"
          >
             <img src={heroImg} alt="VibeChat Hero" className="w-full max-w-lg drop-shadow-2xl object-contain" />
          </motion.div>
          
          {/* Decorative background blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10"></div>
        </motion.div>

      </div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-7xl px-4 py-20 mt-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">Why choose VibeChat?</h2>
          <p className="text-base-content/70 text-lg">Everything you need for seamless communication.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <FiMessageCircle size={32} />
              </div>
              <h3 className="card-title text-xl mb-2">Real-Time Sync</h3>
              <p className="text-base-content/70">Lightning fast messaging that keeps you connected without any lag or delay.</p>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 text-secondary">
                <FiShield size={32} />
              </div>
              <h3 className="card-title text-xl mb-2">End-to-End Secure</h3>
              <p className="text-base-content/70">Your privacy is our priority. Conversations are secured and protected.</p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                <FiSmile size={32} />
              </div>
              <h3 className="card-title text-xl mb-2">Express Yourself</h3>
              <p className="text-base-content/70">Rich text, emojis, and media sharing to make every chat expressive and fun.</p>
            </div>
          </div>
        </div>
      </motion.div>
      
    </div>
  );
};

export default Home;
