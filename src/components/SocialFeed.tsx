/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Logo from "./Logo";
import { Issue, Category, ReactionType } from "../types";
import {
  Search,
  MapPin,
  Sparkles,
  Eye,
  ShieldCheck,
  HelpCircle,
  X,
  Sun,
  Moon,
  Building,
  Construction,
  Waves,
  Zap,
  Trash2,
  Scale,
  Landmark,
  Megaphone,
  MessageCircle,
  MessageSquare,
  ShieldAlert,
  Newspaper,
  Home,
  Cloud,
  Flame,
  User,
  AlertTriangle,
  Check,
  Flag,
  Heart,
  Share2,
  Send
} from "lucide-react";
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
  onRefreshIssues?: () => void;
  onTriggerToast?: (msg: string) => void;
}

const CATEGORY_MAP: Record<Category, { label: string; icon: React.ComponentType<any>; bg: string; text: string; gradient: string }> = {
  "Civic Issue": { label: "Civic Issue", icon: Building, bg: "bg-indigo-500/20 border-indigo-500/30", text: "text-indigo-400", gradient: "from-[#1e1b4b] via-[#0f0a21] to-[#030008]" },
  "Pothole": { label: "Pothole", icon: Construction, bg: "bg-orange-500/20 border-orange-500/30", text: "text-orange-400", gradient: "from-[#431407] via-[#1c0802] to-[#050000]" },
  "Flooding": { label: "Flooding", icon: Waves, bg: "bg-blue-500/20 border-blue-500/30", text: "text-blue-400", gradient: "from-[#172554] via-[#0c1435] to-[#01020d]" },
  "Power Cut": { label: "Power Cut", icon: Zap, bg: "bg-yellow-500/20 border-yellow-500/30", text: "text-yellow-400", gradient: "from-[#422006] via-[#1c0d02] to-[#040100]" },
  "Garbage": { label: "Garbage", icon: Trash2, bg: "bg-amber-700/20 border-amber-700/30", text: "text-amber-500", gradient: "from-[#3b2207] via-[#1a0e03] to-[#030100]" },
  "Corruption": { label: "Corruption", icon: Scale, bg: "bg-red-500/20 border-red-500/30", text: "text-red-400", gradient: "from-[#450a0a] via-[#1f0303] to-[#050000]" },
  "Government Failure": { label: "Govt Failure", icon: Landmark, bg: "bg-red-700/20 border-red-700/30", text: "text-red-500", gradient: "from-[#5c0a0a] via-[#240404] to-[#050000]" },
  "Protest / Rally": { label: "Protest / Rally", icon: Megaphone, bg: "bg-pink-500/20 border-pink-500/30", text: "text-pink-400", gradient: "from-[#4c0519] via-[#20020a] to-[#050001]" },
  "Local Drama": { label: "Local Drama", icon: MessageCircle, bg: "bg-teal-500/20 border-teal-500/30", text: "text-teal-400", gradient: "from-[#042f2e] via-[#021414] to-[#000303]" },
  "Argument / Dispute": { label: "Argument", icon: MessageSquare, bg: "bg-rose-500/20 border-rose-500/30", text: "text-rose-400", gradient: "from-[#4c0519] via-[#1a050d] to-[#050001]" },
  "Harassment": { label: "Harassment", icon: ShieldAlert, bg: "bg-red-600/20 border-red-600/30", text: "text-red-500", gradient: "from-[#580505] via-[#1c0202] to-[#050000]" },
  "Breaking News": { label: "Breaking News", icon: Newspaper, bg: "bg-cyan-500/20 border-cyan-500/30", text: "text-cyan-400", gradient: "from-[#083344] via-[#03151c] to-[#000405]" },
  "Village Problem": { label: "Village Prob", icon: Home, bg: "bg-green-500/20 border-green-500/30", text: "text-green-400", gradient: "from-[#064e3b] via-[#022119] to-[#000403]" },
  "Weather": { label: "Weather", icon: Cloud, bg: "bg-sky-500/20 border-sky-500/30", text: "text-sky-400", gradient: "from-[#0c4a6e] via-[#042238] to-[#00060d]" },
  "War / Conflict": { label: "Conflict", icon: Flame, bg: "bg-gray-800/40 border-gray-700/30", text: "text-gray-400", gradient: "from-[#1c1917] via-[#0c0a09] to-black" },
  "Other": { label: "Other", icon: HelpCircle, bg: "bg-gray-700/20 border-gray-700/30", text: "text-gray-400", gradient: "from-[#18181b] via-[#09090b] to-black" }
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
  onToggleTheme,
  onRefreshIssues,
  onTriggerToast
}: SocialFeedProps) {
  const [selectedDetailPost, setSelectedDetailPost] = useState<Issue | null>(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState<Issue | null>(null);
  const [commentText, setCommentText] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

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
    <div className={`w-full h-full relative flex flex-col font-ui ${theme === 'dark' ? 'bg-black text-white' : 'bg-[#FAFCFA] text-[#171B18]'}`} id="social-feed-tiktok-view">
      
      {/* Top Bar Overlay */}
      <div className="absolute top-0 inset-x-0 z-20 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Logo theme="dark" className="w-7 h-7 rounded-[8px]" />
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-display font-black tracking-wider uppercase text-white leading-none">
                GROUND<span className={theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}>ZERO</span>
              </h1>
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] border text-[10px] font-meta font-bold tracking-wider uppercase ${
                theme === 'dark' ? 'bg-[#B7FF38]/15 border-[#B7FF38]/40 text-[#B7FF38]' : 'bg-[#537A00]/15 border-[#537A00]/40 text-[#537A00]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-ping ${theme === 'dark' ? 'bg-[#B7FF38]' : 'bg-[#537A00]'}`} />
                <span className="animate-pulse">LIVE</span>
              </span>
            </div>
            <p className="text-xs text-[#A3A3A3] font-meta leading-none uppercase mt-1 tracking-wider">
              CIVIC TEA & BUZZ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-[10px] border transition-all flex items-center justify-center cursor-pointer min-h-[36px] min-w-[36px] ${
              theme === 'dark'
                ? 'bg-[#111111]/80 hover:bg-[#191919] border-[#303030] text-[#A3A3A3] hover:text-white'
                : 'bg-white/80 hover:bg-[#F1F4EF] border-[#E1E5DF] text-[#626862] hover:text-[#171B18]'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            id="social-feed-theme-toggle"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Action Button Link to Search Tab */}
          <button
            onClick={onNavigateToSearch}
            className={`py-2 px-3 border rounded-[10px] min-h-[36px] transition-all flex items-center gap-1.5 font-meta text-xs uppercase font-bold cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#111111]/80 hover:bg-[#191919] border-[#303030] text-[#A3A3A3] hover:text-[#B7FF38]'
                : 'bg-white/80 hover:bg-[#F1F4EF] border-[#E1E5DF] text-[#626862] hover:text-[#537A00]'
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
            <div className={`p-4 rounded-[14px] border ${
              theme === 'dark' ? 'bg-[#B7FF38]/10 border-[#B7FF38]/20 text-[#B7FF38]' : 'bg-[#537A00]/10 border-[#537A00]/20 text-[#537A00]'
            }`}>
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <p className={`text-sm font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No bulletins or neighborhood drama spilled yet.</p>
              <p className={`text-xs font-mono mt-1.5 uppercase font-bold tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>TAP THE '+' TAB AT THE BOTTOM TO POST ONE!</p>
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
                    {/* Centered category icon as clean background accent with high-end scale effect */}
                    <div className={`transform group-hover:scale-110 transition-transform duration-1000 ease-out ${
                      isCardLight ? 'text-neutral-900 opacity-15' : 'text-white opacity-10'
                    }`}>
                      {React.createElement(catConfig.icon, { className: "w-24 h-24" })}
                    </div>
                  </div>
                )}

                {/* 2. Overlaid Bottom Content (Details & Description Teaser) */}
                <div className="absolute bottom-6 left-4 right-20 z-10 flex flex-col gap-1.5 pointer-events-auto text-left max-h-[25%] justify-end">
                  {/* Category and Location Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold uppercase border flex items-center gap-1.5 ${
                      isCardLight 
                        ? 'bg-neutral-100 border-neutral-200 text-neutral-800 shadow-xs' 
                        : `bg-black/60 ${catConfig.bg} ${catConfig.text} backdrop-blur-sm`
                    }`}>
                      {React.createElement(catConfig.icon, { className: "w-3.5 h-3.5 shrink-0" })}
                      <span>{catConfig.label}</span>
                    </span>
                    <span className={`text-xs font-meta uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border ${
                      isCardLight 
                        ? 'bg-white/90 border-gray-200/80 text-gray-700 shadow-xs' 
                        : 'bg-black/60 border-gray-800/40 text-gray-300 backdrop-blur-sm'
                    }`}>
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span>{issue.area}</span>
                    </span>
                    <span className={`text-xs font-meta px-2 py-1 rounded-[6px] ${
                      isCardLight 
                        ? 'bg-gray-100/80 text-gray-600 border border-gray-200/50' 
                        : 'bg-black/40 text-gray-400 backdrop-blur-sm'
                    }`}>
                      {timeAgo(issue.createdAt)}
                    </span>
                  </div>

                  {/* Main Headline (compact, maximum 2 lines) */}
                  <h2 className={`text-base md:text-lg font-black leading-tight uppercase tracking-tight line-clamp-2 ${
                    isCardLight 
                      ? 'text-neutral-900' 
                      : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]'
                  }`}>
                    {issue.title}
                  </h2>

                  {/* Reporter & Verification info */}
                  <div className={`flex items-center gap-2 flex-wrap ${
                    isCardLight ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className={`text-xs font-bold tracking-tight font-ui ${
                      isCardLight ? 'text-neutral-900' : 'text-white drop-shadow-sm'
                    }`}>
                      {issue.isAnonymous ? "Anonymous Citizen" : issue.reporterName}
                    </span>
                    <span className={`px-2 py-0.5 font-meta rounded-[6px] text-xs font-bold tracking-tight uppercase border flex items-center gap-1 ${
                      isCardLight 
                        ? 'bg-[#537A00]/10 border-[#537A00]/25 text-[#537A00]' 
                        : 'bg-[#B7FF38]/15 border-[#B7FF38]/35 text-[#B7FF38]'
                    }`}>
                      <ShieldCheck className="w-3 h-3 text-[#B7FF38]" />
                      <span>{issue.reporterTrustScore} TS</span>
                    </span>
                    {issue.isSpam && (
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-xs font-meta uppercase font-bold border ${
                        isCardLight 
                          ? 'bg-red-50 border-red-200 text-red-600' 
                          : 'bg-red-950/80 border border-red-500/40 text-red-400'
                      }`}>
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span>SPAM</span>
                      </span>
                    )}
                  </div>

                  {/* Interaction instruction */}
                  <div className={`text-xs font-meta uppercase tracking-wider font-bold flex items-center gap-1.5 animate-pulse ${
                    isCardLight ? 'text-[#537A00]' : 'text-[#B7FF38] drop-shadow-sm'
                  }`}>
                    <span>TAP FOR DETAILED BREAKDOWN</span>
                  </div>
                </div>

                {/* 3. Overlaid TikTok-style vertical icon column on the right side (Heart, Eye/SeeToo, MessageCircle, Share) */}
                <div className="absolute bottom-6 right-3 z-10 flex flex-col items-center gap-2.5 pointer-events-auto">
                  
                  {/* HEART (LIKE) */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const res = await fetch(`/api/issues/${issue.id}/like`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ userId: currentUserId })
                        });
                        if (res.ok) {
                          onRefreshIssues?.();
                          onTriggerToast?.("Like reaction updated!");
                        }
                      } catch (err) {
                        console.error("Error liking issue:", err);
                      }
                    }}
                    className="flex flex-col items-center gap-0.5 group active:scale-95 transition-transform"
                    title="Like report"
                    id={`tiktok-like-${issue.id}`}
                  >
                    <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center border transition-all ${
                      issue.likedUsers?.includes(currentUserId)
                        ? "bg-red-500 border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.55)]"
                        : isCardLight
                          ? "bg-white/90 border-[#E1E5DF] text-[#171B18] hover:border-[#537A00]/50 shadow-xs"
                          : "bg-[#111111]/80 border-[#303030] text-white hover:border-[#B7FF38]/50"
                    }`}>
                      <Heart className={`w-4 h-4 ${issue.likedUsers?.includes(currentUserId) ? "fill-white" : ""}`} />
                    </div>
                    <span className={`text-[11px] font-meta font-bold ${
                      isCardLight ? 'text-[#171B18]' : 'text-white drop-shadow'
                    }`}>
                      {issue.likesCount || 0}
                    </span>
                    <span className={`text-[9px] font-meta font-bold uppercase tracking-wider leading-none text-center ${
                      isCardLight ? 'text-[#626862]' : 'text-[#A3A3A3]'
                    }`}>
                      LIKE
                    </span>
                  </button>

                  {/* EYE (SEE TOO) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeeThisToo(issue.id);
                    }}
                    className="flex flex-col items-center gap-0.5 group active:scale-95 transition-transform"
                    title="I See This Too"
                    id={`tiktok-see-too-${issue.id}`}
                  >
                    <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center border transition-all ${
                      issue.seeThisTooUsers?.includes(currentUserId)
                        ? isCardLight
                          ? "bg-[#537A00] border-[#537A00] text-white shadow-md"
                          : "bg-[#B7FF38] border-[#B7FF38] text-black shadow-[0_0_12px_rgba(183,255,56,0.55)]"
                        : isCardLight
                          ? "bg-white/90 border-[#E1E5DF] text-[#171B18] hover:border-[#537A00]/50 shadow-xs"
                          : "bg-[#111111]/80 border-[#303030] text-white hover:border-[#B7FF38]/50"
                    }`}>
                      <Eye className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-meta font-bold ${
                      isCardLight ? 'text-[#171B18]' : 'text-white drop-shadow'
                    }`}>
                      {issue.seeThisTooCount || 0}
                    </span>
                    <span className={`text-[9px] font-meta font-bold uppercase tracking-wider leading-none text-center ${
                      isCardLight ? 'text-[#626862]' : 'text-[#A3A3A3]'
                    }`}>
                      SEE TOO
                    </span>
                  </button>

                  {/* COMMENT */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCommentsPost(issue);
                    }}
                    className="flex flex-col items-center gap-0.5 group active:scale-95 transition-transform"
                    title="View Comments"
                    id={`tiktok-comment-${issue.id}`}
                  >
                    <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center border transition-all ${
                      activeCommentsPost?.id === issue.id
                        ? isCardLight
                          ? "bg-blue-600 border-blue-600 text-white shadow-md"
                          : "bg-blue-600 border-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.55)]"
                        : isCardLight
                          ? "bg-white/90 border-[#E1E5DF] text-[#171B18] hover:border-[#537A00]/50 shadow-xs"
                          : "bg-[#111111]/80 border-[#303030] text-white hover:border-[#B7FF38]/50"
                    }`}>
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-meta font-bold ${
                      isCardLight ? 'text-[#171B18]' : 'text-white drop-shadow'
                    }`}>
                      {issue.comments?.length || 0}
                    </span>
                    <span className={`text-[9px] font-meta font-bold uppercase tracking-wider leading-none text-center ${
                      isCardLight ? 'text-[#626862]' : 'text-[#A3A3A3]'
                    }`}>
                      TALK
                    </span>
                  </button>

                  {/* SHARE */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const reportUrl = `${window.location.origin}/#report-${issue.id}`;
                      navigator.clipboard.writeText(reportUrl);
                      onTriggerToast?.("Report share link copied to clipboard!");
                    }}
                    className="flex flex-col items-center gap-0.5 group active:scale-95 transition-transform"
                    title="Share report"
                    id={`tiktok-share-${issue.id}`}
                  >
                    <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center border transition-all ${
                      isCardLight
                        ? "bg-white/90 border-[#E1E5DF] text-[#171B18] hover:border-[#537A00]/50 shadow-xs"
                        : "bg-[#111111]/80 border-[#303030] text-white hover:border-[#B7FF38]/50"
                    }`}>
                      <Share2 className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-meta font-bold ${
                      isCardLight ? 'text-[#171B18]' : 'text-white drop-shadow'
                    }`}>
                      SHARE
                    </span>
                    <span className={`text-[9px] font-meta font-bold uppercase tracking-wider leading-none text-center ${
                      isCardLight ? 'text-[#626862]' : 'text-[#A3A3A3]'
                    }`}>
                      SHARE
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
              className={`absolute inset-x-0 bottom-0 max-h-[80%] border-t rounded-t-[14px] z-40 px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-3.5 overflow-y-auto pointer-events-auto shadow-2xl text-left font-ui ${
                theme === 'dark' ? 'bg-[#111111] border-[#303030] text-white' : 'bg-white border-[#E1E5DF] text-[#171B18]'
              }`}
              id="details-bottom-sheet"
            >
              {/* Top drag handle indicator */}
              <div className={`w-10 h-1 rounded-full mx-auto mb-0.5 shrink-0 ${theme === 'dark' ? 'bg-[#303030]' : 'bg-[#E1E5DF]'}`} />

              {/* Header inside Bottom Sheet */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-meta font-bold uppercase border bg-black/40 ${CATEGORY_MAP[selectedDetailPost.category]?.bg || ""} ${CATEGORY_MAP[selectedDetailPost.category]?.text || ""}`}>
                    {selectedDetailPost.category}
                  </span>
                  <h2 className={`text-base sm:text-lg font-display font-black uppercase mt-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#171B18]'}`}>
                    {selectedDetailPost.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedDetailPost(null)}
                  className={`p-2 rounded-[10px] border transition-all shrink-0 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                    theme === 'dark' ? 'bg-[#191919] border-[#303030] text-[#A3A3A3] hover:text-white' : 'bg-[#F1F4EF] border-[#E1E5DF] text-[#626862] hover:text-[#171B18]'
                  }`}
                  id="close-bottom-sheet-btn"
                  title="Close Detail Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Local Info panel */}
              <div className={`p-3.5 border rounded-[10px] space-y-2.5 text-xs font-ui ${theme === 'dark' ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF]'}`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#A3A3A3] font-meta uppercase">Area Sector:</span>
                  <span className={`font-bold uppercase font-meta ${theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}`}>{selectedDetailPost.area}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#A3A3A3] font-meta uppercase">Reported Time:</span>
                  <span className={`font-meta ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{new Date(selectedDetailPost.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#A3A3A3] font-meta uppercase">Reporter Name:</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-[#171B18]'}`}>
                    {selectedDetailPost.isAnonymous ? "Anonymous Citizen" : selectedDetailPost.reporterName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#A3A3A3] font-meta uppercase">Trust Score:</span>
                  <span className={`font-meta font-bold ${theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}`}>{selectedDetailPost.reporterTrustScore} / 100</span>
                </div>
                {selectedDetailPost.status && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#A3A3A3] font-meta uppercase">Verification State:</span>
                    <span className={`px-2.5 py-0.5 rounded-[6px] border text-xs font-meta font-bold uppercase tracking-wider ${
                      theme === 'dark' ? 'bg-[#B7FF38]/15 border-[#B7FF38]/30 text-[#B7FF38]' : 'bg-[#537A00]/10 border-[#537A00]/30 text-[#537A00]'
                    }`}>
                      {selectedDetailPost.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <span className="text-xs font-meta font-bold text-[#A3A3A3] uppercase tracking-wider block">
                  Detailed Complaint Description
                </span>
                <p className={`text-sm leading-relaxed p-3.5 rounded-[10px] whitespace-pre-wrap font-ui ${
                  theme === 'dark' ? 'text-gray-200 bg-[#191919] border border-[#303030]' : 'text-gray-800 bg-[#F1F4EF] border border-[#E1E5DF]'
                }`}>
                  {selectedDetailPost.description}
                </p>
              </div>

              {/* AI Insight Description (if any) */}
              {selectedDetailPost.aiDescription && (
                <div className="space-y-1.5">
                  <span className={`text-xs font-meta font-bold uppercase tracking-wider flex items-center gap-1.5 ${theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}`}>
                    <Sparkles className="w-4 h-4" /> AI Analysis Insight
                  </span>
                  <p className={`text-xs p-3.5 rounded-[10px] border italic leading-relaxed font-meta ${
                    theme === 'dark' ? 'text-gray-300 bg-[#191919] border-[#303030]' : 'text-gray-700 bg-[#F1F4EF] border-[#E1E5DF]'
                  }`}>
                    "{selectedDetailPost.aiDescription}"
                  </p>
                </div>
              )}

              {/* Action Buttons inside Bottom Sheet */}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => {
                    setSelectedDetailPost(null);
                    onSelectIssue(selectedDetailPost); // Center map and show popup
                  }}
                  className={`flex-1 min-h-[38px] py-2 rounded-[8px] text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#A6ED27] active:bg-[#94D91F] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-ui ${
                    theme === 'dark' ? 'bg-[#B7FF38] text-black' : 'bg-[#537A00] text-white'
                  }`}
                >
                  <MapPin className="w-4 h-4" /> View on Local Radar Map
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Comments Drawer / Panel Overlay */}
      <AnimatePresence>
        {activeCommentsPost && (
          <>
            {/* Backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCommentsPost(null)}
              className="absolute inset-0 bg-black/75 z-40 pointer-events-auto"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`absolute top-0 right-0 w-full sm:w-96 h-full z-50 border-l flex flex-col pointer-events-auto shadow-2xl font-ui ${
                theme === 'dark' ? 'bg-[#111111] border-[#303030] text-white' : 'bg-white border-[#E1E5DF] text-[#171B18]'
              }`}
              id="comments-drawer-panel"
            >
              {/* Header */}
              <div className={`p-3 border-b flex items-center justify-between ${
                theme === 'dark' ? 'border-[#303030] bg-[#191919]' : 'border-[#E1E5DF] bg-[#F1F4EF]'
              }`}>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-meta font-bold text-[#A3A3A3] uppercase tracking-wider">CIVIC TALK GRID</span>
                  <span className="text-sm font-display font-bold truncate max-w-[220px] uppercase">{activeCommentsPost.title}</span>
                </div>
                <button
                  onClick={() => setActiveCommentsPost(null)}
                  className={`p-2 rounded-[10px] border transition-all shrink-0 cursor-pointer ${
                    theme === 'dark' ? 'bg-[#111111] border-[#303030] text-[#A3A3A3] hover:text-white' : 'bg-white border-[#E1E5DF] text-[#626862] hover:text-[#171B18]'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments List Content */}
              <div className="flex flex-col h-full overflow-hidden">
                
                {/* 1. Comment Bar & Emoji Selector Container (Top) */}
                <div className={`p-2.5 border-b flex flex-col gap-2 ${
                  theme === 'dark' ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF]'
                }`}>
                  
                  {/* Emoji options block (Top of the comments bar) */}
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-[11px] font-meta text-[#A3A3A3] uppercase tracking-wider font-semibold">SELECT COMPLAINT VOUCH EFFECT</span>
                    <div className="flex gap-1.5 overflow-x-auto w-full pb-0.5 scrollbar-none">
                      {[
                        { code: "verified", label: "VERIFIED", icon: Check, colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/35" },
                        { code: "cap", label: "CAP", icon: Flag, colorClass: "text-red-500 bg-red-500/10 border-red-500/35" },
                        { code: "big_issue", label: "BIG ISSUE", icon: Flame, colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/35" },
                        { code: "bruh", label: "BRUH", icon: AlertTriangle, colorClass: "text-teal-500 bg-teal-500/10 border-teal-500/35" }
                      ].map((em) => {
                        const isSelected = selectedEmoji === em.code;
                        return (
                          <button
                            key={em.code}
                            type="button"
                            onClick={() => setSelectedEmoji(selectedEmoji === em.code ? null : em.code)}
                            className={`flex items-center gap-1 px-2 py-1 min-h-[28px] rounded-[8px] text-[11px] font-meta tracking-wider font-bold uppercase border transition-all cursor-pointer ${
                              isSelected
                                ? (theme === 'dark'
                                  ? "bg-[#B7FF38] text-black border-[#B7FF38] shadow-[0_0_8px_rgba(183,255,56,0.4)]"
                                  : "bg-[#537A00] text-white border-[#537A00] shadow-xs")
                                : (theme === 'dark'
                                  ? "bg-[#111111] border-[#303030] text-[#A3A3A3] hover:text-white"
                                  : "bg-white border-[#E1E5DF] text-[#626862] hover:border-[#537A00]/50 shadow-xs")
                            }`}
                          >
                            <em.icon className={`w-3 h-3 ${isSelected ? "" : em.colorClass.split(" ")[0]}`} />
                            <span>{em.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Input field and send button */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!commentText.trim()) return;

                      try {
                        const res = await fetch(`/api/issues/${activeCommentsPost.id}/comments`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            userId: currentUserId,
                            userName: "Citizen Reporter",
                            text: commentText.trim(),
                            emoji: selectedEmoji || undefined
                          })
                        });

                        if (res.ok) {
                          const data = await res.json();
                          // Update comments state locally and refresh parent
                          activeCommentsPost.comments = data.issue.comments;
                          activeCommentsPost.reactions = data.issue.reactions;
                          setCommentText("");
                          setSelectedEmoji(null);
                          onRefreshIssues?.();
                          onTriggerToast?.("Comment broadcasted into operations grid!");
                        }
                      } catch (err) {
                        console.error("Error submitting comment:", err);
                      }
                    }}
                    className="relative flex items-center"
                  >
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Contribute information / spill details..."
                      className={`w-full pl-3 pr-9 py-1.5 min-h-[36px] text-xs border rounded-[8px] outline-none focus:outline-none transition-all font-ui ${
                        theme === 'dark'
                          ? 'bg-[#111111] border-[#303030] text-white placeholder-gray-500 focus:border-[#B7FF38]/50'
                          : 'bg-white border-[#E1E5DF] text-[#171B18] placeholder-gray-400 focus:border-[#537A00]/50 shadow-xs'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className={`absolute right-1 p-1.5 rounded-[6px] transition-all cursor-pointer ${
                        commentText.trim()
                          ? (theme === 'dark' ? 'text-[#B7FF38] hover:bg-[#191919]' : 'text-[#537A00] hover:bg-[#F1F4EF]')
                          : 'text-[#A3A3A3] opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* 2. Comments List Scrollable Container (Below) */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 scrollbar-none text-left">
                  {!activeCommentsPost.comments || activeCommentsPost.comments.length === 0 ? (
                    <div className="text-center py-10 text-[#A3A3A3] flex flex-col items-center gap-1.5 font-meta">
                      <MessageSquare className="w-7 h-7 text-[#A3A3A3]/60 mb-1" />
                      <p className="text-xs uppercase font-bold tracking-wider">GRID SILENCE</p>
                      <p className="text-xs text-[#A3A3A3]/80">No verified testimonials broadcasted yet.</p>
                    </div>
                  ) : (
                    [...activeCommentsPost.comments]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((comm) => {
                        return (
                          <div
                            key={comm.id}
                            className={`p-3 border rounded-[10px] flex flex-col gap-1.5 ${
                              theme === 'dark' ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF] shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-[8px] flex items-center justify-center text-xs font-black uppercase font-meta ${
                                  theme === 'dark' ? 'bg-[#111111] text-white border border-[#303030]' : 'bg-white text-[#171B18] border border-[#E1E5DF]'
                                }`}>
                                  {comm.userName ? comm.userName[0] : "C"}
                                </div>
                                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-[#171B18]'}`}>
                                  {comm.userName || "Anonymous Citizen"}
                                </span>
                              </div>
                              <span className="text-xs text-[#A3A3A3] font-meta">
                                {timeAgo(comm.createdAt)}
                              </span>
                            </div>

                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed break-words font-ui`}>
                              {comm.text}
                            </p>

                            {comm.emoji && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className={`text-xs px-2 py-0.5 rounded-[8px] font-meta font-bold border uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                                  comm.emoji === "verified" || comm.emoji === "✅"
                                    ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                                    : comm.emoji === "cap" || comm.emoji === "🧢"
                                    ? "text-red-500 border-red-500/30 bg-red-500/10"
                                    : comm.emoji === "big_issue" || comm.emoji === "🔥"
                                    ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
                                    : "text-teal-500 border-teal-500/30 bg-teal-500/10"
                                }`}>
                                  {comm.emoji === "verified" || comm.emoji === "✅" ? <Check className="w-3 h-3" /> :
                                   comm.emoji === "cap" || comm.emoji === "🧢" ? <Flag className="w-3 h-3" /> :
                                   comm.emoji === "big_issue" || comm.emoji === "🔥" ? <Flame className="w-3 h-3" /> :
                                   <AlertTriangle className="w-3 h-3" />}
                                  <span>{comm.emoji.toUpperCase()}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
