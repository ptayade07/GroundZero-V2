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
    ? "bg-[#111111] border-[#303030] text-white shadow-2xl"
    : "bg-white border-[#E1E5DF] text-[#171B18] shadow-lg";

  const headingClass = isDark ? "text-white" : "text-[#171B18]";
  const switcherClass = isDark
    ? "text-[#A3A3A3] hover:text-[#B7FF38]"
    : "text-[#626862] hover:text-[#537A00]";

  const inputLabelClass = isDark ? "text-[#A3A3A3]" : "text-[#626862]";
  const inputClass = isDark
    ? "bg-[#191919] border-[#303030] text-white placeholder-gray-500 focus:border-[#B7FF38]/50 font-ui"
    : "bg-[#F1F4EF] border-[#E1E5DF] text-[#171B18] placeholder-gray-400 focus:border-[#537A00]/50 font-ui";
  const iconClass = isDark ? "text-[#A3A3A3]" : "text-[#626862]";

  const anonymousDotClass = isDark ? "bg-[#B7FF38]" : "bg-[#537A00]";
  const anonymousTextClass = isDark
    ? "text-[#A3A3A3] hover:text-[#B7FF38]"
    : "text-[#626862] hover:text-[#537A00]";

  const submitBtnBg = isDark
    ? "bg-[#B7FF38] hover:bg-[#A6ED27] active:bg-[#94D91F] text-black shadow-md"
    : "bg-[#537A00] text-white shadow-md";

  const arrowColor = isDark ? "text-black" : "text-white";

  return (
    <div 
      className={`fixed inset-0 w-full h-full flex flex-col items-center justify-center p-4 overflow-y-auto z-[90] font-ui transition-all duration-300 ${
        isDark ? 'bg-black text-white' : 'bg-[#FAFCFA] text-[#171B18]'
      }`}
      id="login-glass-screen"
    >
      {/* Soft blurry abstract background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none ${isDark ? 'bg-[#B7FF38]/5' : 'bg-[#537A00]/5'}`} />
        <div className={`absolute top-[35%] -right-[15%] w-[420px] h-[420px] rounded-full blur-[110px] pointer-events-none ${isDark ? 'bg-[#B7FF38]/5' : 'bg-[#537A00]/5'}`} />
      </div>

      {/* Top Tagline */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6 z-10"
      >
        <span className={`text-[10px] font-bold tracking-[0.3em] font-meta uppercase ${isDark ? 'text-[#A3A3A3]' : 'text-[#626862]'}`}>
          GROUNDZERO SYSTEM
        </span>
      </motion.div>

      {/* Card container */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className={`w-full max-w-[340px] border rounded-[12px] p-5 sm:p-5.5 z-10 flex flex-col relative transition-all duration-300 ${cardBgClass}`}
        id="login-glass-card"
      >
        {/* Card Header: Log in / Sign up switcher */}
        <div className="flex items-baseline justify-between mb-4">
          <h2 className={`text-xl font-black tracking-tight font-display uppercase transition-colors duration-300 ${headingClass}`}>
            {isSignUp ? "Sign up" : "Log in"}
          </h2>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
            }}
            className={`text-xs font-bold font-meta transition-colors duration-300 cursor-pointer select-none ${switcherClass}`}
          >
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </div>

        {/* Input fields */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Optional Name for Sign Up */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-1 overflow-hidden"
            >
              <label className={`block text-[11px] font-bold uppercase tracking-wider font-meta ${inputLabelClass}`}>
                Full Name
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`}>
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  disabled={isPending}
                  className={`w-full pl-9 pr-3.5 py-1.5 min-h-[36px] border rounded-[8px] text-xs font-ui focus:outline-none ${inputClass}`}
                />
              </div>
            </motion.div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label className={`block text-[11px] font-bold uppercase tracking-wider font-meta ${inputLabelClass}`}>
              Email address
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`}>
                <Mail className="w-3.5 h-3.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@groundzero.news"
                required
                disabled={isPending}
                className={`w-full pl-9 pr-3.5 py-1.5 min-h-[36px] border rounded-[8px] text-xs font-ui focus:outline-none ${inputClass}`}
                id="login-email-input"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className={`block text-[11px] font-bold uppercase tracking-wider font-meta ${inputLabelClass}`}>
              Password
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`}>
                <Lock className="w-3.5 h-3.5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={isPending}
                className={`w-full pl-9 pr-9 py-1.5 min-h-[36px] border rounded-[8px] text-xs font-ui focus:outline-none ${inputClass}`}
                id="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer ${iconClass} hover:text-white`}
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
              className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-[8px] text-xs text-red-500 flex items-center gap-2 font-meta"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Bottom Row: Anonymous Login and Submit Button */}
          <div className="flex items-center justify-between pt-1.5">
            {/* Anonymous trigger on left */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${anonymousDotClass}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${anonymousDotClass}`}></span>
              </span>
              <button
                type="button"
                onClick={handleAnonymousLogin}
                disabled={isPending}
                className={`text-xs font-bold font-meta transition-colors duration-300 cursor-pointer disabled:opacity-50 py-1 ${anonymousTextClass}`}
                id="login-anonymous-btn"
              >
                Enter Anonymously
              </button>
            </div>

            {/* Submit button on right */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-9 h-9 rounded-[8px] flex items-center justify-center transition-all cursor-pointer transform active:scale-95 shrink-0 ${submitBtnBg}`}
              id="login-submit-btn"
            >
              {isPending ? (
                <Loader2 className={`w-3.5 h-3.5 animate-spin ${arrowColor}`} />
              ) : (
                <ArrowRight className={`w-3.5 h-3.5 stroke-[2.5] ${arrowColor}`} />
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
        className={`text-center mt-6 text-xs font-meta tracking-wide max-w-[300px] leading-relaxed ${
          isDark ? 'text-[#A3A3A3]' : 'text-[#626862]'
        }`}
      >
        Secured public connection. GroundZero provides encrypted, community-verified local news streams.
      </motion.div>
    </div>
  );
}
