/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Issue, Category, ReactionType } from "../types";
import { Search, MapPin, Sparkles, Eye, ShieldCheck, HelpCircle, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SocialFeedProps {
  issues: Issue[];
  currentUserId: string;
  onSelectIssue: (issue: Issue) => void;
  onReact: (issueId: string, reaction: ReactionType) => void;
  timeFilter: "2hrs" | "today" | "week" | "all";
  setTimeFilter: (filter: "2hrs" | "today" | "week" | "all") => void;
  onSeeThisToo: (issueId: string) => void;
  onNavigateToSearch?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

const CATEGORY_MAP: Record<Category, { label: string; emoji: string; bg: string; text: string; gradient: string }> = {
  "Civic Issue": { label: "Civic Issue", emoji: "🏢", bg: "bg-indigo-500/20 border-indigo-500/30", text: "text-indigo-400", gradient: "from-[#1e1b4b] via-[#0f0a21] to-[#030008]" },
  "Pothole": { label: "Pothole", emoji: "🕳️", bg: "bg-orange-500/20 border-orange-500/30", text: "text-orange-400", gradient: "from-[#431407] via-[#1c0802] to-[#050000]" },
  "Flooding": { label: "Flooding", emoji: "🌊", bg: "bg-blue-500/20 border-blue-500/30", text: "text-blue-400", gradient: "from-[#172554] via-[#0c1435] to-[#01020d]" },
  "Power Cut": { label: "Power Cut", emoji: "🔌", bg: "bg-yellow-500/20 border-yellow-500/30", text: "text-yellow-400", gradient: "from-[#422006] via-[#1c0d02] to-[#040100]" },
  "Garbage": { label: "Garbage", emoji: "🗑️", bg: "bg-amber-700/20 border-amber-700/30", text: "text-amber-500", gradient: "from-[#3b2207] via-[#1a0e03] to-[#030100]" },
  "Corruption": { label: "Corruption", emoji: "💼", bg: "bg-red-500/20 border-red-500/30", text: "text-red-400", gradient: "from-[#450a0a] via-[#1f0303] to-[#050000]" },
  "Government Failure": { label: "Govt Failure", emoji: "🏛️", bg: "bg-red-700/20 border-red-700/30", text: "text-red-500", gradient: "from-[#5c0a0a] via-[#240404] to-[#050000]" },
  "Protest / Rally": { label: "Protest / Rally", emoji: "📣", bg: "bg-pink-500/20 border-pink-500/30", text: "text-pink-400", gradient: "from-[#4c0519] via-[#20020a] to-[#050001]" },
  "Local Drama": { label: "Local Drama", emoji: "🍵", bg: "bg-teal-500/20 border-teal-500/30", text: "text-teal-400", gradient: "from-[#042f2e] via-[#021414] to-[#000303]" },
  "Argument / Dispute": { label: "Argument", emoji: "🗣️", bg: "bg-rose-500/20 border-rose-500/30", text: "text-rose-400", gradient: "from-[#4c0519] via-[#1a050d] to-[#050001]" },
  "Harassment": { label: "Harassment", emoji: "⚠️", bg: "bg-red-600/20 border-red-600/30", text: "text-red-500", gradient: "from-[#580505] via-[#1c0202] to-[#050000]" },
  "Breaking News": { label: "Breaking News", emoji: "📰", bg: "bg-cyan-500/20 border-cyan-500/30", text: "text-cyan-400", gradient: "from-[#083344] via-[#03151c] to-[#000405]" },
  "Village Problem": { label: "Village Prob", emoji: "🏡", bg: "bg-green-500/20 border-green-500/30", text: "text-green-400", gradient: "from-[#064e3b] via-[#022119] to-[#000403]" },
  "Weather": { label: "Weather", emoji: "☁️", bg: "bg-sky-500/20 border-sky-500/30", text: "text-sky-400", gradient: "from-[#0c4a6e] via-[#042238] to-[#00060d]" },
  "War / Conflict": { label: "Conflict", emoji: "💥", bg: "bg-gray-800/40 border-gray-700/30", text: "text-gray-400", gradient: "from-[#1c1917] via-[#0c0a09] to-black" },
  "Other": { label: "Other", emoji: "❓", bg: "bg-gray-700/20 border-gray-700/30", text: "text-gray-400", gradient: "from-[#18181b] via-[#09090b] to-black" }
};

const CATEGORY_SOLID_BG: Record<Category, string> = {
  "Civic Issue": "bg-indigo-950",
  "Pothole": "bg-amber-950",
  "Flooding": "bg-blue-950",
  "Power Cut": "bg-yellow-950",
  "Garbage": "bg-neutral-900",
  "Corruption": "bg-red-950",
  "Government Failure": "bg-rose-950",
  "Protest / Rally": "bg-pink-950",
  "Local Drama": "bg-teal-950",
  "Argument / Dispute": "bg-orange-950",
  "Harassment": "bg-red-950",
  "Breaking News": "bg-cyan-950",
  "Village Problem": "bg-green-950",
  "Weather": "bg-sky-950",
  "War / Conflict": "bg-neutral-900",
  "Other": "bg-neutral-900"
};

const CATEGORY_LIGHT_SOLID_BG: Record<Category, string> = {
  "Civic Issue": "bg-indigo-50/60",
  "Pothole": "bg-amber-50/60",
  "Flooding": "bg-blue-50/60",
  "Power Cut": "bg-yellow-50/60",
  "Garbage": "bg-neutral-100/60",
  "Corruption": "bg-red-50/60",
  "Government Failure": "bg-rose-50/60",
  "Protest / Rally": "bg-pink-50/60",
  "Local Drama": "bg-teal-50/60",
  "Argument / Dispute": "bg-orange-50/60",
  "Harassment": "bg-red-50/60",
  "Breaking News": "bg-cyan-50/60",
  "Village Problem": "bg-green-50/60",
  "Weather": "bg-sky-50/60",
  "War / Conflict": "bg-neutral-100/60",
  "Other": "bg-neutral-100/60"
};

export default function SocialFeed({
  issues,
  currentUserId,
  onSelectIssue,
  onReact,
  timeFilter,
  setTimeFilter,
  onSeeThisToo,
  onNavigateToSearch,
  theme = "dark",
  onToggleTheme
}: SocialFeedProps) {
  const [selectedDetailPost, setSelectedDetailPost] = useState<Issue | null>(null);

  const timeAgo = (dateStr: string) => {
    try {
      const created = new Date(dateStr).getTime();
      const now = Date.now();
      const diffMs = now - created;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return "Recently";
    }
  };

  // Sort issues by newest first
  const sortedIssues = [...issues].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className={`w-full h-full relative flex flex-col ${theme === 'dark' ? 'bg-black text-white' : 'bg-[#FAFAFA] text-neutral-900'}`} id="social-feed-tiktok-view">
      
      {/* Top Bar Overlay */}
      <div className="absolute top-0 inset-x-0 z-20 px-4 py-3.5 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className={`px-2 py-0.5 rounded text-[10px] font-black font-mono text-[#0A0A0A] ${
            theme === 'dark' ? 'bg-brand shadow-[0_0_8px_rgba(57,255,20,0.3)]' : 'bg-[#2ECC0F] shadow-[0_0_8px_rgba(46,204,15,0.3)]'
          }`}>
            GZ
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black tracking-tight uppercase text-white leading-none">
                GROUND<span className={theme === 'dark' ? 'text-brand' : 'text-[#2ECC0F]'}>ZERO</span>
              </h1>
              <span className={`flex items-center gap-0.5 px-1 py-0.2 rounded border text-[7px] font-black tracking-wider uppercase ${
                theme === 'dark' ? 'bg-emerald-950/80 border-[#39FF14]/30 text-[#39FF14]' : 'bg-emerald-50/80 border-[#2ECC0F]/30 text-[#2ECC0F]'
              }`}>
                <span className={`w-1 h-1 rounded-full animate-ping ${theme === 'dark' ? 'bg-[#39FF14]' : 'bg-[#2ECC0F]'}`} />
                <span className="animate-pulse">LIVE</span>
              </span>
            </div>
            <p className="text-[7px] text-gray-400 font-mono leading-none uppercase mt-0.5 tracking-wider">
              CIVIC TEA & BUZZ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
              theme === 'dark'
                ? 'bg-black/40 hover:bg-black/60 border-gray-800/40 text-gray-400 hover:text-white'
                : 'bg-white/60 hover:bg-white/80 border-gray-300/40 text-gray-650 hover:text-black'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            id="social-feed-theme-toggle"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Action Button Link to Search Tab */}
          <button
            onClick={onNavigateToSearch}
            className={`p-1.5 border rounded-lg transition-all flex items-center gap-1 font-mono text-[9px] uppercase font-bold cursor-pointer ${
              theme === 'dark'
                ? 'bg-black/40 hover:bg-black/60 border-gray-800/40 text-gray-300 hover:text-brand'
                : 'bg-white/60 hover:bg-white/80 border-gray-300/40 text-gray-700 hover:text-[#2ECC0F]'
            }`}
            id="social-feed-top-search-btn"
          >
            <Search className="w-3 h-3" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Swipe Snapping vertical container */}
      <div className="flex-1 w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none" id="swipe-snap-feed-container">
        {sortedIssues.length === 0 ? (
          <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center gap-3 ${
            theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-neutral-900'
          }`}>
            <div className={`p-4 rounded-full border ${
              theme === 'dark' ? 'bg-brand/10 border-brand/20 text-brand' : 'bg-[#2ECC0F]/10 border-[#2ECC0F]/20 text-[#2ECC0F]'
            }`}>
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <p className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No bulletins or neighborhood drama spilled yet.</p>
              <p className={`text-[9px] font-mono mt-1 uppercase font-bold ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>TAP THE '+' TAB AT THE BOTTOM TO POST ONE!</p>
            </div>
          </div>
        ) : (
          sortedIssues.map((issue) => {
            const catConfig = CATEGORY_MAP[issue.category] || CATEGORY_MAP["Other"];
            const userReaction = issue.userReactions?.[currentUserId];
            const hasPhoto = !!issue.photoUrl;
            const isCardLight = theme === "light" && !hasPhoto;

            return (
              <div
                key={issue.id}
                onClick={() => setSelectedDetailPost(issue)}
                className={`w-full h-full snap-start snap-always relative overflow-hidden flex flex-col justify-end cursor-pointer group transition-colors duration-350 ${
                  isCardLight ? 'bg-white' : 'bg-black'
                }`}
                id={`feed-card-tiktok-${issue.id}`}
              >
                {/* 1. Backdrop Photo or Solid Category Gradient */}
                {hasPhoto ? (
                  <>
                    <img
                      src={issue.photoUrl}
                      alt={issue.title}
                      className="absolute inset-0 w-full h-full object-cover select-none group-hover:scale-105 transition-transform duration-1000 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    {/* Subtle dark gradient overlay limited to the bottom third of the card */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none" />
                  </>
                ) : (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center p-12 select-none ${
                    isCardLight 
                      ? (CATEGORY_LIGHT_SOLID_BG[issue.category] || "bg-gray-50") 
                      : (CATEGORY_SOLID_BG[issue.category] || "bg-neutral-900")
                  }`}>
                    {/* Centered category emoji as clean background accent with high-end scale effect */}
                    <div className={`text-[120px] font-black transform group-hover:scale-110 transition-transform duration-1000 ease-out ${
                      isCardLight ? 'opacity-20' : 'opacity-10'
                    }`}>
                      {catConfig.emoji}
                    </div>
                  </div>
                )}

                {/* 2. Overlaid Bottom Content (Details & Description Teaser) */}
                <div className="absolute bottom-6 left-4 right-20 z-10 flex flex-col gap-1.5 pointer-events-auto text-left max-h-[25%] justify-end">
                  {/* Category and Location Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${
                      isCardLight 
                        ? 'bg-neutral-100 border-neutral-200 text-neutral-800 shadow-xs' 
                        : `bg-black/60 ${catConfig.bg} ${catConfig.text} backdrop-blur-sm`
                    }`}>
                      <span>{catConfig.emoji}</span> {catConfig.label}
                    </span>
                    <span className={`text-[8px] font-mono uppercase tracking-wider flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                      isCardLight 
                        ? 'bg-white/90 border-gray-200/80 text-gray-700 shadow-xs' 
                        : 'bg-black/60 border-gray-800/40 text-gray-300 backdrop-blur-sm'
                    }`}>
                      📍 {issue.area}
                    </span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                      isCardLight 
                        ? 'bg-gray-100/80 text-gray-600 border border-gray-200/50' 
                        : 'bg-black/40 text-gray-400 backdrop-blur-sm'
                    }`}>
                      {timeAgo(issue.createdAt)}
                    </span>
                  </div>

                  {/* Main Headline (compact, maximum 2 lines) */}
                  <h2 className={`text-sm md:text-base font-black leading-tight uppercase tracking-tight line-clamp-2 ${
                    isCardLight 
                      ? 'text-neutral-900' 
                      : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]'
                  }`}>
                    {issue.title}
                  </h2>

                  {/* Reporter & Verification info */}
                  <div className={`flex items-center gap-1.5 flex-wrap ${
                    isCardLight ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    <span className="text-[10px]">👤</span>
                    <span className={`text-[10px] font-bold tracking-tight ${
                      isCardLight ? 'text-neutral-900' : 'text-white drop-shadow-sm'
                    }`}>
                      {issue.isAnonymous ? "Anonymous Citizen" : issue.reporterName}
                    </span>
                    <span className={`px-1 py-0.2 font-mono rounded text-[8px] font-black tracking-tight uppercase border ${
                      isCardLight 
                        ? 'bg-[#2ECC0F]/10 border-[#2ECC0F]/20 text-[#2ECC0F]' 
                        : 'bg-brand/15 border border-brand/35 text-brand'
                    }`}>
                      🛡️ {issue.reporterTrustScore} TS
                    </span>
                    {issue.isSpam && (
                      <span className={`flex items-center gap-1 px-1.5 py-0.2 rounded text-[8px] font-mono uppercase font-black border ${
                        isCardLight 
                          ? 'bg-red-50 border-red-200 text-red-600' 
                          : 'bg-red-950/80 border border-red-500/40 text-red-400'
                      }`}>
                        ⚠️ SPAM
                      </span>
                    )}
                  </div>

                  {/* Gentle interaction instruction */}
                  <div className={`text-[8px] font-mono uppercase tracking-widest flex items-center gap-1 animate-pulse ${
                    isCardLight ? 'text-neutral-500' : 'text-brand/80 drop-shadow-sm'
                  }`}>
                    <span>⚡ TAP FOR DETAILED BREAKDOWN</span>
                  </div>
                </div>

                {/* 3. Overlaid TikTok-style vertical icon column on the right side */}
                <div className="absolute bottom-8 right-3.5 z-10 flex flex-col items-center gap-4 pointer-events-auto">
                  
                  {/* Eye - 'I See This Too' Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeeThisToo(issue.id);
                    }}
                    className="flex flex-col items-center gap-0.5 group active:scale-95 transition-transform"
                    title="I See This Too"
                    id={`tiktok-see-too-${issue.id}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                      issue.seeThisTooUsers?.includes(currentUserId)
                        ? isCardLight
                          ? "bg-[#2ECC0F] border-[#2ECC0F] text-white shadow-md"
                          : "bg-[#39FF14] border-[#39FF14] text-black shadow-[0_0_12px_rgba(57,255,20,0.55)]"
                        : isCardLight
                          ? "bg-white/90 border-gray-200 text-gray-700 hover:border-gray-300 shadow-xs"
                          : "bg-black/60 border-neutral-800 text-white hover:border-neutral-700"
                    }`}>
                      <span className="text-base">👁️</span>
                    </div>
                    <span className={`text-[9px] font-mono font-black ${
                      isCardLight ? 'text-neutral-800' : 'text-white drop-shadow'
                    }`}>
                      {issue.seeThisTooCount || 0}
                    </span>
                    <span className={`text-[7px] font-mono font-extrabold uppercase tracking-tighter leading-none text-center ${
                      isCardLight ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      SEE TOO
                    </span>
                  </button>

                  {/* Verified ✅ */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReact(issue.id, "verified");
                    }}
                    className="flex flex-col items-center gap-0.5 group active:scale-95 transition-transform"
                    id={`tiktok-react-verified-${issue.id}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                      userReaction === "verified"
                        ? isCardLight
                          ? "bg-[#2ECC0F] border-[#2ECC0F] text-white shadow-md"
                          : "bg-[#39FF14] border-[#39FF14] text-black shadow-[0_0_10px_rgba(57,255,20,0.5)]"
                        : isCardLight
                          ? "bg-white/90 border-gray-200 text-gray-700 hover:border-gray-300 shadow-xs"
                          : "bg-black/60 border-neutral-800 text-white hover:border-neutral-700"
                    }`}>
                      <span className="text-base">✅</span>
                    </div>
                    <span className={`text-[9px] font-mono font-black ${
                      isCardLight ? 'text-neutral-800' : 'text-white drop-shadow'
                    }`}>
                      {issue.reactions.verified || 0}
                    </span>
                    <span className={`text-[7px] font-mono font-extrabold uppercase tracking-tighter leading-none text-center ${
                      isCardLight ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      VOUCH
                    </span>
                  </button>

                  {/* Cap 🧢 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReact(issue.id, "cap");
                    }}
                    className="flex flex-col items-center gap-0.5 group active:scale-95 transition-transform"
                    id={`tiktok-react-cap-${issue.id}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                      userReaction === "cap"
                        ? isCardLight
                          ? "bg-red-500 border-red-500 text-white shadow-md"
                          : "bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        : isCardLight
                          ? "bg-white/90 border-gray-200 text-gray-700 hover:border-gray-300 shadow-xs"
                          : "bg-black/60 border-neutral-800 text-white hover:border-neutral-700"
                    }`}>
                      <span className="text-base">🧢</span>
                    </div>
                    <span className={`text-[9px] font-mono font-black ${
                      isCardLight ? 'text-neutral-800' : 'text-white drop-shadow'
                    }`}>
                      {issue.reactions.cap || 0}
                    </span>
                    <span className={`text-[7px] font-mono font-extrabold uppercase tracking-tighter leading-none text-center ${
                      isCardLight ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      CAP
                    </span>
                  </button>

                  {/* Big Issue 🔥 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReact(issue.id, "big_issue");
                    }}
                    className="flex flex-col items-center gap-0.5 group active:scale-95 transition-transform"
                    id={`tiktok-react-big-${issue.id}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                      userReaction === "big_issue"
                        ? isCardLight
                          ? "bg-[#2ECC0F] border-[#2ECC0F] text-white shadow-md"
                          : "bg-brand border-brand text-black shadow-[0_0_10px_rgba(57,255,20,0.5)]"
                        : isCardLight
                          ? "bg-white/90 border-gray-200 text-gray-700 hover:border-gray-300 shadow-xs"
                          : "bg-black/60 border-neutral-800 text-white hover:border-neutral-700"
                    }`}>
                      <span className="text-base">🔥</span>
                    </div>
                    <span className={`text-[9px] font-mono font-black ${
                      isCardLight ? 'text-neutral-800' : 'text-white drop-shadow'
                    }`}>
                      {issue.reactions.big_issue || 0}
                    </span>
                    <span className={`text-[7px] font-mono font-extrabold uppercase tracking-tighter leading-none text-center ${
                      isCardLight ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      HOT
                    </span>
                  </button>

                  {/* Bruh 💀 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReact(issue.id, "bruh");
                    }}
                    className="flex flex-col items-center gap-0.5 group active:scale-95 transition-transform"
                    id={`tiktok-react-bruh-${issue.id}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                      userReaction === "bruh"
                        ? isCardLight
                          ? "bg-teal-600 border-teal-500 text-white shadow-md"
                          : "bg-teal-600 border-teal-500 text-white shadow-[0_0_10px_rgba(13,148,136,0.5)]"
                        : isCardLight
                          ? "bg-white/90 border-gray-200 text-gray-700 hover:border-gray-300 shadow-xs"
                          : "bg-black/60 border-neutral-800 text-white hover:border-neutral-700"
                    }`}>
                      <span className="text-base">💀</span>
                    </div>
                    <span className={`text-[9px] font-mono font-black ${
                      isCardLight ? 'text-neutral-800' : 'text-white drop-shadow'
                    }`}>
                      {issue.reactions.bruh || 0}
                    </span>
                    <span className={`text-[7px] font-mono font-extrabold uppercase tracking-tighter leading-none text-center ${
                      isCardLight ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      BRUH
                    </span>
                  </button>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sheet Details Panel */}
      <AnimatePresence>
        {selectedDetailPost && (
          <>
            {/* Backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetailPost(null)}
              className="absolute inset-0 bg-black/80 z-30 pointer-events-auto"
            />
            {/* Bottom Sheet Wrapper */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`absolute inset-x-0 bottom-0 max-h-[80%] border-t rounded-t-2xl z-40 px-6 py-8 flex flex-col gap-6 overflow-y-auto pointer-events-auto shadow-2xl text-left ${
                theme === 'dark' ? 'bg-black border-neutral-900 text-white' : 'bg-white border-gray-200 text-neutral-900'
              }`}
              id="details-bottom-sheet"
            >
              {/* Top drag handle indicator */}
              <div className={`w-12 h-1 rounded-full mx-auto mb-1 shrink-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-300'}`} />

              {/* Header inside Bottom Sheet */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border bg-black/40 ${CATEGORY_MAP[selectedDetailPost.category]?.bg || ""} ${CATEGORY_MAP[selectedDetailPost.category]?.text || ""}`}>
                    {CATEGORY_MAP[selectedDetailPost.category]?.emoji} {selectedDetailPost.category}
                  </span>
                  <h2 className={`text-base font-black uppercase mt-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
                    {selectedDetailPost.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedDetailPost(null)}
                  className={`p-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    theme === 'dark' ? 'bg-neutral-900 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-black'
                  }`}
                  id="close-bottom-sheet-btn"
                  title="Close Detail Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Local Info panel */}
              <div className={`p-4 border-b space-y-3.5 text-xs ${theme === 'dark' ? 'bg-black border-neutral-900' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-mono uppercase">📍 Area Sector:</span>
                  <span className={`font-bold uppercase font-mono ${theme === 'dark' ? 'text-brand' : 'text-[#2ECC0F]'}`}>{selectedDetailPost.area}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-mono uppercase">⏰ Reported Time:</span>
                  <span className={`font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{new Date(selectedDetailPost.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-mono uppercase">👤 Reporter Name:</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
                    {selectedDetailPost.isAnonymous ? "Anonymous Citizen" : selectedDetailPost.reporterName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-mono uppercase">🛡️ Trust Score:</span>
                  <span className={`font-black ${theme === 'dark' ? 'text-brand' : 'text-[#2ECC0F]'}`}>{selectedDetailPost.reporterTrustScore} / 100</span>
                </div>
                {selectedDetailPost.status && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500 font-mono uppercase">🚀 Verification State:</span>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${
                      theme === 'dark' ? 'bg-[#39FF14]/10 border-[#39FF14]/20 text-brand' : 'bg-[#2ECC0F]/10 border-[#2ECC0F]/20 text-[#2ECC0F]'
                    }`}>
                      {selectedDetailPost.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">
                  Detailed Complaint Description
                </span>
                <p className={`text-xs leading-relaxed font-sans p-4 whitespace-pre-wrap ${
                  theme === 'dark' ? 'text-gray-300 bg-black' : 'text-gray-700 bg-gray-50'
                }`}>
                  {selectedDetailPost.description}
                </p>
              </div>

              {/* AI Insight Description (if any) */}
              {selectedDetailPost.aiDescription && (
                <div className="space-y-1.5">
                  <span className={`text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-1 ${theme === 'dark' ? 'text-brand' : 'text-[#2ECC0F]'}`}>
                    <Sparkles className="w-3.5 h-3.5" /> AI Analysis Insight
                  </span>
                  <p className={`text-xs p-4 border italic leading-relaxed ${
                    theme === 'dark' ? 'text-gray-400 bg-neutral-950 border-neutral-900' : 'text-gray-650 bg-gray-50 border-gray-200'
                  }`}>
                    "{selectedDetailPost.aiDescription}"
                  </p>
                </div>
              )}

              {/* Action Buttons inside Bottom Sheet */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setSelectedDetailPost(null);
                    onSelectIssue(selectedDetailPost); // Center map and show popup
                  }}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    theme === 'dark' ? 'bg-brand text-black' : 'bg-[#2ECC0F] text-white'
                  }`}
                >
                  <MapPin className="w-4 h-4" /> View on Local Radar Map
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
