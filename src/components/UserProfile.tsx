import React, { useState } from "react";
import { User as UserType, Issue } from "../types";
import {
  LogOut,
  Award,
  ShieldCheck,
  Flame,
  FileText,
  ChevronRight,
  Eye,
  EyeOff,
  ThumbsUp,
  Users,
  TrendingUp,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { motion } from "motion/react";

interface UserProfileProps {
  user: UserType;
  issues: Issue[];
  onLogout: () => void;
  onSelectIssue: (issue: Issue) => void;
  onUpdateUser: (updatedUser: UserType) => void;
  theme?: "light" | "dark";
}

export default function UserProfile({
  user,
  issues,
  onLogout,
  onUpdateUser,
  onSelectIssue,
  theme = "dark"
}: UserProfileProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Find all issues submitted by this user
  const userIssues = issues.filter(
    (issue) => issue.reporterId === user.id
  );

  // Calculate stats
  const totalPosts = userIssues.length;
  
  const totalReactions = userIssues.reduce((sum, issue) => {
    const r = issue.reactions || { verified: 0, cap: 0, big_issue: 0, bruh: 0 };
    return sum + (r.verified || 0) + (r.cap || 0) + (r.big_issue || 0) + (r.bruh || 0);
  }, 0);

  // Dynamic estimate of people reached
  const peopleReached = userIssues.reduce((sum, issue) => {
    const v = issue.reactions.verified || 0;
    const b = issue.reactions.big_issue || 0;
    return sum + 12 + (v * 18) + (b * 45);
  }, 0);

  // My Impact score = trust score * total posts
  const impactScore = user.trustScore * totalPosts;

  const getRank = (score: number) => {
    if (score >= 90) return { title: "Civic Sentinel", icon: "👑", color: "text-brand bg-brand/5 border-brand/20", desc: "Elite guardian of civic transparency." };
    if (score >= 75) return { title: "Ward Watcher", icon: "🛡️", color: "text-green-400 bg-green-950/40 border-green-500/30", desc: "Highly reliable community helper." };
    if (score >= 55) return { title: "Active Reporter", icon: "⚡", color: "text-blue-400 bg-blue-950/40 border-blue-500/30", desc: "Standard reporter reporting local outages." };
    return { title: "Civic Novice", icon: "🌱", color: "text-gray-400 bg-gray-900/40 border-gray-700/50", desc: "Newly initialized citizen on GroundZero." };
  };

  const rank = getRank(user.trustScore);

  // Civic badges checklist
  const badges = [
    {
      id: "first_report",
      title: "First Report",
      icon: "📍",
      description: "Filed your first report on the grid",
      earned: totalPosts >= 1
    },
    {
      id: "truth_seeker",
      title: "Truth Seeker",
      icon: "🔍",
      description: "Had at least one report verified by community",
      earned: userIssues.some(i => i.status === "Verified" || i.status === "Resolved" || i.status === "Escalated")
    },
    {
      id: "whistleblower",
      title: "Whistleblower",
      icon: "📣",
      description: "Reported Corruption or Govt Failure",
      earned: userIssues.some(i => ["Corruption", "Government Failure", "Harassment"].includes(i.category))
    },
    {
      id: "ground_reporter",
      title: "Ground Reporter",
      icon: "⚡",
      description: "Filed 3 or more incident reports",
      earned: totalPosts >= 3
    }
  ];

  // Call API to toggle anonymity
  const handleToggleAnonymous = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    const nextAnon = !user.isAnonymous;
    try {
      const res = await fetch(`/api/users/${user.id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAnonymous: nextAnon })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          onUpdateUser(data.user);
        }
      }
    } catch (e) {
      console.error("Failed to update user anonymity:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper to extract initials
  const getInitials = (name: string) => {
    if (!name) return "GZ";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`w-full max-w-lg mx-auto border rounded-xl p-6 md:p-8 space-y-6 overflow-y-auto max-h-[85vh] scrollbar-none ${
        theme === "dark" ? "bg-black border-neutral-900 text-white" : "bg-white border-gray-200 text-neutral-900"
      }`}
      id="user-profile-view"
    >
      {/* Top Banner & Header info */}
      <div className={`flex items-start justify-between pb-6 border-b ${theme === "dark" ? "border-neutral-900" : "border-gray-200"}`} id="profile-top-header">
        <div className="flex items-center gap-4">
          {/* Avatar with initials */}
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black font-mono shrink-0 ${
              theme === "dark" ? "bg-neutral-950 border border-neutral-900 text-white" : "bg-gray-100 border border-gray-200 text-neutral-900"
            }`}>
              {user.isAnonymous ? "🔒" : getInitials(user.name)}
            </div>
            {/* Status indicator */}
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
              theme === "dark" ? "bg-[#39FF14] border-black" : "bg-[#2ECC0F] border-white"
            }`} title="Online Grid Operations">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${theme === "dark" ? "bg-black" : "bg-white"}`} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`text-base font-black tracking-tight uppercase leading-tight ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                {user.isAnonymous ? "Anonymous Citizen" : user.name}
              </h2>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest border shrink-0 ${rank.color}`}>
                {rank.title}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono tracking-wide mt-0.5 uppercase">
              {user.isAnonymous ? "DECRYPTED OPERATIONS MASK" : user.email}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className={`flex items-center gap-1 px-2.5 py-1.5 border text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
            theme === "dark"
              ? "bg-black hover:bg-red-950/30 hover:text-red-400 border-neutral-900 hover:border-red-500/20 text-gray-400"
              : "bg-gray-50 hover:bg-red-50 hover:text-red-600 border-gray-200 hover:border-red-200 text-gray-600"
          }`}
          id="logout-btn"
        >
          <LogOut className="w-3 h-3" />
          <span>Exit</span>
        </button>
      </div>

      {/* Prominent Anonymous Mode Toggle */}
      <div className={`p-4 border rounded-xl flex items-center justify-between ${
        theme === "dark" ? "bg-neutral-950 border-neutral-900" : "bg-gray-50 border-gray-200"
      }`} id="anon-mode-toggle-card">
        <div className="flex items-center gap-2.5">
          {user.isAnonymous ? (
            <div className={`p-2 rounded-lg border ${
              theme === "dark" ? "bg-neutral-900 border-neutral-850 text-white" : "bg-gray-200 border-gray-300 text-neutral-800"
            }`}>
              <EyeOff className="w-4 h-4" />
            </div>
          ) : (
            <div className={`p-2 rounded-lg border ${
              theme === "dark" ? "bg-neutral-950 border-neutral-900 text-gray-550" : "bg-gray-100 border-gray-200 text-gray-400"
            }`}>
              <Eye className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <div>
            <p className={`text-[10px] font-black tracking-wider uppercase font-mono leading-none ${theme === "dark" ? "text-gray-200" : "text-neutral-800"}`}>
              ANONYMOUS SHIELD
            </p>
            <p className="text-[9px] text-gray-500 font-mono tracking-wide mt-0.5 uppercase">
              {user.isAnonymous ? "Your identity is encrypted" : "Your name is shown publicly"}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleAnonymous}
          disabled={isUpdating}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase font-black tracking-widest border transition-all cursor-pointer ${
            user.isAnonymous
              ? (theme === "dark" ? "bg-[#39FF14] text-black border-[#39FF14]" : "bg-[#2ECC0F] text-white border-[#2ECC0F]")
              : (theme === "dark" ? "bg-transparent text-gray-400 border-neutral-900 hover:text-white" : "bg-transparent text-gray-500 border-gray-200 hover:text-black")
          }`}
          id="toggle-anonymity-btn"
        >
          {user.isAnonymous ? "ACTIVE" : "DISABLED"}
        </button>
      </div>

      {/* Trust Score & Impact Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="trust-impact-metrics">
        {/* Trust score dial */}
        <div className={`p-4 border rounded-xl flex items-center gap-4 ${
          theme === "dark" ? "bg-neutral-950 border-neutral-900" : "bg-gray-50 border-gray-200"
        }`}>
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke={theme === "dark" ? "#111" : "#e5e7eb"} strokeWidth="5" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke={theme === "dark" ? "#39FF14" : "#2ECC0F"}
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 - (175.9 * user.trustScore) / 100}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className={`absolute text-sm font-black font-mono ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>{user.trustScore}</span>
          </div>
          <div>
            <div className={`flex items-center gap-1 text-[10px] font-mono uppercase font-black tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
              <Award className="w-3.5 h-3.5" />
              Trust Score
            </div>
            <p className="text-[8px] text-gray-500 font-mono uppercase mt-0.5">
              Based on crowd verifications & resolutions.
            </p>
          </div>
        </div>

        {/* My Impact card */}
        <div className={`p-4 border rounded-xl flex items-center gap-4 ${
          theme === "dark" ? "bg-neutral-950 border-neutral-900" : "bg-gray-50 border-gray-200"
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            theme === "dark" ? "bg-neutral-900 border border-neutral-850 text-white" : "bg-gray-200 border border-gray-300 text-neutral-800"
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-[10px] font-mono uppercase font-black tracking-wider flex items-center gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
              <Flame className="w-3.5 h-3.5" />
              My Impact
            </div>
            <p className={`text-xl font-black tracking-tight leading-none mt-1 ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
              {impactScore}
            </p>
            <p className="text-[8.5px] text-gray-500 font-mono uppercase mt-0.5">
              Trust Score × Reports Filed
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className={`grid grid-cols-3 gap-0 border rounded-xl overflow-hidden ${
        theme === "dark" ? "border-neutral-900 bg-black" : "border-gray-200 bg-gray-50"
      }`} id="profile-stats-row">
        {/* Total Posts */}
        <div className={`p-3 text-center border-r ${theme === "dark" ? "bg-black border-neutral-900" : "bg-gray-50 border-gray-200"}`}>
          <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest leading-none mb-1.5">Posts</p>
          <div className={`flex items-center justify-center gap-1.5 ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
            <FileText className="w-3.5 h-3.5" />
            <span className="text-sm font-black font-mono leading-none">{totalPosts}</span>
          </div>
        </div>

        {/* Reactions Received */}
        <div className={`p-3 text-center border-r ${theme === "dark" ? "bg-black border-neutral-900" : "bg-gray-50 border-gray-200"}`}>
          <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest leading-none mb-1.5">Reactions</p>
          <div className={`flex items-center justify-center gap-1.5 ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="text-sm font-black font-mono leading-none">{totalReactions}</span>
          </div>
        </div>

        {/* People Reached */}
        <div className={`p-3 text-center ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}>
          <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest leading-none mb-1.5">Reached</p>
          <div className={`flex items-center justify-center gap-1.5 ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
            <Users className="w-3.5 h-3.5" />
            <span className="text-sm font-black font-mono leading-none">{peopleReached}</span>
          </div>
        </div>
      </div>

      {/* Civic Badges Row */}
      <div className="space-y-2.5" id="profile-civic-badges-row">
        <div className="flex items-center justify-between">
          <h3 className={`text-[10px] font-black font-mono uppercase tracking-wider flex items-center gap-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            Earned Civic Badges
          </h3>
          <span className="text-[8px] text-gray-500 font-mono">GAMIFIED MILESTONES</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-2.5 border rounded-xl flex flex-col items-center text-center transition-all relative overflow-hidden ${
                badge.earned
                  ? (theme === "dark" ? "bg-neutral-950 border-neutral-850" : "bg-gray-50 border-gray-300 shadow-sm")
                  : (theme === "dark" ? "bg-black border-neutral-900 opacity-30 select-none" : "bg-gray-100/50 border-gray-200 opacity-35 select-none")
              }`}
              title={badge.description}
            >
              {/* Badge Icon */}
              <span className={`text-xl mb-1 ${badge.earned ? "scale-100" : "grayscale filter"}`}>
                {badge.icon}
              </span>
              <p className={`text-[9px] font-black uppercase tracking-wider leading-tight ${badge.earned ? (theme === "dark" ? "text-white" : "text-neutral-900") : "text-gray-500"}`}>
                {badge.title}
              </p>
              <p className="text-[7.5px] text-gray-500 font-mono leading-normal mt-0.5 line-clamp-2 uppercase">
                {badge.description}
              </p>

              {/* Verified badge status banner */}
              {badge.earned && (
                <span className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-bl-sm ${theme === "dark" ? "bg-[#39FF14]" : "bg-[#2ECC0F]"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trust Score rules explanation / guide */}
      <div className={`p-4 border rounded-lg text-[9px] space-y-2 font-sans ${
        theme === "dark" ? "bg-neutral-950 border-neutral-900 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-650"
      }`}>
        <p className={`font-bold flex items-center gap-1 text-[10px] uppercase font-mono ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          Trust Metric Operations
        </p>
        <ul className="list-disc pl-4 space-y-0.5 font-mono uppercase tracking-wide text-[8.5px]">
          <li>Community logs <span className={theme === "dark" ? "text-[#39FF14]" : "text-[#2ECC0F]"}>(+5 TS)</span> for every "Verified ✅" reaction.</li>
          <li>Submitting fake logs <span className="text-red-500">(-12 TS)</span> for "Cap 🧢" consensus.</li>
          <li>Official Status updates <span className={theme === "dark" ? "text-[#39FF14]" : "text-[#2ECC0F]"}>(up to +25 TS)</span> when issue is Resolved!</li>
        </ul>
      </div>

      {/* My Stories (Personal Complaint list) */}
      <div className="space-y-3" id="reporter-history-section">
        <div className="flex items-center justify-between">
          <h3 className={`text-[10px] font-black font-mono uppercase tracking-wider flex items-center gap-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
            <FileText className="w-3.5 h-3.5" />
            My Stories ({userIssues.length})
          </h3>
          <span className="text-[8px] text-gray-500 font-mono">REPORT REGISTRY</span>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-none">
          {userIssues.length === 0 ? (
            <div className={`p-6 border rounded-xl text-center text-xs ${
              theme === "dark" ? "bg-black border-neutral-900 text-gray-500" : "bg-gray-50 border-gray-200 text-gray-500"
            }`}>
              <p>You haven't filed any grid reports yet.</p>
              <p className="text-[8px] text-gray-600 font-mono mt-1 uppercase">TAP 'REPORT ISSUE' IN FOOTER TO FILE AN INCIDENT</p>
            </div>
          ) : (
            userIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className={`py-4 px-1 border-b flex items-center justify-between cursor-pointer transition-all gap-2 bg-transparent ${
                  theme === "dark" ? "border-neutral-900 hover:bg-neutral-950/40" : "border-gray-200 hover:bg-gray-50"
                }`}
                id={`history-item-${issue.id}`}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                      backgroundColor: {
                        "Civic Issue": "#818cf8",
                        "Pothole": "#f97316",
                        "Flooding": "#3b82f6",
                        "Power Cut": "#eab308",
                        "Garbage": "#a16207",
                        "Corruption": "#ef4444",
                        "Government Failure": "#b91c1c",
                        "Protest / Rally": "#ec4899",
                        "Local Drama": "#14b8a6",
                        "Argument / Dispute": "#f43f5e",
                        "Harassment": "#dc2626",
                        "Breaking News": "#06b6d4",
                        "Village Problem": "#22c55e",
                        "Weather": "#38bdf8",
                        "War / Conflict": "#4b5563",
                        "Other": "#6b7280"
                      }[issue.category] || "#6b7280"
                    }} />
                    <span className={`text-[9px] font-mono uppercase font-bold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      {issue.category}
                    </span>
                    <span className="text-[8px] text-gray-500 font-mono">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className={`text-xs font-bold tracking-tight truncate ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>{issue.title}</h4>
                  <div className="flex items-center gap-2.5 text-[8.5px] text-gray-500 font-mono uppercase">
                    <span>{issue.area}</span>
                    <div className="flex items-center gap-1.5">
                      <span>✅ {issue.reactions.verified || 0}</span>
                      <span>🧢 {issue.reactions.cap || 0}</span>
                      <span>🔥 {issue.reactions.big_issue || 0}</span>
                      <span>💀 {issue.reactions.bruh || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold border ${
                    issue.status === "Resolved"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : issue.status === "Escalated"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : issue.status === "Verified"
                      ? (theme === "dark" ? "bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/20" : "bg-[#2ECC0F]/10 text-[#2ECC0F] border-[#2ECC0F]/20")
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>
                    {issue.status}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-550" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
