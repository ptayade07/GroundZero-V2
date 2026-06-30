import React from "react";
import { motion } from "motion/react";
import { MapPin, CheckCircle, Zap } from "lucide-react";

interface LandingPageProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onContinueAnonymously: () => void;
  theme?: "light" | "dark";
}

export default function LandingPage({
  onLoginClick,
  onSignUpClick,
  onContinueAnonymously,
  theme = "dark"
}: LandingPageProps) {
  return (
    <div
      className={`w-full min-h-screen flex flex-col justify-between items-center p-6 relative overflow-hidden transition-all duration-300 ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-[#FAFAFA] text-neutral-900'
      }`}
      id="landing-page-screen"
    >
      {/* Background radial glow */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${
        theme === 'dark' ? 'bg-[#39FF14]/5' : 'bg-[#2ECC0F]/5'
      }`} />

      {/* Top Center: Logo and GZ icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 mt-12"
        id="landing-logo-block"
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
          theme === 'dark' ? 'bg-[#39FF14] text-black border-neutral-900' : 'bg-[#2ECC0F] text-white border-gray-200'
        }`}>
          <span className={`text-2xl font-black font-mono ${theme === 'dark' ? 'text-black' : 'text-white'}`}>GZ</span>
        </div>
        <div className="text-center">
          <h1 className={`text-xl font-black tracking-widest uppercase leading-none ${
            theme === 'dark' ? 'text-white' : 'text-neutral-900'
          }`}>
            GROUND<span className={theme === 'dark' ? 'text-[#39FF14]' : 'text-[#2ECC0F]'}>ZERO</span>
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
          <h2 className={`text-4xl md:text-6xl font-black tracking-tighter uppercase font-sans ${
            theme === 'dark' ? 'text-white' : 'text-neutral-900'
          }`}>
            You are the <span className={theme === 'dark' ? 'text-[#39FF14]' : 'text-[#2ECC0F]'}>reporter.</span>
          </h2>
          <p className={`text-sm md:text-base font-mono max-w-lg mx-auto leading-relaxed uppercase tracking-wider ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-650'
          }`}>
            No editors. No agenda. No filter. <span className={theme === 'dark' ? 'text-white font-bold' : 'text-neutral-950 font-bold'}>Just truth.</span>
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
          <div className={`flex flex-col items-center p-4 border rounded-xl transition-all ${
            theme === 'dark' ? 'bg-black border-neutral-900 hover:border-neutral-800' : 'bg-white border-gray-200 hover:border-gray-300 shadow-xs'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border ${
              theme === 'dark' ? 'bg-[#39FF14]/10 border-[#39FF14]/20 text-[#39FF14]' : 'bg-[#2ECC0F]/10 border-[#2ECC0F]/20 text-[#2ECC0F]'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <p className={`text-xs font-bold font-mono tracking-wider uppercase ${
              theme === 'dark' ? 'text-gray-300' : 'text-neutral-800'
            }`}>
              📍 Post what you see
            </p>
          </div>

          {/* Verify what's real */}
          <div className={`flex flex-col items-center p-4 border rounded-xl transition-all ${
            theme === 'dark' ? 'bg-black border-neutral-900 hover:border-neutral-800' : 'bg-white border-gray-200 hover:border-gray-300 shadow-xs'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border ${
              theme === 'dark' ? 'bg-[#39FF14]/10 border-[#39FF14]/20 text-[#39FF14]' : 'bg-[#2ECC0F]/10 border-[#2ECC0F]/20 text-[#2ECC0F]'
            }`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className={`text-xs font-bold font-mono tracking-wider uppercase ${
              theme === 'dark' ? 'text-gray-300' : 'text-neutral-800'
            }`}>
              ✅ Verify what's real
            </p>
          </div>

          {/* Hold power accountable */}
          <div className={`flex flex-col items-center p-4 border rounded-xl transition-all ${
            theme === 'dark' ? 'bg-black border-neutral-900 hover:border-neutral-800' : 'bg-white border-gray-200 hover:border-gray-300 shadow-xs'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border ${
              theme === 'dark' ? 'bg-[#39FF14]/10 border-[#39FF14]/20 text-[#39FF14]' : 'bg-[#2ECC0F]/10 border-[#2ECC0F]/20 text-[#2ECC0F]'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <p className={`text-xs font-bold font-mono tracking-wider uppercase ${
              theme === 'dark' ? 'text-gray-300' : 'text-neutral-800'
            }`}>
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
              className={`flex-1 py-3 font-black rounded-xl text-xs tracking-widest uppercase transition-all cursor-pointer ${
                theme === 'dark' ? 'bg-[#39FF14] text-black' : 'bg-[#2ECC0F] text-white hover:opacity-95 shadow-md'
              }`}
              id="landing-signup-btn"
            >
              Sign Up
            </button>
            <button
              onClick={onLoginClick}
              className={`flex-1 py-3 font-black rounded-xl text-xs tracking-widest uppercase transition-all cursor-pointer border ${
                theme === 'dark' 
                  ? 'bg-black border-neutral-900 hover:border-neutral-800 hover:bg-neutral-950 text-white' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-neutral-800 shadow-xs'
              }`}
              id="landing-login-btn"
            >
              Login
            </button>
          </div>

          <button
            onClick={onContinueAnonymously}
            className={`text-xs font-bold font-mono transition-all uppercase tracking-widest underline mt-2 cursor-pointer ${
              theme === 'dark' ? 'text-gray-400 hover:text-[#39FF14]' : 'text-gray-600 hover:text-[#2ECC0F]'
            }`}
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
