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
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 80 }}
      className={`absolute bottom-14 left-2.5 right-2.5 sm:left-4 sm:right-4 z-40 border rounded-[14px] p-2.5 sm:p-3 backdrop-blur-2xl max-w-md mx-auto max-h-[82vh] flex flex-col shadow-2xl transition-all duration-180 font-ui ${
        theme === 'dark' ? 'bg-[#111111]/98 border-[#303030] text-white' : 'bg-white/98 border-[#E1E5DF] text-[#171B18]'
      }`}
      id={`issue-popup-${issue.id}`}
    >
      {/* Spam detection alert ribbon */}
      {issue.isSpam && (
        <div className="mb-1.5 px-2 py-1 bg-red-950/60 border border-red-500/40 rounded-[6px] text-[11px] text-red-300 flex items-center gap-1.5 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
          <span>Flagged as potential spam or unverified content: {issue.spamReasoning}</span>
        </div>
      )}

      {/* Header bar */}
      <div className={`flex items-start justify-between gap-2 mb-2 pb-1.5 border-b ${theme === 'dark' ? 'border-[#303030]' : 'border-[#E1E5DF]'}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-semibold uppercase tracking-wide border ${
              theme === "dark" 
                ? `${catStyle.bg} ${catStyle.text} ${catStyle.border}` 
                : "bg-[#F1F4EF] border-[#E1E5DF] text-[#171B18]"
            }`}>
              {React.createElement(catStyle.icon, { className: "w-3 h-3 shrink-0" })}
              <span>{catStyle.label}</span>
            </span>
            <span className="text-[11px] text-[#A3A3A3] font-meta">REACH: {issue.reporterTrustScore >= 70 ? "HIGH" : "NORMAL"}</span>
          </div>
          <h3 className={`text-sm font-bold tracking-tight mt-1 leading-snug font-ui ${theme === 'dark' ? 'text-white' : 'text-[#171B18]'}`}>{issue.title}</h3>
          <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3] mt-0.5 font-ui">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-[#A3A3A3] shrink-0" />
              <span>{issue.area}</span>
            </span>
            <span>·</span>
            <span className="font-meta text-xs">{timeAgo(issue.createdAt)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`p-1.5 min-h-[30px] min-w-[30px] flex items-center justify-center rounded-[8px] transition-all shrink-0 cursor-pointer border ${
            theme === 'dark' ? 'bg-[#191919] border-[#303030] text-[#A3A3A3] hover:text-white' : 'bg-[#F1F4EF] border-[#E1E5DF] text-[#626862] hover:text-[#171B18]'
          }`}
          id="close-popup-btn"
          aria-label="Close Issue Details"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-y-auto pr-0.5 flex-1 space-y-2.5 scrollbar-none">

      {/* Photo / Video Swipeable Carousel and Description */}
      <div className="grid grid-cols-1 gap-2 mb-1.5">
        {activeMediaUrl && (
          <div 
            className={`w-full h-40 rounded-[10px] overflow-hidden border relative group/carousel select-none ${
              theme === 'dark' ? 'border-[#303030] bg-black/40' : 'border-[#E1E5DF] bg-[#F1F4EF]'
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
              <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-black/90 backdrop-blur-md border border-neutral-800 rounded-[6px] text-xs text-gray-200 font-meta z-10 select-none flex items-center gap-1.5">
                <span>📸 Added by:</span> <span className={`${theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'} font-bold`}>{activeMedia.addedBy}</span>
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
                  className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/85 border border-gray-800 hover:bg-black flex items-center justify-center text-xs select-none cursor-pointer z-10 transition-all shadow-lg opacity-85 hover:opacity-100 ${
                    theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'
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
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/85 border border-gray-800 hover:bg-black flex items-center justify-center text-xs select-none cursor-pointer z-10 transition-all shadow-lg opacity-85 hover:opacity-100 ${
                    theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'
                  }`}
                  title="Next"
                >
                  ▶
                </button>
              </>
            )}

            {/* Dot indicators at bottom of carousel */}
            {allMedia.length > 1 && (
              <div className="absolute bottom-2.5 right-2.5 flex gap-1.5 z-10 bg-black/75 px-2.5 py-1 rounded-full backdrop-blur-xs select-none">
                {allMedia.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveMediaIndex(idx); }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeMediaIndex === idx 
                        ? (theme === 'dark' ? "bg-[#B7FF38] w-3" : "bg-[#537A00] w-3") 
                        : "bg-gray-500 hover:bg-gray-300 w-1.5"
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* AI verification seal badge if high confidence */}
            {issue.status !== "Reported" && (
              <div className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-bold font-meta uppercase z-10 border ${
                theme === 'dark' ? "bg-[#B7FF38] text-black border-[#B7FF38]" : "bg-[#B7FF38] text-black border-[#B7FF38]"
              }`}>
                <Sparkles className="w-3 h-3" />
                VERIFIED SOURCE
              </div>
            )}
          </div>
        )}

        {/* Aggregate Perspective thumbnail bar */}
        {allMedia.length > 1 && (
          <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
            {allMedia.map((mediaItem, idx) => {
              const isUrlVideo = mediaItem.type === "video" || mediaItem.url.startsWith("data:video/");
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`w-14 h-14 rounded-[10px] border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                    activeMediaIndex === idx ? "border-[#B7FF38]" : "border-[#303030] opacity-65 hover:opacity-100"
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
 
        <p className={`text-sm leading-relaxed font-ui font-normal mt-1 ${theme === 'dark' ? 'text-gray-200' : 'text-[#171B18]'}`}>
          {issue.description}
        </p>
      </div>
 
      {/* Grouped Perspectives Block */}
      <div className={`mb-3 p-3.5 border rounded-[14px] ${theme === 'dark' ? 'bg-[#111111] border-[#303030]' : 'bg-[#FAFCFA] border-[#E1E5DF]'}`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-wider font-meta flex items-center gap-1.5 ${theme === 'dark' ? 'text-white' : 'text-[#171B18]'}`}>
            <Megaphone className="w-4 h-4 text-[#B7FF38]" />
            <span>{reporterCount} {reporterCount === 1 ? 'person reported this' : 'people reported this'}</span>
          </span>
        </div>
        
        {siblingPerspectives.length > 1 && (
          <div className="space-y-2 mt-2.5 max-h-36 overflow-y-auto pr-1">
            <p className="text-xs text-[#A3A3A3] uppercase tracking-wider font-meta">Select a perspective to view:</p>
            {siblingPerspectives.map((sib) => (
              <button
                key={sib.id}
                onClick={() => onSelectPerspective?.(sib)}
                className={`w-full p-2.5 rounded-[10px] border text-left transition-all flex flex-col cursor-pointer ${
                  sib.id === issue.id
                    ? (theme === "dark" ? "bg-[#191919] border-[#B7FF38]/50 text-white" : "bg-white border-[#537A00]/50 text-[#171B18] shadow-xs")
                    : (theme === "dark" ? "bg-black/50 border-[#303030] text-[#A3A3A3] hover:border-neutral-500 hover:text-white" : "bg-white border-[#E1E5DF] text-[#626862] hover:text-[#171B18]")
                }`}
              >
                <div className="flex justify-between items-center text-xs w-full font-semibold gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate font-ui">
                      {sib.isAnonymous 
                        ? (sib.reporterName.startsWith("Anonymous Citizen") && sib.reporterName.includes("#") 
                            ? sib.reporterName 
                            : `Anonymous Citizen #` + (Math.abs(sib.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 9000 + 1000))
                        : sib.reporterName}
                    </span>
                    <span className={`text-[11px] px-1.5 py-0.5 border font-meta rounded-[6px] font-bold tracking-tight shrink-0 flex items-center gap-0.5 ${
                      theme === 'dark' ? 'border-[#303030] bg-[#111111] text-white' : 'border-[#E1E5DF] bg-[#F1F4EF] text-[#171B18]'
                    }`}>
                      <ShieldCheck className="w-3 h-3 text-[#B7FF38]" />
                      <span>{sib.reporterTrustScore}</span>
                    </span>
                  </div>
                  <span className="text-xs text-[#A3A3A3] font-meta font-normal shrink-0">{timeAgo(sib.createdAt)}</span>
                </div>
                <p className="text-xs line-clamp-1 leading-snug mt-1 font-ui text-[#A3A3A3]">
                  {sib.description}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gemini Vision AI analysis explanation box */}
      {issue.aiDescription && (
        <div className={`mb-3 p-4 border rounded-[14px] ${theme === 'dark' ? 'bg-[#111111] border-[#303030]' : 'bg-[#FAFCFA] border-[#E1E5DF]'}`}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}`} />
            <span className={`text-xs font-bold tracking-wider uppercase font-meta ${theme === 'dark' ? 'text-white' : 'text-[#171B18]'}`}>GEMINI CO-PILOT RADAR</span>
          </div>
          <p className={`text-xs italic leading-relaxed font-meta ${theme === 'dark' ? 'text-[#A3A3A3]' : 'text-[#626862]'}`}>
            "{issue.aiDescription}"
          </p>
        </div>
      )}

      {/* Progress & Verification info */}
      <div className={`flex flex-col gap-2.5 p-3.5 border rounded-[14px] mb-3 ${theme === 'dark' ? 'bg-[#111111] border-[#303030]' : 'bg-[#FAFCFA] border-[#E1E5DF]'}`}>
        {/* Status row */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#A3A3A3] uppercase tracking-wider font-meta">GRID STATUS</span>
          <div className={`px-2.5 py-1 rounded-[10px] text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
            issue.status === 'Resolved' 
              ? (theme === 'dark' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-500/10 border-green-500/30 text-green-600')
              : issue.status === 'Verified'
              ? (theme === 'dark' ? 'bg-[#B7FF38]/10 border-[#B7FF38]/20 text-[#B7FF38]' : 'bg-[#537A00]/10 border-[#537A00]/20 text-[#537A00]')
              : statusInfo.colorClass
          }`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusInfo.label}
          </div>
        </div>

        {/* Status timeline text */}
        <p className={`text-xs font-ui leading-relaxed ${theme === 'dark' ? 'text-[#A3A3A3]' : 'text-[#626862]'}`}>
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
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${
                    isLatest
                      ? (theme === 'dark' ? "bg-[#B7FF38] text-black border-[#B7FF38]" : "bg-[#B7FF38] text-black border-[#B7FF38]")
                      : isActive
                      ? (theme === 'dark' ? "bg-[#191919] text-white border-[#303030]" : "bg-[#E1E5DF] text-[#171B18] border-[#E1E5DF]")
                      : (theme === 'dark' ? "bg-black text-[#A3A3A3] border-[#303030]" : "bg-white text-gray-400 border-[#E1E5DF]")
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-xs mt-1.5 font-meta uppercase tracking-wide font-medium ${
                    isActive 
                      ? (theme === 'dark' ? "text-[#B7FF38]" : "text-[#537A00]") 
                      : "text-[#A3A3A3]"
                  }`}>
                    {step}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`h-[1px] flex-1 -mt-3.5 ${
                    idx < currentIdx 
                      ? (theme === 'dark' ? "bg-[#B7FF38]" : "bg-[#537A00]") 
                      : (theme === 'dark' ? "bg-[#303030]" : "bg-[#E1E5DF]")
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Submitter Details */}
      <div className={`flex items-center justify-between pb-2.5 mb-2.5 border-b text-xs ${theme === 'dark' ? 'border-[#303030]' : 'border-[#E1E5DF]'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center border text-xs font-bold ${
            theme === 'dark' ? 'bg-[#191919] text-white border-[#303030]' : 'bg-[#F1F4EF] text-[#171B18] border-[#E1E5DF]'
          }`}>
            {issue.isAnonymous ? <User className="w-4 h-4 text-[#A3A3A3]" /> : <ShieldCheck className="w-4 h-4 text-[#B7FF38]" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className={`font-bold font-ui text-xs ${theme === 'dark' ? 'text-gray-100' : 'text-[#171B18]'}`}>
                {issue.isAnonymous 
                  ? (issue.reporterName.startsWith("Anonymous Citizen") && issue.reporterName.includes("#") 
                      ? issue.reporterName 
                      : `Anonymous Citizen #` + (Math.abs(issue.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 9000 + 1000))
                  : issue.reporterName}
              </p>
              <span className={`text-[11px] px-1.5 py-0.5 border font-meta rounded-[6px] font-bold tracking-tight shrink-0 flex items-center gap-0.5 ${
                theme === 'dark' ? 'bg-[#191919] border-[#303030] text-white' : 'bg-[#F1F4EF] border-[#E1E5DF] text-[#171B18]'
              }`}>
                <ShieldCheck className="w-3 h-3 text-[#B7FF38]" />
                <span>{issue.reporterTrustScore}</span>
              </span>
            </div>
            <p className="text-[#A3A3A3] font-meta text-[10px] uppercase">OPERATIVE</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold font-meta border uppercase tracking-wide ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-[10px] text-[#A3A3A3] font-meta mt-0.5 uppercase">TRUST: <span className={`${theme === 'dark' ? 'text-white' : 'text-[#171B18]'} font-bold`}>{issue.reporterTrustScore}</span></p>
        </div>
      </div>

      {/* 'I See This Too' Button */}
      <div className="mb-2">
        <button
          type="button"
          onClick={() => onSeeThisToo?.(issue.id)}
          className={`w-full py-1.5 min-h-[36px] rounded-[8px] text-xs font-bold font-ui transition-all flex items-center justify-center gap-2 border cursor-pointer active:scale-[0.99] ${
            issue.seeThisTooUsers?.includes(currentUserId)
              ? "bg-[#B7FF38] text-black border-[#B7FF38] shadow-xs font-bold"
              : (theme === 'dark' ? "bg-[#191919] border-[#303030] text-gray-200 hover:border-neutral-500 hover:text-white" : "bg-white border-[#E1E5DF] text-[#171B18] hover:border-gray-400 shadow-2xs")
          }`}
          id={`see-this-too-btn-${issue.id}`}
        >
          <Eye className="w-3.5 h-3.5 shrink-0" />
          <span>I See This Too</span>
          <span className={`font-meta text-xs px-2 py-0.5 rounded-[5px] font-bold border ${
            issue.seeThisTooUsers?.includes(currentUserId) 
              ? "bg-black/20 text-black border-black/30" 
              : (theme === 'dark' ? "bg-[#111111] text-[#B7FF38] border-[#303030]" : "bg-[#F1F4EF] text-[#537A00] border-[#E1E5DF]")
          }`}>
            {issue.seeThisTooCount || 0}
          </span>
        </button>
      </div>

      {/* Reactions Panel */}
      <div className="flex flex-col gap-1.5 pt-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#A3A3A3] font-meta uppercase tracking-wider font-semibold">Community Vouch</span>
          <span className="text-[11px] text-[#A3A3A3] font-ui">Tap to react</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {/* Reaction 1: Verified (✅) */}
          <button
            type="button"
            onClick={() => onReact(issue.id, "verified")}
            className={`flex items-center justify-center gap-1.5 px-2 py-1 min-h-[32px] rounded-[8px] border text-xs font-semibold transition-all cursor-pointer ${
              userReaction === "verified"
                ? "bg-[#B7FF38]/20 text-[#B7FF38] border-[#B7FF38] font-bold"
                : (theme === 'dark' ? "bg-[#111111] text-[#A3A3A3] border-[#303030] hover:border-neutral-500 hover:text-white" : "bg-[#F1F4EF] text-[#171B18] border-[#E1E5DF] hover:border-gray-400 shadow-2xs")
            }`}
            id={`reaction-verified-${issue.id}`}
            title="Real Report"
          >
            <Check className="w-3 h-3 shrink-0 text-emerald-400" />
            <span>Verified</span>
            <span className={`font-meta text-xs px-1.5 py-0.5 rounded-[4px] font-bold ${
              theme === 'dark' ? 'bg-black/50 text-white' : 'bg-neutral-200/60 text-[#171B18]'
            }`}>{issue.reactions.verified || 0}</span>
          </button>

          {/* Reaction 2: Cap (🧢) */}
          <button
            type="button"
            onClick={() => onReact(issue.id, "cap")}
            className={`flex items-center justify-center gap-1.5 px-2 py-1 min-h-[32px] rounded-[8px] border text-xs font-semibold transition-all cursor-pointer ${
              userReaction === "cap"
                ? "bg-red-600/20 text-red-400 border-red-500 font-bold"
                : (theme === 'dark' ? "bg-[#111111] text-[#A3A3A3] border-[#303030] hover:border-neutral-500 hover:text-white" : "bg-[#F1F4EF] text-[#171B18] border-[#E1E5DF] hover:border-gray-400 shadow-2xs")
            }`}
            id={`reaction-cap-${issue.id}`}
            title="Fake / Cap Report"
          >
            <Flag className="w-3 h-3 shrink-0 text-red-500" />
            <span>Cap</span>
            <span className={`font-meta text-xs px-1.5 py-0.5 rounded-[4px] font-bold ${
              theme === 'dark' ? 'bg-black/50 text-white' : 'bg-neutral-200/60 text-[#171B18]'
            }`}>{issue.reactions.cap || 0}</span>
          </button>

          {/* Reaction 3: Big Issue (🔥) */}
          <button
            type="button"
            onClick={() => onReact(issue.id, "big_issue")}
            className={`flex items-center justify-center gap-1.5 px-2 py-1 min-h-[32px] rounded-[8px] border text-xs font-semibold transition-all cursor-pointer ${
              userReaction === "big_issue"
                ? "bg-amber-600/20 text-amber-400 border-amber-500 font-bold"
                : (theme === 'dark' ? "bg-[#111111] text-[#A3A3A3] border-[#303030] hover:border-neutral-500 hover:text-white" : "bg-[#F1F4EF] text-[#171B18] border-[#E1E5DF] hover:border-gray-400 shadow-2xs")
            }`}
            id={`reaction-bigissue-${issue.id}`}
            title="Needs Attention ASAP"
          >
            <Flame className="w-3 h-3 shrink-0 text-amber-500" />
            <span>Big Issue</span>
            <span className={`font-meta text-xs px-1.5 py-0.5 rounded-[4px] font-bold ${
              theme === 'dark' ? 'bg-black/50 text-white' : 'bg-neutral-200/60 text-[#171B18]'
            }`}>{issue.reactions.big_issue || 0}</span>
          </button>

          {/* Reaction 4: Bruh (💀) */}
          <button
            type="button"
            onClick={() => onReact(issue.id, "bruh")}
            className={`flex items-center justify-center gap-1.5 px-2 py-1 min-h-[32px] rounded-[8px] border text-xs font-semibold transition-all cursor-pointer ${
              userReaction === "bruh"
                ? "bg-teal-600/20 text-teal-400 border-teal-500 font-bold"
                : (theme === 'dark' ? "bg-[#111111] text-[#A3A3A3] border-[#303030] hover:border-neutral-500 hover:text-white" : "bg-[#F1F4EF] text-[#171B18] border-[#E1E5DF] hover:border-gray-400 shadow-2xs")
            }`}
            id={`reaction-bruh-${issue.id}`}
            title="Wow / Bruh moment"
          >
            <AlertTriangle className="w-3 h-3 shrink-0 text-teal-400" />
            <span>Bruh</span>
            <span className={`font-meta text-xs px-1.5 py-0.5 rounded-[4px] font-bold ${
              theme === 'dark' ? 'bg-black/50 text-white' : 'bg-neutral-200/60 text-[#171B18]'
            }`}>{issue.reactions.bruh || 0}</span>
          </button>
        </div>
      </div>

      {/* Add Another Perspective Button: Primary Button rule */}
      {onAddPerspective && (
        <button
          type="button"
          onClick={() => onAddPerspective(parentId)}
          className="w-full mt-2 py-2 min-h-[36px] font-ui font-bold uppercase tracking-wider text-xs rounded-[8px] transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent bg-[#B7FF38] hover:bg-[#A6ED27] active:bg-[#94D91F] text-black shadow-md"
          id="add-angle-btn"
        >
          <Camera className="w-3.5 h-3.5 shrink-0" />
          <span>Add Another Perspective</span>
        </button>
      )}

      </div>
    </motion.div>
  );
}
