import React from "react";
import { motion } from "motion/react";
import { MapPin, CheckCircle, Zap } from "lucide-react";

interface LandingPageProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onContinueAnonymously: () => void;
}

export default function LandingPage({
  onLoginClick,
  onSignUpClick,
  onContinueAnonymously
}: LandingPageProps) {
  return (
    <div
      className="w-full min-h-screen flex flex-col justify-between items-center bg-black text-white p-6 relative overflow-hidden"
      id="landing-page-screen"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#39FF14]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Center: Logo and GZ icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 mt-12"
        id="landing-logo-block"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#39FF14] flex items-center justify-center border border-neutral-900">
          <span className="text-2xl font-black text-black font-mono">GZ</span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-widest uppercase leading-none text-white">
            GROUND<span className="text-[#39FF14]">ZERO</span>
          </h1>
          <p className="text-[9px] text-gray-500 font-mono tracking-[0.3em] uppercase mt-1">
            Live Hyperlocal Citizen Grid
          </p>
        </div>
      </motion.div>

      {/* Center content: Headlines & Features */}
      <div className="max-w-2xl w-full flex flex-col items-center text-center my-auto py-12 gap-12 z-10">
        {/* Headlines */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="space-y-4"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white font-sans uppercase">
            You are the <span className="text-[#39FF14]">reporter.</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400 font-mono max-w-lg mx-auto leading-relaxed uppercase tracking-wider">
            No editors. No agenda. No filter. <span className="text-white font-bold">Just truth.</span>
          </p>
        </motion.div>

        {/* 3 feature points in a row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-xl mx-auto"
          id="landing-features"
        >
          {/* Post what you see */}
          <div className="flex flex-col items-center p-4 bg-black border border-neutral-900 rounded-xl transition-all hover:border-neutral-800">
            <div className="w-10 h-10 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-[#39FF14] mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold font-mono tracking-wider text-gray-300 uppercase">
              📍 Post what you see
            </p>
          </div>

          {/* Verify what's real */}
          <div className="flex flex-col items-center p-4 bg-black border border-neutral-900 rounded-xl transition-all hover:border-neutral-800">
            <div className="w-10 h-10 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-[#39FF14] mb-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold font-mono tracking-wider text-gray-300 uppercase">
              ✅ Verify what's real
            </p>
          </div>

          {/* Hold power accountable */}
          <div className="flex flex-col items-center p-4 bg-black border border-neutral-900 rounded-xl transition-all hover:border-neutral-800">
            <div className="w-10 h-10 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-[#39FF14] mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold font-mono tracking-wider text-gray-300 uppercase">
              ⚡ Hold power accountable
            </p>
          </div>
        </motion.div>

        {/* Buttons and Action triggers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col items-center gap-4 w-full max-w-xs"
        >
          <div className="flex gap-4 w-full">
            <button
              onClick={onSignUpClick}
              className="flex-1 py-3 bg-[#39FF14] text-black font-black rounded-xl text-xs tracking-widest uppercase transition-all cursor-pointer"
              id="landing-signup-btn"
            >
              Sign Up
            </button>
            <button
              onClick={onLoginClick}
              className="flex-1 py-3 bg-black border border-neutral-900 hover:border-neutral-800 hover:bg-neutral-950 text-white font-black rounded-xl text-xs tracking-widest uppercase transition-all cursor-pointer"
              id="landing-login-btn"
            >
              Login
            </button>
          </div>

          <button
            onClick={onContinueAnonymously}
            className="text-xs font-bold font-mono text-gray-400 hover:text-[#39FF14] transition-all uppercase tracking-widest underline mt-2 cursor-pointer"
            id="landing-anon-link"
          >
            Continue Anonymously
          </button>
        </motion.div>
      </div>

      {/* Bottom info text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-6 text-[10px] text-gray-600 font-mono tracking-widest uppercase shrink-0"
        id="landing-footer"
      >
        GroundZero — Live Hyperlocal Citizen Grid
      </motion.div>
    </div>
  );
}
