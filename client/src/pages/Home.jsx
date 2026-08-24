import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImg from "../assets/hero.png";
import { 
  FiMessageCircle, FiShield, FiSmile, FiStar,
  FiTwitter, FiGithub, FiLinkedin, FiMail, FiChevronDown
} from "react-icons/fi";
import useAuthStore from "../store/useAuthStore";

const FaqItem = ({ question, answer, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-base-300 bg-base-200 rounded-2xl mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <button 
        className="flex justify-between items-center w-full p-6 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xl font-medium">{question}</span>
        <FiChevronDown className={`text-2xl transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>
      <div 
        className={`px-6 text-base-content/70 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p>{answer}</p>
      </div>
    </div>
  );
};

const Home = () => {
  const authUser = useAuthStore((state) => state.authUser);
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
          {!authUser ? (
            <div className="flex gap-4">
              <Link to="/register" className="btn btn-primary btn-lg shadow-lg shadow-primary/30">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Login Now
              </Link>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/chat" className="btn btn-primary btn-lg shadow-lg shadow-primary/30">
                Go to Chat
              </Link>
            </div>
          )}
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
      {/* How it Works Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-7xl px-4 py-20 bg-base-200/50 rounded-3xl my-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">How it Works</h2>
          <p className="text-base-content/70 text-lg">Start chatting in three simple steps.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 text-center relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-primary text-primary-content flex items-center justify-center text-3xl font-bold mb-6 z-10 shadow-lg shadow-primary/30">1</div>
            <h3 className="text-2xl font-semibold mb-3">Create an Account</h3>
            <p className="text-base-content/70">Sign up in seconds using your email and get your unique profile ready.</p>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-secondary text-secondary-content flex items-center justify-center text-3xl font-bold mb-6 z-10 shadow-lg shadow-secondary/30">2</div>
            <h3 className="text-2xl font-semibold mb-3">Find Friends</h3>
            <p className="text-base-content/70">Search for your friends or colleagues and add them to your chat list.</p>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-accent text-accent-content flex items-center justify-center text-3xl font-bold mb-6 z-10 shadow-lg shadow-accent/30">3</div>
            <h3 className="text-2xl font-semibold mb-3">Start Vibeing</h3>
            <p className="text-base-content/70">Send messages instantly, share media, and enjoy seamless communication.</p>
          </div>
          
          {/* Connecting Line (Hidden on mobile) */}
          <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-1 bg-base-300 -z-0 transform translate-y-1/2 w-2/3 mx-auto"></div>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-7xl px-4 py-20"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-base-content/70 text-lg">Don't just take our word for it.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Ashish sahu", role: "Designer", text: "VibeChat has completely changed how I collaborate with my freelance clients. Fast, secure, and beautiful." },
            { name: "Michael T.", role: "Developer", text: "The UI is incredibly slick, and the real-time syncing is flawless. Best chat app I've used in years." },
            { name: "Emma R.", role: "Product Manager", text: "I love the themes and how responsive it is. Keeps our remote team connected on a whole new vibe." }
          ].map((testimonial, idx) => (
            <div key={idx} className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <div className="card-body">
                <div className="flex gap-1 text-warning mb-4">
                  {[...Array(5)].map((_, i) => <FiStar key={i} fill="currentColor" />)}
                </div>
                <p className="italic text-base-content/80 mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="avatar">
                    <div className="bg-neutral text-neutral-content rounded-full w-10 h-10">
                      <span className="text-xl flex justify-center items-center h-full h-full">{testimonial.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-base-content/50">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl px-4 py-20 mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="w-full">
          <FaqItem 
            question="Is VibeChat free to use?" 
            answer="Yes, VibeChat is completely free for standard use. We believe in accessible communication for everyone." 
            defaultOpen={true}
          />
          <FaqItem 
            question="Are my messages secure?" 
            answer="Absolutely. We prioritize your privacy and use industry-standard security measures to keep your data safe." 
          />
          <FaqItem 
            question="Can I change the app's appearance?" 
            answer="Yes! We offer 17 different themes including dark mode, pastel, corporate, and more. You can change it anytime in the navigation bar." 
          />
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl px-4 py-10 mb-20"
      >
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-2xl">
          <div className="card-body items-center text-center py-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">Ready to catch the vibe?</h2>
            <p className="text-xl mb-8 text-white/80 max-w-2xl">Join thousands of users who have already upgraded their chat experience. It takes less than a minute to get started.</p>
            <Link to={authUser ? "/chat" : "/register"} className="btn btn-lg bg-base-100 text-primary hover:bg-base-200 border-none px-12 rounded-full shadow-xl">
              {authUser ? "Go to Chat" : "Join VibeChat Now"}
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="footer p-10 bg-base-200 text-base-content mt-auto w-full">
        <aside>
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-content mb-4 shadow-lg">
            <FiMessageCircle size={24} />
          </div>
          <p className="font-bold text-xl">VibeChat Ltd.</p>
          <p>Connecting people on a different vibe since 2026.</p>
        </aside> 
        <nav>
          <h6 className="footer-title">Services</h6> 
          <a className="link link-hover cursor-pointer">Direct Messaging</a>
          <Link to="/group-chats" className="link link-hover">Group Chats</Link>
          <Link to="/media-sharing" className="link link-hover">Media Sharing</Link>
        </nav> 
        <nav>
          <h6 className="footer-title">Company</h6> 
          <Link to="/" className="link link-hover">About us</Link>
          <Link to="/contact" className="link link-hover">Contact</Link>
          <Link to="/jobs" className="link link-hover">Jobs</Link>
        </nav> 
        <nav>
          <h6 className="footer-title">Legal</h6> 
          <a className="link link-hover cursor-pointer">Terms of use</a>
          <a className="link link-hover cursor-pointer">Privacy policy</a>
          <a className="link link-hover cursor-pointer">Cookie policy</a>
        </nav>
        <nav>
          <h6 className="footer-title">Social</h6> 
          <div className="flex gap-4">
            <a className="btn btn-ghost btn-circle btn-sm"><FiTwitter size={20} /></a>
            <a className="btn btn-ghost btn-circle btn-sm"><FiGithub size={20} /></a>
            <a className="btn btn-ghost btn-circle btn-sm"><FiLinkedin size={20} /></a>
            <a className="btn btn-ghost btn-circle btn-sm"><FiMail size={20} /></a>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default Home;
