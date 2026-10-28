import React from "react";
import { motion } from "motion/react";
import { MapPin, CheckCircle, Zap } from "lucide-react";
import Logo from "./Logo";

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
      className={`w-full min-h-screen flex flex-col justify-between items-center p-6 relative overflow-hidden transition-all duration-300 font-ui ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-[#FAFCFA] text-[#171B18]'
      }`}
      id="landing-page-screen"
    >
      {/* Background radial glow */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${
        theme === 'dark' ? 'bg-[#B7FF38]/5' : 'bg-[#537A00]/5'
      }`} />

      {/* Top Center: Logo and GZ icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 mt-12"
        id="landing-logo-block"
      >
        <Logo theme={theme} className="w-16 h-16 rounded-[14px] shadow-2xl" />
        <div className="text-center">
          <h1 className={`text-xl font-display font-black tracking-widest uppercase leading-none ${
            theme === 'dark' ? 'text-white' : 'text-[#171B18]'
          }`}>
            GROUND<span className={theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}>ZERO</span>
          </h1>
          <p className="text-xs text-[#A3A3A3] font-meta tracking-[0.2em] uppercase mt-1.5">
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
          <h2 className={`text-4xl md:text-6xl font-display font-black tracking-tighter uppercase ${
            theme === 'dark' ? 'text-white' : 'text-[#171B18]'
          }`}>
            You are the <span className={theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}>reporter.</span>
          </h2>
          <p className={`text-sm md:text-base font-meta max-w-lg mx-auto leading-relaxed uppercase tracking-wider ${
            theme === 'dark' ? 'text-[#A3A3A3]' : 'text-[#626862]'
          }`}>
            No editors. No agenda. No filter. <span className={theme === 'dark' ? 'text-white font-bold' : 'text-[#171B18] font-bold'}>Just truth.</span>
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
          <div className={`flex flex-col items-center p-4 border rounded-[14px] transition-all ${
            theme === 'dark' ? 'bg-[#111111] border-[#303030]' : 'bg-white border-[#E1E5DF] shadow-xs'
          }`}>
            <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-3 border ${
              theme === 'dark' ? 'bg-[#B7FF38]/15 border-[#B7FF38]/30 text-[#B7FF38]' : 'bg-[#537A00]/15 border-[#537A00]/30 text-[#537A00]'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <p className={`text-xs font-bold font-meta tracking-wider uppercase ${
              theme === 'dark' ? 'text-white' : 'text-[#171B18]'
            }`}>
              Post what you see
            </p>
          </div>

          {/* Verify what's real */}
          <div className={`flex flex-col items-center p-4 border rounded-[14px] transition-all ${
            theme === 'dark' ? 'bg-[#111111] border-[#303030]' : 'bg-white border-[#E1E5DF] shadow-xs'
          }`}>
            <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-3 border ${
              theme === 'dark' ? 'bg-[#B7FF38]/15 border-[#B7FF38]/30 text-[#B7FF38]' : 'bg-[#537A00]/15 border-[#537A00]/30 text-[#537A00]'
            }`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className={`text-xs font-bold font-meta tracking-wider uppercase ${
              theme === 'dark' ? 'text-white' : 'text-[#171B18]'
            }`}>
              Verify what's real
            </p>
          </div>

          {/* Hold power accountable */}
          <div className={`flex flex-col items-center p-4 border rounded-[14px] transition-all ${
            theme === 'dark' ? 'bg-[#111111] border-[#303030]' : 'bg-white border-[#E1E5DF] shadow-xs'
          }`}>
            <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-3 border ${
              theme === 'dark' ? 'bg-[#B7FF38]/15 border-[#B7FF38]/30 text-[#B7FF38]' : 'bg-[#537A00]/15 border-[#537A00]/30 text-[#537A00]'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <p className={`text-xs font-bold font-meta tracking-wider uppercase ${
              theme === 'dark' ? 'text-white' : 'text-[#171B18]'
            }`}>
              Hold power accountable
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
              className={`flex-1 min-h-[44px] font-bold rounded-[10px] text-xs tracking-wider uppercase transition-all cursor-pointer font-ui ${
                theme === 'dark' ? 'bg-[#B7FF38] hover:bg-[#A6ED27] active:bg-[#94D91F] text-black shadow-md' : 'bg-[#537A00] text-white shadow-md'
              }`}
              id="landing-signup-btn"
            >
              Sign Up
            </button>
            <button
              onClick={onLoginClick}
              className={`flex-1 min-h-[44px] font-bold rounded-[10px] text-xs tracking-wider uppercase transition-all cursor-pointer border font-ui ${
                theme === 'dark' 
                  ? 'bg-[#111111] border-[#303030] hover:border-[#B7FF38]/50 text-white' 
                  : 'bg-white border-[#E1E5DF] hover:border-[#537A00]/50 text-[#171B18] shadow-xs'
              }`}
              id="landing-login-btn"
            >
              Login
            </button>
          </div>

          <button
            onClick={onContinueAnonymously}
            className={`text-xs font-bold font-meta transition-all uppercase tracking-widest underline mt-2 cursor-pointer ${
              theme === 'dark' ? 'text-[#A3A3A3] hover:text-[#B7FF38]' : 'text-[#626862] hover:text-[#537A00]'
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
        className="text-center mt-6 text-[10px] text-[#A3A3A3] font-meta tracking-widest uppercase shrink-0"
        id="landing-footer"
      >
        GroundZero — Live Hyperlocal Citizen Grid
      </motion.div>
    </div>
  );
}
