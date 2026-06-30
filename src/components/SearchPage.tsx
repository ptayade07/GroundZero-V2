/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Issue, Category, ReactionType } from "../types";
import {
  Search,
  MapPin,
  Eye,
  Check,
  TrendingUp,
  Sparkles,
  ChevronRight,
  RefreshCw,
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
  HelpCircle,
  User,
  AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";

interface SearchPageProps {
  issues: Issue[];
  currentUserId: string;
  onSelectIssue: (issue: Issue) => void;
  theme?: "light" | "dark";
}

const CATEGORY_MAP: Record<Category, { label: string; icon: React.ComponentType<any>; bg: string; text: string; border: string }> = {
  "Civic Issue": { label: "Civic Issue", icon: Building, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Pothole": { label: "Pothole", icon: Construction, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Flooding": { label: "Flooding", icon: Waves, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Power Cut": { label: "Power Cut", icon: Zap, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Garbage": { label: "Garbage", icon: Trash2, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Corruption": { label: "Corruption", icon: Scale, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Government Failure": { label: "Govt Failure", icon: Landmark, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Protest / Rally": { label: "Protest / Rally", icon: Megaphone, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Local Drama": { label: "Local Drama", icon: MessageCircle, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Argument / Dispute": { label: "Argument", icon: MessageSquare, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Harassment": { label: "Harassment", icon: ShieldAlert, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Breaking News": { label: "Breaking News", icon: Newspaper, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Village Problem": { label: "Village Prob", icon: Home, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Weather": { label: "Weather", icon: Cloud, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "War / Conflict": { label: "Conflict", icon: Flame, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" },
  "Other": { label: "Other", icon: HelpCircle, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20" }
};

const CATEGORY_IMAGES: Record<Category | string, string> = {
  "Civic Issue": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
  "Pothole": "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80",
  "Flooding": "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80",
  "Power Cut": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80",
  "Garbage": "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80",
  "Corruption": "https://images.unsplash.com/photo-1521791136368-1a46827d52bc?w=600&auto=format&fit=crop&q=80",
  "Government Failure": "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
  "Protest / Rally": "https://images.unsplash.com/photo-1551817855-5cbf86eb792b?w=600&auto=format&fit=crop&q=80",
  "Local Drama": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
  "Argument / Dispute": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
  "Harassment": "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&auto=format&fit=crop&q=80",
  "Breaking News": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80",
  "Village Problem": "https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=600&auto=format&fit=crop&q=80",
  "Weather": "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80",
  "War / Conflict": "https://images.unsplash.com/photo-1508138221679-760a23a2285b?w=600&auto=format&fit=crop&q=80",
  "Other": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80"
};

const TRENDING_CATEGORIES: Category[] = [
  "Corruption",
  "Government Failure",
  "Protest / Rally",
  "Local Drama",
  "Argument / Dispute",
  "Breaking News",
  "Pothole",
  "Flooding"
];

export default function SearchPage({ issues, currentUserId, onSelectIssue, theme = "dark" }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Helper to get image for an issue (prioritize uploaded photos/videos, fallback to high-quality Unsplash category illustration)
  const getIssueImage = (issue: Issue): string => {
    if (issue.photoUrl) return issue.photoUrl;
    if (issue.mediaUrls && issue.mediaUrls.length > 0) return issue.mediaUrls[0];
    return CATEGORY_IMAGES[issue.category] || CATEGORY_IMAGES["Other"];
  };

  // Trending / top posts algorithm based on engagement (vouches + seeThisTooCount)
  const trendingPosts = useMemo(() => {
    return [...issues]
      .sort((a, b) => {
        const scoreA = (a.reactions?.verified || 0) + (a.seeThisTooCount || 0) * 3;
        const scoreB = (b.reactions?.verified || 0) + (b.seeThisTooCount || 0) * 3;
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [issues]);

  // Real-time filtered issues based on user search query and selected category pill
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Filter by category pill if active
      if (activeCategory && issue.category !== activeCategory) {
        return false;
      }

      // Filter by query matching title, location (area), category, or reporter
      if (query.trim() !== "") {
        const q = query.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(q);
        const matchesArea = issue.area.toLowerCase().includes(q);
        const matchesCategory = issue.category.toLowerCase().includes(q);
        const matchesReporter = issue.reporterName.toLowerCase().includes(q);
        const matchesDescription = issue.description.toLowerCase().includes(q);

        return matchesTitle || matchesArea || matchesCategory || matchesReporter || matchesDescription;
      }

      return true;
    });
  }, [issues, query, activeCategory]);

  const handleCategoryPillClick = (cat: Category) => {
    if (activeCategory === cat) {
      setActiveCategory(null); // Deselect if clicked again
    } else {
      setActiveCategory(cat);
    }
  };

  const activeGreen = theme === "dark" ? "#39FF14" : "#2ECC0F";

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-5 pb-16" id="search-page-container">
      {/* Title Header */}
      <div className="flex items-center gap-2 mt-2">
        <div className="p-2 border border-transparent bg-transparent shadow-none">
          <Search className="w-6 h-6 text-brand" />
        </div>
        <div>
          <h1 className={`text-2xl font-black uppercase tracking-tight leading-none ${
            theme === 'dark' ? 'text-white' : 'text-neutral-900'
          }`}>Explore Grid</h1>
          <p className={`text-[10px] font-mono uppercase ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
          }`}>DISCOVER TRENDING CIVIC ACTIONS & REPORTINGS</p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reports, locations, reporters..."
          className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-mono tracking-tight outline-none transition-all border backdrop-blur-[20px] ${
            theme === 'dark'
              ? 'bg-white/[0.05] border-white/10 text-white placeholder-gray-500 focus:border-white/20 focus:bg-white/[0.08]'
              : 'bg-white/60 border-neutral-200/50 text-neutral-900 placeholder-gray-400 focus:border-neutral-400'
          }`}
          id="search-input-field"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold ${
              theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'
            }`}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Trending Category Pills */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-brand" />
          Trending Sectors
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border transition-all ${
              !activeCategory
                ? theme === 'dark'
                  ? 'bg-[#39FF14] border-[#39FF14] text-black animate-pulse'
                  : 'bg-[#2ECC0F] border-[#2ECC0F] text-white shadow-xs'
                : theme === 'dark'
                  ? 'bg-black border-neutral-900 text-gray-400 hover:text-white hover:border-neutral-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-neutral-900 hover:border-gray-400'
            }`}
          >
            All Sectors
          </button>
          {TRENDING_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const style = CATEGORY_MAP[cat];
            return (
              <button
                key={cat}
                onClick={() => handleCategoryPillClick(cat)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border transition-all flex items-center gap-1 ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-[#39FF14] border-[#39FF14] text-black'
                      : 'bg-[#2ECC0F] border-[#2ECC0F] text-white shadow-xs'
                    : `${style.bg} ${style.border} ${style.text} hover:opacity-80`
                }`}
              >
                {React.createElement(style.icon, { className: "w-3 h-3 shrink-0" })}
                <span>{style.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* If no search query and no category filter, show 'Trending Near You' Section */}
      {!query && !activeCategory && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-brand" />
              Trending Near You
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {trendingPosts.map((issue) => {
              const catInfo = CATEGORY_MAP[issue.category] || CATEGORY_MAP["Other"];
              return (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-5 backdrop-blur-[20px] group ${
                    theme === 'dark' 
                      ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 text-white shadow-md' 
                      : 'bg-white/40 border-neutral-200/40 hover:bg-white/60 hover:border-neutral-300 text-neutral-900 shadow-xs'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-neutral-800/20">
                    <img
                      src={getIssueImage(issue)}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[8px] font-bold uppercase ${catInfo.bg} ${catInfo.text} ${catInfo.border} border`}>
                        {React.createElement(catInfo.icon, { className: "w-2.5 h-2.5 shrink-0" })}
                        <span>{catInfo.label}</span>
                      </span>
                      <span className="text-[8px] text-gray-500 font-mono uppercase flex items-center gap-0.5">
                        <MapPin className="w-2 h-2 text-brand" />
                        {issue.area}
                      </span>
                    </div>
                    <h3 className={`text-xs font-bold mt-1 line-clamp-1 group-hover:text-brand transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-neutral-900'
                    }`}>
                      {issue.title}
                    </h3>
                    <p className={`text-[10px] line-clamp-1 mt-0.5 leading-snug ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-2 text-[8px] font-mono text-gray-500 mt-1.5">
                      <span className="flex items-center gap-0.5"><User className="w-2.5 h-2.5 text-gray-400" /> {issue.isAnonymous ? "Anonymous" : issue.reporterName}</span>
                      <span>•</span>
                      <span className="text-brand flex items-center gap-0.5"><Check className="w-2.5 h-2.5 text-emerald-500" /> {issue.reactions?.verified || 0} Vouches</span>
                      {issue.seeThisTooCount ? (
                        <>
                          <span>•</span>
                          <span className="text-pink-400 flex items-center gap-0.5">
                            <Eye className="w-2 h-2" /> {issue.seeThisTooCount} see this
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white self-center transition-colors" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Explore Photo Grid (2 Columns Instagram Layout) */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">
          {query || activeCategory ? `Filtered Action Grid (${filteredIssues.length})` : "✨ Explore Grid"}
        </span>

        {filteredIssues.length === 0 ? (
          <div className={`text-center py-12 border rounded-2xl flex flex-col items-center gap-2 ${
            theme === 'dark' ? 'bg-black border-neutral-900' : 'bg-white border-gray-200 shadow-xs'
          }`}>
            <Search className="w-6 h-6 text-gray-700 animate-pulse" />
            <p className="text-xs text-gray-500 font-mono italic">No matches found. Try widening your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2" id="search-explore-grid">
            {filteredIssues.map((issue, idx) => {
              const catInfo = CATEGORY_MAP[issue.category] || CATEGORY_MAP["Other"];
              const imageSrc = getIssueImage(issue);
              return (
                <motion.div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className={`aspect-square relative rounded-xl overflow-hidden border group cursor-pointer ${
                    theme === 'dark' ? 'border-neutral-900 bg-black' : 'border-gray-200 bg-white shadow-xs'
                  }`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                >
                  <img
                    src={imageSrc}
                    alt={issue.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  {/* Glassmorphic/translucent overlay at the bottom always visible */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2.5 flex flex-col justify-end transition-opacity duration-300">
                    <span className="text-[8px] font-mono font-black text-brand uppercase tracking-wider mb-0.5 flex items-center gap-1 truncate">
                      {React.createElement(catInfo.icon, { className: "w-2.5 h-2.5 text-brand shrink-0" })}
                      <span>{issue.category}</span>
                    </span>
                    <h4 className="text-[10px] font-black text-white leading-tight line-clamp-1">
                      {issue.title}
                    </h4>
                    <span className="text-[8px] text-gray-400 font-mono block mt-0.5 truncate">
                      📍 {issue.area}
                    </span>
                  </div>

                  {/* Instagram-style Hover Overlay (shows engagement: vouches, seeThisToo count) */}
                  <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider mb-2 border ${catInfo.bg} ${catInfo.text} ${catInfo.border}`}>
                      {React.createElement(catInfo.icon, { className: "w-2.5 h-2.5 shrink-0" })}
                      <span>{catInfo.label}</span>
                    </span>
                    <p className="text-[11px] font-extrabold text-white line-clamp-2 leading-snug px-1 mb-3">
                      "{issue.title}"
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-brand font-black flex items-center gap-1 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-brand shrink-0" /> {issue.reactions?.verified || 0}
                      </span>
                      {issue.seeThisTooCount ? (
                        <span className="text-pink-400 font-black flex items-center gap-1 text-[11px]">
                          <Eye className="w-3.5 h-3.5" /> {issue.seeThisTooCount} <span className="text-[9px] font-mono text-gray-400 font-normal">see too</span>
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[8px] text-gray-500 font-mono mt-3 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                      TAP TO VIEW
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
