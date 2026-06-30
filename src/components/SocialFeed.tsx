/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Issue, Category, ReactionType } from "../types";
import { Search, MapPin, Sparkles, Eye, ShieldCheck, HelpCircle } from "lucide-react";
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

export default function SocialFeed({
  issues,
  currentUserId,
  onSelectIssue,
  onReact,
  timeFilter,
  setTimeFilter,
  onSeeThisToo,
  onNavigateToSearch
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
    <div className="w-full h-full relative bg-black flex flex-col" id="social-feed-tiktok-view">
      
      {/* Top Bar Overlay */}
      <div className="absolute top-0 inset-x-0 z-20 px-4 py-3.5 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-2 py-0.5 bg-brand text-[#0A0A0A] rounded text-[10px] font-black font-mono shadow-[0_0_8px_rgba(57,255,20,0.3)]">
            GZ
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black tracking-tight uppercase text-white leading-none">
                GROUND<span className="text-brand">ZERO</span>
              </h1>
              <span className="flex items-center gap-0.5 px-1 py-0.2 rounded bg-emerald-950/80 border border-[#39FF14]/30 text-[#39FF14] text-[7px] font-black tracking-wider uppercase">
                <span className="w-1 h-1 rounded-full bg-[#39FF14] animate-ping" />
                <span className="animate-pulse">LIVE</span>
              </span>
            </div>
            <p className="text-[7px] text-gray-400 font-mono leading-none uppercase mt-0.5 tracking-wider">
              CIVIC TEA & BUZZ
            </p>
          </div>
        </div>

        {/* Action Button Link to Search Tab */}
        <button
          onClick={onNavigateToSearch}
          className="p-1.5 bg-black/40 hover:bg-black/60 border border-gray-800/40 hover:border-brand/40 text-gray-300 hover:text-brand rounded-lg transition-all pointer-events-auto flex items-center gap-1 font-mono text-[9px] uppercase font-bold"
          id="social-feed-top-search-btn"
        >
          <Search className="w-3 h-3" />
          <span>Search</span>
        </button>
      </div>

      {/* Swipe Snapping vertical container */}
      <div className="flex-1 w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none" id="swipe-snap-feed-container">
        {sortedIssues.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#0A0A0A] gap-3">
            <div className="p-4 bg-brand/10 rounded-full border border-brand/20">
              <Sparkles className="w-8 h-8 text-brand animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-mono">No bulletins or neighborhood drama spilled yet.</p>
              <p className="text-[9px] text-gray-600 font-mono mt-1 uppercase">TAP THE '+' TAB AT THE BOTTOM TO POST ONE!</p>
            </div>
          </div>
        ) : (
          sortedIssues.map((issue) => {
            const catConfig = CATEGORY_MAP[issue.category] || CATEGORY_MAP["Other"];
            const userReaction = issue.userReactions?.[currentUserId];
            const hasPhoto = !!issue.photoUrl;

            return (
              <div
                key={issue.id}
                onClick={() => setSelectedDetailPost(issue)}
                className="w-full h-full snap-start snap-always relative overflow-hidden flex flex-col justify-end bg-black cursor-pointer group"
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
                  <div className={`absolute inset-0 bg-gradient-to-b ${catConfig.gradient} flex flex-col items-center justify-center p-8 select-none`}>
                    {/* Centered category emoji as clean background accent with high-end scale effect */}
                    <div className="text-[120px] font-black opacity-15 transform group-hover:scale-110 transition-transform duration-1000 ease-out">
                      {catConfig.emoji}
                    </div>
                  </div>
                )}

                {/* 2. Overlaid Bottom Content (Details & Description Teaser) */}
                <div className="absolute bottom-6 left-4 right-20 z-10 flex flex-col gap-1.5 pointer-events-auto text-left max-h-[25%] justify-end">
                  {/* Category and Location Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border bg-black/60 ${catConfig.bg} ${catConfig.text} backdrop-blur-sm`}>
                      <span>{catConfig.emoji}</span> {catConfig.label}
                    </span>
                    <span className="text-[8px] font-mono text-gray-300 uppercase tracking-wider flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full border border-gray-800/40 backdrop-blur-sm">
                      📍 {issue.area}
                    </span>
                    <span className="text-[8px] text-gray-400 font-mono bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {timeAgo(issue.createdAt)}
                    </span>
                  </div>

                  {/* Main Headline (compact, maximum 2 lines) */}
                  <h2 className="text-sm md:text-base font-black text-white leading-tight uppercase tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] line-clamp-2">
                    {issue.title}
                  </h2>

                  {/* Reporter & Verification info */}
                  <div className="flex items-center gap-1.5 flex-wrap text-gray-300">
                    <span className="text-[10px]">👤</span>
                    <span className="text-[10px] font-bold text-white tracking-tight drop-shadow-sm">
                      {issue.isAnonymous ? "Anonymous Citizen" : issue.reporterName}
                    </span>
                    <span className="px-1 py-0.2 bg-brand/15 border border-brand/35 text-brand font-mono rounded text-[8px] font-black tracking-tight uppercase">
                      🛡️ {issue.reporterTrustScore} TS
                    </span>
                    {issue.isSpam && (
                      <span className="flex items-center gap-1 px-1.5 py-0.2 bg-red-950/80 border border-red-500/40 rounded text-red-400 text-[8px] font-mono uppercase font-black">
                        ⚠️ SPAM
                      </span>
                    )}
                  </div>

                  {/* Gentle interaction instruction */}
                  <div className="text-[8px] font-mono text-brand/80 uppercase tracking-widest flex items-center gap-1 animate-pulse drop-shadow-sm">
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
                        ? "bg-[#39FF14] border-[#39FF14] text-[#0A0A0A] shadow-[0_0_12px_rgba(57,255,20,0.55)]"
                        : "bg-black/60 border-gray-800 text-white hover:border-brand/40"
                    }`}>
                      <span className="text-base">👁️</span>
                    </div>
                    <span className="text-[9px] font-mono font-black text-white drop-shadow">
                      {issue.seeThisTooCount || 0}
                    </span>
                    <span className="text-[7px] font-mono font-extrabold text-gray-400 uppercase tracking-tighter leading-none text-center">
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
                        ? "bg-green-600 border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        : "bg-black/60 border-gray-800 text-white hover:border-brand/40"
                    }`}>
                      <span className="text-base">✅</span>
                    </div>
                    <span className="text-[9px] font-mono font-black text-white drop-shadow">
                      {issue.reactions.verified || 0}
                    </span>
                    <span className="text-[7px] font-mono font-extrabold text-gray-400 uppercase tracking-tighter leading-none text-center">
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
                        ? "bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        : "bg-black/60 border-gray-800 text-white hover:border-brand/40"
                    }`}>
                      <span className="text-base">🧢</span>
                    </div>
                    <span className="text-[9px] font-mono font-black text-white drop-shadow">
                      {issue.reactions.cap || 0}
                    </span>
                    <span className="text-[7px] font-mono font-extrabold text-gray-400 uppercase tracking-tighter leading-none text-center">
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
                        ? "bg-brand border-brand text-[#0A0A0A] shadow-[0_0_10px_rgba(57,255,20,0.5)]"
                        : "bg-black/60 border-gray-800 text-white hover:border-brand/40"
                    }`}>
                      <span className="text-base">🔥</span>
                    </div>
                    <span className="text-[9px] font-mono font-black text-white drop-shadow">
                      {issue.reactions.big_issue || 0}
                    </span>
                    <span className="text-[7px] font-mono font-extrabold text-gray-400 uppercase tracking-tighter leading-none text-center">
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
                        ? "bg-teal-600 border-teal-500 text-white shadow-[0_0_10px_rgba(13,148,136,0.5)]"
                        : "bg-black/60 border-gray-800 text-white hover:border-brand/40"
                    }`}>
                      <span className="text-base">💀</span>
                    </div>
                    <span className="text-[9px] font-mono font-black text-white drop-shadow">
                      {issue.reactions.bruh || 0}
                    </span>
                    <span className="text-[7px] font-mono font-extrabold text-gray-400 uppercase tracking-tighter leading-none text-center">
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
              className="absolute inset-x-0 bottom-0 max-h-[80%] bg-[#0A0A0A] border-t border-gray-800 rounded-t-2xl z-40 px-5 py-6 flex flex-col gap-4 overflow-y-auto pointer-events-auto shadow-2xl text-left"
              id="details-bottom-sheet"
            >
              {/* Top drag handle indicator */}
              <div className="w-12 h-1 bg-gray-800 rounded-full mx-auto mb-1 shrink-0" />

              {/* Header inside Bottom Sheet */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border bg-black/40 ${CATEGORY_MAP[selectedDetailPost.category]?.bg || ""} ${CATEGORY_MAP[selectedDetailPost.category]?.text || ""}`}>
                    {CATEGORY_MAP[selectedDetailPost.category]?.emoji} {selectedDetailPost.category}
                  </span>
                  <h2 className="text-base font-black text-white uppercase mt-2 tracking-tight">
                    {selectedDetailPost.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedDetailPost(null)}
                  className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg text-[10px] font-mono font-black uppercase transition-all shrink-0"
                >
                  CLOSE
                </button>
              </div>

              {/* Local Info panel */}
              <div className="p-3 bg-black/40 border border-gray-900 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-mono uppercase">📍 Area Sector:</span>
                  <span className="text-brand font-bold uppercase font-mono">{selectedDetailPost.area}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-mono uppercase">⏰ Reported Time:</span>
                  <span className="text-gray-300 font-mono">{new Date(selectedDetailPost.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-mono uppercase">👤 Reporter Name:</span>
                  <span className="text-white font-bold">
                    {selectedDetailPost.isAnonymous ? "Anonymous Citizen" : selectedDetailPost.reporterName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-mono uppercase">🛡️ Trust Score:</span>
                  <span className="text-brand font-black">{selectedDetailPost.reporterTrustScore} / 100</span>
                </div>
                {selectedDetailPost.status && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500 font-mono uppercase">🚀 Verification State:</span>
                    <span className="px-2 py-0.5 rounded bg-brand/10 border border-brand/20 text-brand text-[9px] font-black uppercase tracking-wider">
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
                <p className="text-xs text-gray-300 leading-relaxed font-sans bg-black/20 p-3.5 rounded-xl border border-gray-900 whitespace-pre-wrap">
                  {selectedDetailPost.description}
                </p>
              </div>

              {/* AI Insight Description (if any) */}
              {selectedDetailPost.aiDescription && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-black text-brand uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-brand" /> AI Analysis Insight
                  </span>
                  <p className="text-xs text-gray-400 bg-brand/5 p-3 rounded-xl border border-brand/10 italic leading-relaxed">
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
                  className="flex-1 py-3 bg-brand text-[#0A0A0A] rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
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
