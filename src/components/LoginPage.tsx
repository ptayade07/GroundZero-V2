/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface LoginPageProps {
  onLogin: (email: string, name: string, isAnonymous: boolean) => Promise<void>;
  theme?: "light" | "dark";
}

export default function LoginPage({ onLogin, theme = "dark" }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isDark = theme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter an email address.");
      return;
    }

    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsPending(true);
    try {
      const calculatedName = isSignUp ? (name.trim() || email.split("@")[0]) : email.split("@")[0];
      await onLogin(email.toLowerCase().trim(), calculatedName, false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate.");
    } finally {
      setIsPending(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setErrorMsg("");
    setIsPending(true);
    try {
      await onLogin("", "", true);
    } catch (err: any) {
      setErrorMsg("Failed to start anonymous session.");
    } finally {
      setIsPending(false);
    }
  };

  const bgStyle = isDark
    ? { background: "radial-gradient(circle at 50% 50%, #1A1A1A 0%, #0A0A0A 70%, #020202 100%)" }
    : { background: "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F3F4F6 70%, #E5E7EB 100%)" };

  const blob1Color = isDark ? "bg-neutral-800/10" : "bg-neutral-200/40";
  const blob2Color = isDark ? "bg-neutral-900/10" : "bg-neutral-100/40";
  const blob3Color = isDark ? "bg-neutral-950/15" : "bg-neutral-50/50";

  const cardBgClass = isDark
    ? "bg-white/[0.05] border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    : "bg-white/60 border-neutral-200/50 text-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.04)]";

  const headingClass = isDark ? "text-white" : "text-neutral-800";
  const switcherClass = isDark
    ? "text-neutral-400 hover:text-white"
    : "text-neutral-500 hover:text-neutral-800";

  const inputLabelClass = isDark ? "text-neutral-400" : "text-neutral-500";
  const inputClass = isDark
    ? "bg-white/[0.05] border-white/10 text-white placeholder-neutral-500 focus:bg-white/[0.08] focus:border-white/20"
    : "bg-neutral-900/[0.03] border-neutral-300/60 text-neutral-800 placeholder-neutral-400/70 focus:bg-white/80 focus:border-neutral-400";
  const iconClass = isDark ? "text-neutral-400" : "text-neutral-400/85";

  const anonymousDotClass = isDark ? "bg-[#39FF14]" : "bg-[#2ECC0F]";
  const anonymousTextClass = isDark
    ? "text-neutral-400 hover:text-white"
    : "text-neutral-500 hover:text-neutral-800";

  const submitBtnBg = isDark
    ? "bg-[#39FF14] hover:bg-[#39FF14]/90 text-black shadow-[0_4px_12px_rgba(57,255,20,0.25)]"
    : "bg-[#2ECC0F] hover:bg-[#2ECC0F]/90 text-white shadow-[0_4px_12px_rgba(46,204,15,0.2)]";

  const arrowColor = isDark ? "text-black" : "text-white";

  return (
    <div 
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center p-4 overflow-y-auto z-[90] font-sans selection:bg-[#39FF14]/20 transition-all duration-500"
      id="login-glass-screen"
      style={bgStyle}
    >
      {/* Soft warm blurry abstract background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[350px] h-[350px] rounded-full blur-[90px] transition-colors duration-500 ${blob1Color}`} />
        <div className={`absolute top-[35%] -right-[15%] w-[420px] h-[420px] rounded-full blur-[100px] transition-colors duration-500 ${blob2Color}`} />
        <div className={`absolute -bottom-[10%] left-[15%] w-[380px] h-[380px] rounded-full blur-[90px] transition-colors duration-500 ${blob3Color}`} />
      </div>

      {/* Top Tagline */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6 z-10"
      >
        <span className={`text-[10px] font-bold tracking-[0.3em] font-mono uppercase ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
          GROUNDZERO SYSTEM
        </span>
      </motion.div>

      {/* Glassmorphism card container */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className={`w-full max-w-[360px] border rounded-[24px] p-8 backdrop-blur-[20px] z-10 flex flex-col relative transition-all duration-500 ${cardBgClass}`}
        id="login-glass-card"
      >
        {/* Card Header: Log in / Sign up switcher */}
        <div className="flex items-baseline justify-between mb-8">
          <h2 className={`text-3xl font-black tracking-tight font-sans transition-colors duration-500 ${headingClass}`}>
            {isSignUp ? "Sign up" : "Log in"}
          </h2>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
            }}
            className={`text-xs font-bold transition-colors duration-300 cursor-pointer select-none ${switcherClass}`}
          >
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </div>

        {/* Input fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Optional Name for Sign Up */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-1.5 overflow-hidden"
            >
              <label className={`block text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 ${inputLabelClass}`}>
                Full Name
              </label>
              <div className="relative">
                <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-500 ${iconClass}`}>
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  disabled={isPending}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-300 text-xs font-medium focus:outline-none ${inputClass}`}
                />
              </div>
            </motion.div>
          )}

          {/* Email input */}
          <div className="space-y-1.5">
            <label className={`block text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 ${inputLabelClass}`}>
              Email address
            </label>
            <div className="relative">
              <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-500 ${iconClass}`}>
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@groundzero.news"
                required
                disabled={isPending}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-300 text-xs font-medium focus:outline-none ${inputClass}`}
                id="login-email-input"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className={`block text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 ${inputLabelClass}`}>
              Password
            </label>
            <div className="relative">
              <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-500 ${iconClass}`}>
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={isPending}
                className={`w-full pl-10 pr-10 py-3 border rounded-xl transition-all duration-300 text-xs font-medium focus:outline-none ${inputClass}`}
                id="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 transition-colors duration-500 cursor-pointer ${iconClass} hover:text-neutral-400`}
                id="login-toggle-pass-btn"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Error Message display */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-600 flex items-center gap-1.5 font-medium"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Bottom Row: Anonymous Login and Small Circular Submit Button */}
          <div className="flex items-center justify-between pt-3">
            {/* Anonymous trigger on left */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${anonymousDotClass}`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${anonymousDotClass}`}></span>
              </span>
              <button
                type="button"
                onClick={handleAnonymousLogin}
                disabled={isPending}
                className={`text-[11px] font-bold transition-colors duration-300 cursor-pointer disabled:opacity-50 ${anonymousTextClass}`}
                id="login-anonymous-btn"
              >
                Enter Anonymously
              </button>
            </div>

            {/* Circular submit button on right (neon green action element) */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer transform active:scale-95 shrink-0 ${submitBtnBg}`}
              id="login-submit-btn"
            >
              {isPending ? (
                <Loader2 className={`w-4 h-4 animate-spin ${arrowColor}`} />
              ) : (
                <ArrowRight className={`w-4 h-4 stroke-[2.5] ${arrowColor}`} />
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Tagline / Disclaimer at bottom */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`text-center mt-8 text-[10px] font-medium tracking-wide max-w-[280px] leading-normal transition-colors duration-500 ${
          isDark ? 'text-neutral-500' : 'text-neutral-400'
        }`}
      >
        Secured public connection. GroundZero provides encrypted, community-verified local news streams.
      </motion.div>
    </div>
  );
}
