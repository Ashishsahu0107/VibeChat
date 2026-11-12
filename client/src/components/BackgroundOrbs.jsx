import React from "react";

/**
 * BackgroundOrbs Component
 * Renders ambient, blurred glowing orbs (Blue, Purple, Cyan) in the background.
 * Uses pointer-events-none so it never blocks user clicks or selection.
 */
const BackgroundOrbs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Cyan/Blue Glow - Top Left */}
      <div className="absolute -top-32 -left-32 w-80 sm:w-96 md:w-[500px] h-80 sm:h-96 md:h-[500px] rounded-full bg-cyan-500/12 blur-[100px] sm:blur-[130px] animate-orb-slow" />
      {/* Royal Blue / Indigo Glow - Center Top */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-blue-600/10 blur-[120px] sm:blur-[150px]" />
      {/* Electric Purple Glow - Top Right */}
      <div className="absolute top-24 -right-28 w-80 sm:w-96 md:w-[520px] h-80 sm:h-96 md:h-[520px] rounded-full bg-purple-600/14 blur-[110px] sm:blur-[140px] animate-orb-delayed" />
      {/* Deep Cyan / Teal Glow - Bottom Left */}
      <div className="absolute bottom-10 left-1/4 -translate-x-1/2 w-72 sm:w-80 md:w-[450px] h-72 sm:h-80 md:h-[450px] rounded-full bg-cyan-600/10 blur-[100px] sm:blur-[130px] animate-orb-slow" />
      {/* Soft Purple Glow - Bottom Right */}
      <div className="absolute -bottom-32 -right-32 w-80 sm:w-96 md:w-[500px] h-80 sm:h-96 md:h-[500px] rounded-full bg-purple-600/12 blur-[110px] sm:blur-[140px] animate-orb-delayed" />
      {/* Subtle Grid overlay for high-tech depth */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
    </div>
  );
};

export default BackgroundOrbs;
