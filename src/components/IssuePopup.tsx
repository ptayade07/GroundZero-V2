/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Issue, Status, Category, ReactionType } from "../types";
import {
  X,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  CheckCircle,
  ShieldAlert,
  AlertTriangle,
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
  Newspaper,
  Home,
  Cloud,
  Flame,
  HelpCircle,
  Eye,
  Camera,
  Video,
  Check,
  Flag
} from "lucide-react";
import { motion } from "motion/react";

interface IssuePopupProps {
  issue: Issue;
  allIssues?: Issue[];
  currentUserId: string;
  onClose: () => void;
  onReact: (issueId: string, reaction: ReactionType) => void;
  onAddPerspective?: (parentIssueId: string) => void;
  onSelectPerspective?: (issue: Issue) => void;
  onSeeThisToo?: (issueId: string) => void;
  theme?: "light" | "dark";
}

const CATEGORY_STYLES: Record<Category, { label: string; icon: React.ComponentType<any>; bg: string; text: string; border: string }> = {
  "Civic Issue": { label: "Civic Issue", icon: Building, bg: "bg-indigo-950/50", text: "text-indigo-400", border: "border-indigo-500/30" },
  "Pothole": { label: "Pothole Crater", icon: Construction, bg: "bg-orange-950/50", text: "text-orange-400", border: "border-orange-500/30" },
  "Flooding": { label: "Flooding", icon: Waves, bg: "bg-blue-950/50", text: "text-blue-400", border: "border-blue-500/30" },
  "Power Cut": { label: "Power Blackout", icon: Zap, bg: "bg-yellow-950/50", text: "text-yellow-400", border: "border-yellow-500/30" },
  "Garbage": { label: "Garbage Pile", icon: Trash2, bg: "bg-amber-950/50", text: "text-amber-500", border: "border-amber-700/30" },
  "Corruption": { label: "Corruption", icon: Scale, bg: "bg-red-950/50", text: "text-red-400", border: "border-red-500/30" },
  "Government Failure": { label: "Government Failure", icon: Landmark, bg: "bg-red-950/60", text: "text-red-500", border: "border-red-700/30" },
  "Protest / Rally": { label: "Protest / Rally", icon: Megaphone, bg: "bg-pink-950/50", text: "text-pink-400", border: "border-pink-500/30" },
  "Local Drama": { label: "Local Drama", icon: MessageCircle, bg: "bg-teal-950/50", text: "text-teal-400", border: "border-teal-500/30" },
  "Argument / Dispute": { label: "Argument / Dispute", icon: MessageSquare, bg: "bg-rose-950/50", text: "text-rose-400", border: "border-rose-500/30" },
  "Harassment": { label: "Harassment", icon: ShieldAlert, bg: "bg-red-950/50", text: "text-red-500", border: "border-red-600/30" },
  "Breaking News": { label: "Breaking News", icon: Newspaper, bg: "bg-cyan-950/50", text: "text-cyan-400", border: "border-cyan-500/30" },
  "Village Problem": { label: "Village Problem", icon: Home, bg: "bg-green-950/50", text: "text-green-400", border: "border-green-500/30" },
  "Weather": { label: "Weather Conditions", icon: Cloud, bg: "bg-sky-950/50", text: "text-sky-400", border: "border-sky-500/30" },
  "War / Conflict": { label: "War / Conflict", icon: Flame, bg: "bg-gray-950/80", text: "text-gray-300", border: "border-gray-700/30" },
  "Other": { label: "Other", icon: HelpCircle, bg: "bg-gray-900/50", text: "text-gray-400", border: "border-gray-500/30" }
};

const STATUS_DETAILS: Record<Status, { label: string; colorClass: string; icon: any; desc: string }> = {
  Reported: { label: "Reported", colorClass: "bg-blue-500/20 text-blue-400 border-blue-500/40", icon: AlertCircle, desc: "Broadcast logged. Pending community validation checks." },
  Verified: { label: "Verified", colorClass: "bg-green-500/20 text-green-400 border-green-500/40", icon: CheckCircle, desc: "Community consensus confirms this is real. No Cap!" },
  Escalated: { label: "Escalated", colorClass: "bg-red-500/20 text-red-400 border-red-500/40", icon: ShieldAlert, desc: "Sent to Ward Representatives for official civic intervention." },
  Resolved: { label: "Resolved", colorClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", icon: ShieldCheck, desc: "Civic issue successfully resolved. immaculate vibes restored!" }
};

export default function IssuePopup({
  issue,
  allIssues = [],
  currentUserId,
  onClose,
  onReact,
  onAddPerspective,
  onSelectPerspective,
  onSeeThisToo,
  theme = "dark"
}: IssuePopupProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const parentId = issue.parentIssueId || issue.id;
  // Sibling perspectives include the parent and any children who link to this parent
  const siblingPerspectives = allIssues.filter(
    i => i.id === parentId || i.parentIssueId === parentId
  );
  const reporterCount = siblingPerspectives.length || 1;

  // Create aggregated list of all media items across all perspectives of this incident
  interface CarouselMedia {
    url: string;
    type: 'photo' | 'video';
    addedBy: string;
  }

  const allMedia: CarouselMedia[] = [];

  // Add current issue media first
  const currentMediaUrls = issue.mediaUrls || (issue.photoUrl ? [issue.photoUrl] : []);
  currentMediaUrls.forEach((url) => {
    allMedia.push({
      url,
      type: issue.mediaType || 'photo',
      addedBy: issue.isAnonymous 
        ? (issue.reporterName.startsWith("Anonymous Citizen") && issue.reporterName.includes("#") 
            ? issue.reporterName 
            : `Anonymous Citizen #` + (Math.abs(issue.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 9000 + 1000))
        : issue.reporterName
    });
  });

  // Add media from other sibling perspectives of the same incident
  siblingPerspectives.forEach((sib) => {
    if (sib.id !== issue.id) {
      const sibMediaUrls = sib.mediaUrls || (sib.photoUrl ? [sib.photoUrl] : []);
      sibMediaUrls.forEach((url) => {
        if (!allMedia.some(m => m.url === url)) {
          allMedia.push({
            url,
            type: sib.mediaType || 'photo',
            addedBy: sib.isAnonymous 
              ? (sib.reporterName.startsWith("Anonymous Citizen") && sib.reporterName.includes("#") 
                  ? sib.reporterName 
                  : `Anonymous Citizen #` + (Math.abs(sib.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 9000 + 1000))
              : sib.reporterName
          });
        }
      });
    }
  });

  const activeMedia = allMedia[activeMediaIndex] || null;
  const activeMediaUrl = activeMedia?.url || "";
  const isVideo = activeMedia?.type === "video" || activeMediaUrl.startsWith("data:video/");

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      // Swiped left, show next photo
      setActiveMediaIndex((prev) => (prev + 1) % allMedia.length);
    } else if (diff < -50) {
      // Swiped right, show prev photo
      setActiveMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    }
    setTouchStart(null);
  };

  const getTrustBadge = (score: number) => {
    if (score >= 90) return { label: "Ground Zero Reporter", color: "text-brand border-brand/50 bg-brand/10" };
    if (score >= 75) return { label: "Civic Sentinel", color: "text-brand/90 border-brand/40 bg-brand/10" };
    if (score >= 60) return { label: "Ward Watcher", color: "text-purple-400 border-purple-500/30 bg-purple-950/30" };
    if (score >= 45) return { label: "Active Reporter", color: "text-blue-400 border-blue-500/30 bg-blue-950/30" };
    return { label: "Civic Novice", color: "text-gray-400 border-gray-700 bg-gray-900/40" };
  };

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

  const catStyle = CATEGORY_STYLES[issue.category] || CATEGORY_STYLES["Other"];
  const statusInfo = STATUS_DETAILS[issue.status] || STATUS_DETAILS.Reported;
  const StatusIcon = statusInfo.icon;
  const badge = getTrustBadge(issue.reporterTrustScore);

  // Check current user reactions
  const userReaction = issue.userReactions?.[currentUserId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className={`absolute bottom-22 left-4 right-4 z-40 border rounded-[24px] p-6 backdrop-blur-[20px] max-w-md mx-auto max-h-[60vh] flex flex-col shadow-2xl transition-all duration-500 ${
        theme === 'dark' ? 'bg-white/[0.05] border-white/10 text-white' : 'bg-white/60 border-neutral-200/50 shadow-xl text-neutral-900'
      }`}
      id={`issue-popup-${issue.id}`}
    >
      {/* Spam detection alert ribbon */}
      {issue.isSpam && (
        <div className="mb-3 px-3 py-1.5 bg-red-950/50 border border-red-500/40 rounded-lg text-[10px] text-red-400 flex items-center gap-1.5 font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500 animate-pulse" />
          <span>AI SPAM WARNING: Flagged as suspicious / gibberish ({issue.spamReasoning})</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
               <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
              theme === "dark" 
                ? `${catStyle.bg} ${catStyle.text} ${catStyle.border}` 
                : "bg-gray-100 border-gray-300 text-neutral-800"
            }`}>
              {React.createElement(catStyle.icon, { className: "w-3 h-3 shrink-0" })}
              <span>{catStyle.label}</span>
            </span>
            <span className="text-[10px] text-gray-500 font-mono">REACH: {issue.reporterTrustScore >= 70 ? "HIGH" : "NORMAL"}</span>
          </div>
          <h3 className={`text-sm font-black tracking-tight mt-1.5 ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>{issue.title}</h3>
          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1 font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              {issue.area}
            </span>
            <span>•</span>
            <span>{timeAgo(issue.createdAt)}</span>
          </div>
        </div>
 
        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
            theme === 'dark' ? 'bg-black text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-black'
          }`}
          id="close-popup-btn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto pr-1 flex-1 space-y-4 scrollbar-thin">

      {/* Photo / Video Swipeable Carousel and Description */}
      <div className="grid grid-cols-1 gap-2 mb-3">
        {activeMediaUrl && (
          <div 
            className={`w-full h-48 rounded-xl overflow-hidden border relative group/carousel select-none ${
              theme === 'dark' ? 'border-gray-900 bg-black/40' : 'border-gray-200 bg-gray-100'
            }`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {isVideo ? (
              <video
                src={activeMediaUrl}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={activeMediaUrl}
                alt={issue.title}
                className="w-full h-full object-cover select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
            )}
            
            {/* Added By User Label Overlay */}
            {activeMedia && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/90 backdrop-blur-md border border-neutral-900 rounded-lg text-[9px] text-gray-300 font-mono z-10 select-none">
                📸 Added by: <span className={`${theme === 'dark' ? 'text-[#39FF14]' : 'text-[#2ECC0F]'} font-bold`}>{activeMedia.addedBy}</span>
              </div>
            )}

            {/* Left/Right Carousel Control Overlays */}
            {allMedia.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
                  }}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/75 border border-gray-800 hover:bg-black flex items-center justify-center text-[10px] select-none cursor-pointer z-10 transition-all shadow-lg opacity-80 hover:opacity-100 ${
                    theme === 'dark' ? 'text-[#39FF14]' : 'text-[#2ECC0F]'
                  }`}
                  title="Previous"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaIndex((prev) => (prev + 1) % allMedia.length);
                  }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/75 border border-gray-800 hover:bg-black flex items-center justify-center text-[10px] select-none cursor-pointer z-10 transition-all shadow-lg opacity-80 hover:opacity-100 ${
                    theme === 'dark' ? 'text-[#39FF14]' : 'text-[#2ECC0F]'
                  }`}
                  title="Next"
                >
                  ▶
                </button>
              </>
            )}

            {/* Dot indicators at bottom of carousel */}
            {allMedia.length > 1 && (
              <div className="absolute bottom-2 right-2 flex gap-1 z-10 bg-black/50 px-2 py-1 rounded-full backdrop-blur-xs select-none">
                {allMedia.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveMediaIndex(idx); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                      activeMediaIndex === idx 
                        ? (theme === 'dark' ? "bg-[#39FF14] w-3" : "bg-[#2ECC0F] w-3") 
                        : "bg-gray-500 hover:bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* AI verification seal badge if high confidence */}
            {issue.status !== "Reported" && (
              <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase z-10 ${
                theme === 'dark' ? "bg-[#39FF14] text-black" : "bg-[#2ECC0F] text-white"
              }`}>
                <Sparkles className="w-2.5 h-2.5" />
                VERIFIED SOURCE
              </div>
            )}
          </div>
        )}

        {/* Aggregate Perspective thumbnail bar */}
        {allMedia.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-thin">
            {allMedia.map((mediaItem, idx) => {
              const isUrlVideo = mediaItem.type === "video" || mediaItem.url.startsWith("data:video/");
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`w-12 h-12 rounded-lg border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                    activeMediaIndex === idx ? "border-[#39FF14]" : "border-neutral-900 opacity-65 hover:opacity-100"
                  }`}
                  title={`Added by ${mediaItem.addedBy}`}
                >
                  {isUrlVideo ? (
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center"><Video className="w-4 h-4 text-gray-400" /></div>
                  ) : (
                    <img src={mediaItem.url} className="w-full h-full object-cover select-none pointer-events-none" referrerPolicy="no-referrer" />
                  )}
                </button>
              );
            })}
          </div>
        )}
 
         <p className={`text-xs leading-relaxed font-sans font-normal mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {issue.description}
        </p>
      </div>
 
      {/* Grouped Perspectives Block */}
      <div className={`mb-3 p-4 border rounded-xl ${theme === 'dark' ? 'bg-neutral-950 border-neutral-900' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
            <Megaphone className="w-3.5 h-3.5" />
            <span>{reporterCount} {reporterCount === 1 ? 'person reported this' : 'people reported this'}</span>
          </span>
        </div>
        
        {siblingPerspectives.length > 1 && (
          <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto pr-1">
            <p className="text-[8px] text-gray-500 uppercase tracking-wider font-mono">Select a perspective to view:</p>
            {siblingPerspectives.map((sib) => (
              <button
                key={sib.id}
                onClick={() => onSelectPerspective?.(sib)}
                className={`w-full p-2 rounded-lg border text-left transition-all flex flex-col cursor-pointer ${
                  sib.id === issue.id
                    ? (theme === "dark" ? "bg-neutral-900 border-neutral-800 text-white" : "bg-gray-200 border-gray-300 text-neutral-950 font-bold")
                    : (theme === "dark" ? "bg-black border-neutral-900 text-gray-400 hover:border-neutral-850 hover:text-gray-200" : "bg-white border-gray-200 text-gray-600 hover:text-black")
                }`}
              >
                <div className="flex justify-between items-center text-[9px] w-full font-semibold gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="truncate">
                      {sib.isAnonymous 
                        ? (sib.reporterName.startsWith("Anonymous Citizen") && sib.reporterName.includes("#") 
                            ? sib.reporterName 
                            : `Anonymous Citizen #` + (Math.abs(sib.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 9000 + 1000))
                        : sib.reporterName}
                    </span>
                    <span className={`text-[7.5px] px-1 border font-mono rounded font-black tracking-tight shrink-0 flex items-center gap-0.5 ${
                      theme === 'dark' ? 'border-neutral-800 bg-neutral-900 text-white' : 'border-gray-300 bg-neutral-800 text-white'
                    }`}>
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{sib.reporterTrustScore}</span>
                    </span>
                  </div>
                  <span className="text-[8px] text-gray-500 font-mono font-normal shrink-0">{timeAgo(sib.createdAt)}</span>
                </div>
                <p className="text-[10px] line-clamp-1 leading-snug mt-0.5">
                  {sib.description}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gemini Vision AI analysis explanation box */}
      {issue.aiDescription && (
        <div className={`mb-3 p-4 border rounded-xl ${theme === 'dark' ? 'bg-neutral-950 border-neutral-900' : 'bg-emerald-50/40 border-emerald-200'}`}>
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-[#39FF14]' : 'text-[#2ECC0F]'}`} />
            <span className={`text-[9px] font-black tracking-wider uppercase font-mono ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>GEMINI CO-PILOT radar</span>
          </div>
          <p className={`text-[10px] italic leading-snug font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-650'}`}>
            "{issue.aiDescription}"
          </p>
        </div>
      )}

      {/* Progress & Verification info */}
      <div className={`flex flex-col gap-2 p-2.5 border rounded-xl mb-3 ${theme === 'dark' ? 'bg-neutral-950 border-neutral-900' : 'bg-gray-50 border-gray-200'}`}>
        {/* Status row */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">GRID STATUS</span>
          <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
            issue.status === 'Resolved' 
              ? (theme === 'dark' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-500/10 border-green-500/30 text-green-600')
              : issue.status === 'Verified'
              ? (theme === 'dark' ? 'bg-[#39FF14]/10 border-[#39FF14]/20 text-[#39FF14]' : 'bg-[#2ECC0F]/10 border-[#2ECC0F]/20 text-[#2ECC0F]')
              : statusInfo.colorClass
          }`}>
            <StatusIcon className="w-3 h-3" />
            {statusInfo.label}
          </div>
        </div>

        {/* Status timeline text */}
        <p className={`text-[9px] font-sans leading-snug ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {statusInfo.desc}
        </p>

        {/* Status progress tracker */}
        <div className="flex items-center justify-between gap-1 pt-1.5">
          {["Reported", "Verified", "Escalated", "Resolved"].map((step, idx) => {
            const steps = ["Reported", "Verified", "Escalated", "Resolved"];
            const currentIdx = steps.indexOf(issue.status);
            const isActive = idx <= currentIdx;
            const isLatest = idx === currentIdx;

            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold ${
                    isLatest
                      ? (theme === 'dark' ? "bg-[#39FF14] text-black" : "bg-[#2ECC0F] text-white")
                      : isActive
                      ? (theme === 'dark' ? "bg-neutral-900 text-white border border-neutral-800" : "bg-gray-200 text-neutral-800 border border-gray-350")
                      : (theme === 'dark' ? "bg-black text-gray-600 border border-neutral-900" : "bg-white text-gray-400 border border-gray-200")
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[7px] mt-1 font-mono uppercase tracking-wide ${
                    isActive 
                      ? (theme === 'dark' ? "text-[#39FF14]" : "text-[#2ECC0F]") 
                      : "text-gray-500"
                  }`}>
                    {step}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`h-[1px] flex-1 -mt-3.5 ${
                    idx < currentIdx 
                      ? (theme === 'dark' ? "bg-[#39FF14]" : "bg-[#2ECC0F]") 
                      : (theme === 'dark' ? "bg-neutral-900" : "bg-gray-200")
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Submitter Details */}
      <div className={`flex items-center justify-between pb-3 mb-3 border-b text-[10px] ${theme === 'dark' ? 'border-neutral-900' : 'border-gray-200'}`}>
        <div className="flex items-center gap-1.5">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-black ${
            theme === 'dark' ? 'bg-neutral-950 text-white border-neutral-900' : 'bg-gray-100 text-neutral-900 border-gray-200'
          }`}>
            {issue.isAnonymous ? <User className="w-3.5 h-3.5 text-gray-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className={`font-bold font-sans ${theme === 'dark' ? 'text-gray-200' : 'text-neutral-900'}`}>
                {issue.isAnonymous 
                  ? (issue.reporterName.startsWith("Anonymous Citizen") && issue.reporterName.includes("#") 
                      ? issue.reporterName 
                      : `Anonymous Citizen #` + (Math.abs(issue.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 9000 + 1000))
                  : issue.reporterName}
              </p>
              <span className={`text-[8px] px-1 border font-mono rounded font-black tracking-tight shrink-0 flex items-center gap-0.5 ${
                theme === 'dark' ? 'bg-neutral-900 border-neutral-850 text-white' : 'bg-gray-50 border-gray-300 text-neutral-800'
              }`}>
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                <span>{issue.reporterTrustScore}</span>
              </span>
            </div>
            <p className="text-gray-500 font-mono text-[8px] uppercase">OPERATIVE</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <span className={`px-1.5 py-0.2 rounded text-[7px] font-bold border uppercase tracking-wide ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-[8px] text-gray-500 font-mono mt-0.5 uppercase">TRUST: <span className={`${theme === 'dark' ? 'text-white' : 'text-neutral-900'} font-bold`}>{issue.reporterTrustScore}</span></p>
        </div>
      </div>

      {/* 'I See This Too' Button */}
      <div className="mb-3">
        <button
          onClick={() => onSeeThisToo?.(issue.id)}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
            issue.seeThisTooUsers?.includes(currentUserId)
              ? (theme === 'dark' ? "bg-[#39FF14] text-black border-[#39FF14]" : "bg-[#2ECC0F] text-white border-[#2ECC0F]")
              : (theme === 'dark' ? "bg-black border-neutral-900 text-gray-300 hover:border-neutral-800 hover:text-white" : "bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:text-black shadow-sm")
          }`}
          id={`see-this-too-btn-${issue.id}`}
        >
          <Eye className="w-4 h-4 shrink-0" />
          <span>I See This Too</span>
          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
            issue.seeThisTooUsers?.includes(currentUserId) 
              ? (theme === 'dark' ? "bg-black/20 text-black" : "bg-white/20 text-white") 
              : (theme === 'dark' ? "bg-neutral-900 text-[#39FF14]" : "bg-gray-100 text-[#2ECC0F]")
          }`}>
            {issue.seeThisTooCount || 0}
          </span>
        </button>
      </div>

      {/* Reactions Panel */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-[9px] text-gray-500 font-mono uppercase">VIBE CHECK VOUCH</span>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Reaction 1: Verified (✅) */}
          <button
            onClick={() => onReact(issue.id, "verified")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
              userReaction === "verified"
                ? "bg-emerald-600/20 text-emerald-400 border-emerald-500 shadow-none"
                : (theme === 'dark' ? "bg-black text-gray-300 border-neutral-900 hover:border-neutral-800" : "bg-white text-gray-700 border-gray-250 hover:border-gray-400 shadow-xs")
            }`}
            id={`reaction-verified-${issue.id}`}
            title="Real Report"
          >
            <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            <span>Verified</span>
            <span className={`font-mono text-[9px] px-1 rounded ${
              theme === 'dark' ? 'bg-black/30 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}>{issue.reactions.verified || 0}</span>
          </button>

          {/* Reaction 2: Cap (🧢) */}
          <button
            onClick={() => onReact(issue.id, "cap")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
              userReaction === "cap"
                ? "bg-red-600/20 text-red-400 border-red-500 shadow-none"
                : (theme === 'dark' ? "bg-black text-gray-300 border-neutral-900 hover:border-neutral-800" : "bg-white text-gray-700 border-gray-250 hover:border-gray-400 shadow-xs")
            }`}
            id={`reaction-cap-${issue.id}`}
            title="Fake / Cap Report"
          >
            <Flag className="w-3.5 h-3.5 shrink-0 text-red-500" />
            <span>Cap</span>
            <span className={`font-mono text-[9px] px-1 rounded ${
              theme === 'dark' ? 'bg-black/30 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}>{issue.reactions.cap || 0}</span>
          </button>

          {/* Reaction 3: Big Issue (🔥) */}
          <button
            onClick={() => onReact(issue.id, "big_issue")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
              userReaction === "big_issue"
                ? "bg-amber-600/20 text-amber-400 border-amber-500 shadow-none"
                : (theme === 'dark' ? "bg-black text-gray-300 border-neutral-900 hover:border-neutral-800" : "bg-white text-gray-700 border-gray-250 hover:border-gray-400 shadow-xs")
            }`}
            id={`reaction-bigissue-${issue.id}`}
            title="Needs Attention ASAP"
          >
            <Flame className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span>Big Issue</span>
            <span className={`font-mono text-[9px] px-1 rounded ${
              theme === 'dark' ? 'bg-black/30 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}>{issue.reactions.big_issue || 0}</span>
          </button>

          {/* Reaction 4: Bruh (💀) */}
          <button
            onClick={() => onReact(issue.id, "bruh")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
              userReaction === "bruh"
                ? "bg-teal-600/20 text-teal-400 border-teal-500 shadow-none"
                : (theme === 'dark' ? "bg-black text-gray-300 border-neutral-900 hover:border-neutral-800" : "bg-white text-gray-700 border-gray-250 hover:border-gray-400 shadow-xs")
            }`}
            id={`reaction-bruh-${issue.id}`}
            title="Wow / Bruh moment"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-teal-400" />
            <span>Bruh</span>
            <span className={`font-mono text-[9px] px-1 rounded ${
              theme === 'dark' ? 'bg-black/30 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}>{issue.reactions.bruh || 0}</span>
          </button>
        </div>
      </div>

      {/* Add Another Angle Button */}
      {onAddPerspective && (
        <button
          onClick={() => onAddPerspective(parentId)}
          className={`w-full mt-3 py-2.5 font-black uppercase text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            theme === 'dark' ? 'bg-[#39FF14] text-black hover:opacity-90' : 'bg-[#2ECC0F] text-white hover:opacity-95'
          }`}
          id="add-angle-btn"
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span>Add Another Angle / Perspective</span>
        </button>
      )}

      </div>
    </motion.div>
  );
}
