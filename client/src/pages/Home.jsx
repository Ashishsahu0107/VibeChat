import React from "react";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <motion.div
      transition={{ duration: 1 }}
     
      drag="y"
      dragConstraints={{
        left: 500,
        right: 1000,
      }}
      className="flex items-center justify-center h-screen "
    >
      <div className="bg-primary min-w-5xl h-120 rounded-2xl flex justify-center items-center text-6  xl text-primary-content">
        Home{" "}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.location.reload()}
          className="btn"
          transition={{
            duration: 1,
            x: { type: "spring", damping: 10, stiffness: 100 },
            y: { type: "spring", damping: 10, stiffness: 100 },
          }}
          drag="x"
        >
          click
        </motion.button>
      </div>
      <div className="aura">
        <div className="card bg-base-100">
          <div className="card-body">
            <p>This card has aura</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
