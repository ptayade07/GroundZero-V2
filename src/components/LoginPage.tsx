/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, ShieldAlert, Sparkles, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
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
  
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      // Name fallback from email
      const calculatedName = name.trim() || email.split("@")[0];
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

  return (
    <div className={`w-full max-w-sm mx-auto flex flex-col justify-center min-h-[85vh] px-4 ${
      theme === 'dark' ? 'text-white' : 'text-neutral-900'
    }`} id="login-splash-screen">
      {/* App branding */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#39FF14] border-neutral-900' : 'bg-[#2ECC0F] border-gray-200 text-white'
          }`}
        >
          <span className={`text-2xl font-black font-mono ${theme === 'dark' ? 'text-black' : 'text-white'}`}>GZ</span>
        </motion.div>
        
        <h1 className={`text-2xl font-black tracking-tight font-sans uppercase ${
          theme === 'dark' ? 'text-white' : 'text-neutral-900'
        }`}>
          GROUND<span className={theme === 'dark' ? 'text-[#39FF14]' : 'text-[#2ECC0F]'}>ZERO</span>
        </h1>
        <p className={`text-[10px] font-mono tracking-widest uppercase mt-1 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          LIVE NEWS BY THE PEOPLE, FOR THE PEOPLE
        </p>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`border rounded-xl p-6 backdrop-blur transition-all duration-300 ${
          theme === 'dark' ? 'bg-black border-neutral-900' : 'bg-white border-gray-200 shadow-md'
        }`}
      >
        <h2 className="text-sm font-bold font-mono text-gray-500 mb-4 uppercase tracking-wider text-center">
          Access GroundZero Grid
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email input */}
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-500 mb-1">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@groundzero.news"
              required
              disabled={isPending}
              className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none transition-all ${
                theme === 'dark' 
                  ? 'bg-black border-neutral-900 text-white placeholder-gray-700 focus:border-[#39FF14]/50' 
                  : 'bg-gray-50 border-gray-250 text-neutral-900 placeholder-gray-400 focus:border-[#2ECC0F]/50'
              }`}
              id="login-email-input"
            />
          </div>

          {/* Full Name input (Optional) */}
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-500 mb-1">
              FULL NAME (OPTIONAL)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Sharma"
              disabled={isPending}
              className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none transition-all ${
                theme === 'dark' 
                  ? 'bg-black border-neutral-900 text-white placeholder-gray-700 focus:border-[#39FF14]/50' 
                  : 'bg-gray-50 border-gray-250 text-neutral-900 placeholder-gray-400 focus:border-[#2ECC0F]/50'
              }`}
              id="login-name-input"
            />
          </div>

          {/* Password input */}
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-500 mb-1">
              PASSWORD (SIMULATED SECURE)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={isPending}
                className={`w-full pl-3 pr-10 py-2 text-xs border rounded-lg focus:outline-none transition-all ${
                  theme === 'dark' 
                    ? 'bg-black border-neutral-900 text-white placeholder-gray-700 focus:border-[#39FF14]/50' 
                    : 'bg-gray-50 border-gray-250 text-neutral-900 placeholder-gray-400 focus:border-[#2ECC0F]/50'
                }`}
                id="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-2.5 top-2 p-0.5 transition-colors ${
                  theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
                id="login-toggle-pass-btn"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2 bg-red-600/10 border border-red-500/30 rounded-lg text-[10px] text-red-400 flex items-center gap-1.5 font-sans">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-2.5 font-black rounded-lg text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer ${
              theme === 'dark' ? 'bg-[#39FF14] text-black hover:opacity-90' : 'bg-[#2ECC0F] text-white hover:opacity-95 shadow-sm'
            }`}
            id="login-submit-btn"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <span>VERIFY & ENTER GRID</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${theme === 'dark' ? 'border-neutral-900' : 'border-gray-200'}`}></div>
          </div>
          <span className={`relative px-3 text-[9px] font-mono uppercase ${
            theme === 'dark' ? 'bg-black text-gray-500' : 'bg-white text-gray-400'
          }`}>OR</span>
        </div>

        {/* Anonymous login option */}
        <button
          onClick={handleAnonymousLogin}
          disabled={isPending}
          className={`w-full py-2.5 border font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer ${
            theme === 'dark' 
              ? 'bg-black border-neutral-900 hover:border-neutral-800 text-gray-300 hover:text-white' 
              : 'bg-white border-gray-200 hover:border-gray-300 text-neutral-800 hover:bg-gray-50 shadow-xs'
          }`}
          id="login-anonymous-btn"
        >
          <span className={theme === 'dark' ? 'text-[#39FF14]' : 'text-[#2ECC0F]'}>🛡️</span>
          <span>ENTER ANONYMOUSLY</span>
        </button>
      </motion.div>

      {/* Footer statistics decoration */}
      <div className={`text-center mt-6 text-[9px] font-mono tracking-wide flex flex-col gap-1 ${
        theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
      }`}>
        <p>● SECURE SHIELD ACTIVE (AES-256)</p>
        <p>GROUNDZERO © 2026 RADAR OPERATIONS</p>
      </div>
    </div>
  );
}
