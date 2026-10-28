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
  HelpCircle,
  Camera,
  Upload,
  MapPin,
  Search,
  Megaphone,
  Zap,
  Check,
  Flag,
  AlertTriangle,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UserProfileProps {
  user: UserType;
  issues: Issue[];
  onLogout: () => void;
  onSelectIssue: (issue: Issue) => void;
  onUpdateUser: (updatedUser: UserType) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function UserProfile({
  user,
  issues,
  onLogout,
  onUpdateUser,
  onSelectIssue,
  theme = "dark",
  onToggleTheme
}: UserProfileProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const presets = ["AG", "CD", "SP", "RC", "OP", "FC", "OB", "VS", "SD", "TR"];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await updateProfilePicture(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfilePicture = async (newAvatar: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/users/${user.id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: newAvatar })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          onUpdateUser(data.user);
        }
      }
    } catch (e) {
      console.error("Failed to update profile picture:", e);
    } finally {
      setIsUpdating(false);
    }
  };

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
    if (score >= 90) return { title: "Civic Sentinel", color: "text-[#B7FF38] bg-[#B7FF38]/10 border-[#B7FF38]/30", desc: "Elite guardian of civic transparency." };
    if (score >= 75) return { title: "Ward Watcher", color: "text-[#B7FF38] bg-[#B7FF38]/10 border-[#B7FF38]/20", desc: "Highly reliable community helper." };
    if (score >= 55) return { title: "Active Reporter", color: "text-blue-400 bg-blue-950/40 border-blue-500/30", desc: "Standard reporter reporting local outages." };
    return { title: "Civic Novice", color: "text-[#A3A3A3] bg-[#191919] border-[#303030]", desc: "Newly initialized citizen on GroundZero." };
  };

  const rank = getRank(user.trustScore);

  const BADGE_ICONS: Record<string, React.ComponentType<any>> = {
    first_report: MapPin,
    truth_seeker: Search,
    whistleblower: Megaphone,
    ground_reporter: Zap,
  };

  // Civic badges checklist
  const badges = [
    {
      id: "first_report",
      title: "First Report",
      description: "Filed your first report on the grid",
      earned: totalPosts >= 1
    },
    {
      id: "truth_seeker",
      title: "Truth Seeker",
      description: "Had at least one report verified by community",
      earned: userIssues.some(i => i.status === "Verified" || i.status === "Resolved" || i.status === "Escalated")
    },
    {
      id: "whistleblower",
      title: "Whistleblower",
      description: "Reported Corruption or Govt Failure",
      earned: userIssues.some(i => ["Corruption", "Government Failure", "Harassment"].includes(i.category))
    },
    {
      id: "ground_reporter",
      title: "Ground Reporter",
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
      className={`w-full max-w-md mx-auto border rounded-[12px] p-3 sm:p-3.5 space-y-3 overflow-y-auto max-h-[85vh] scrollbar-none font-ui transition-all duration-300 shadow-xl ${
        theme === "dark" ? "bg-[#111111] border-[#303030] text-white" : "bg-white border-[#E1E5DF] text-[#171B18]"
      }`}
      id="user-profile-view"
    >
      {/* Top Banner & Header info */}
      <div className={`flex items-start justify-between pb-2.5 border-b ${theme === "dark" ? "border-[#303030]" : "border-[#E1E5DF]"}`} id="profile-top-header">
        <div className="flex items-center gap-2.5">
          {/* Avatar with initials or profile picture */}
          <div className="relative group cursor-pointer" onClick={() => !user.isAnonymous && setShowAvatarPicker(!showAvatarPicker)}>
            <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center text-sm font-black font-display shrink-0 overflow-hidden border ${
              theme === "dark" ? "bg-[#191919] border-[#303030] text-white" : "bg-[#F1F4EF] border-[#E1E5DF] text-[#171B18]"
            }`}>
              {user.isAnonymous ? (
                <EyeOff className="w-4 h-4 text-[#A3A3A3]" />
              ) : user.avatarUrl ? (
                user.avatarUrl.startsWith("data:") || user.avatarUrl.startsWith("http") ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-lg">{user.avatarUrl}</span>
                )
              ) : (
                getInitials(user.name)
              )}
            </div>
            {/* Camera Overlay on Hover */}
            {!user.isAnonymous && (
              <div className="absolute inset-0 bg-black/60 rounded-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-3 h-3 text-white" />
              </div>
            )}
            {/* Status indicator */}
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border flex items-center justify-center ${
              theme === "dark" ? "bg-[#B7FF38] border-black" : "bg-[#537A00] border-white"
            }`} title="Online Grid Operations">
              <span className={`w-1 h-1 rounded-full animate-pulse ${theme === "dark" ? "bg-black" : "bg-white"}`} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className={`text-sm font-display font-black tracking-tight uppercase leading-tight ${theme === "dark" ? "text-white" : "text-[#171B18]"}`}>
                {user.isAnonymous ? "Anonymous Citizen" : user.name}
              </h2>
              <span className={`px-1.5 py-0.5 rounded-[5px] text-[10px] font-meta font-bold uppercase tracking-wider border shrink-0 ${rank.color}`}>
                {rank.title}
              </span>
            </div>
            <p className="text-[10px] text-[#A3A3A3] font-meta tracking-wide mt-0.5 uppercase">
              {user.isAnonymous ? "DECRYPTED OPERATIONS MASK" : user.email}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className={`flex items-center gap-1 px-2.5 py-1 border text-xs font-bold font-meta uppercase rounded-[8px] min-h-[30px] transition-all cursor-pointer ${
            theme === "dark"
              ? "bg-[#191919] hover:bg-red-950/30 hover:text-red-400 border-[#303030] hover:border-red-500/20 text-[#A3A3A3]"
              : "bg-[#F1F4EF] hover:bg-red-50 hover:text-red-600 border-[#E1E5DF] hover:border-red-200 text-[#626862]"
          }`}
          id="logout-btn"
        >
          <LogOut className="w-3 h-3" />
          <span>Exit</span>
        </button>
      </div>

      {/* Collapsible Avatar Picker */}
      <AnimatePresence>
        {showAvatarPicker && !user.isAnonymous && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 border rounded-[10px] space-y-3.5 overflow-hidden ${
              theme === "dark" ? "bg-[#191919] border-[#303030]" : "bg-[#F1F4EF] border-[#E1E5DF]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className={`text-xs font-bold font-meta uppercase tracking-wider ${theme === "dark" ? "text-[#A3A3A3]" : "text-[#626862]"}`}>
                Customize operative avatar
              </h4>
              <button 
                onClick={() => setShowAvatarPicker(false)}
                className="text-xs text-[#A3A3A3] hover:text-red-400 font-meta"
              >
                CLOSE
              </button>
            </div>

            {/* Custom file upload button */}
            <div className="flex items-center gap-3">
              <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[40px] border border-dashed rounded-[10px] text-xs font-meta uppercase cursor-pointer transition-all ${
                theme === "dark"
                  ? "border-[#303030] hover:border-[#B7FF38]/50 bg-black/40 text-[#A3A3A3] hover:text-white"
                  : "border-[#E1E5DF] hover:border-[#537A00]/50 bg-white text-[#626862] hover:text-[#171B18]"
              }`}>
                <Upload className="w-4 h-4" />
                <span>Upload Custom Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>

              {user.avatarUrl && (
                <button
                  onClick={() => updateProfilePicture("")}
                  className={`px-3 py-2.5 min-h-[40px] border rounded-[10px] text-xs font-meta uppercase font-bold transition-all ${
                    theme === "dark"
                      ? "border-[#303030] hover:border-red-500/30 text-[#A3A3A3] hover:text-red-400 bg-black/20"
                      : "border-[#E1E5DF] hover:border-red-300 text-[#626862] hover:text-red-600 bg-white"
                  }`}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <p className="text-xs text-[#A3A3A3] font-meta uppercase">Quick presets:</p>
              <div className="grid grid-cols-5 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => updateProfilePicture(preset)}
                    className={`p-2.5 rounded-[10px] text-xl flex items-center justify-center transition-all border ${
                      user.avatarUrl === preset
                        ? theme === "dark"
                          ? "bg-[#B7FF38]/15 border-[#B7FF38] text-white"
                          : "bg-[#537A00]/15 border-[#537A00] text-[#171B18]"
                        : theme === "dark"
                          ? "bg-black/40 border-[#303030] hover:border-[#B7FF38]/40"
                          : "bg-white border-[#E1E5DF] hover:border-[#537A00]/40"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prominent Anonymous Mode Toggle */}
      <div className={`p-2.5 border rounded-[8px] flex items-center justify-between transition-all duration-300 ${
        theme === "dark" ? "bg-[#191919] border-[#303030]" : "bg-[#F1F4EF] border-[#E1E5DF] shadow-xs"
      }`} id="anon-mode-toggle-card">
        <div className="flex items-center gap-2">
          {user.isAnonymous ? (
            <div className={`p-1.5 rounded-[6px] border ${
              theme === "dark" ? "bg-[#111111] border-[#303030] text-white" : "bg-white border-[#E1E5DF] text-[#171B18]"
            }`}>
              <EyeOff className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className={`p-1.5 rounded-[6px] border ${
              theme === "dark" ? "bg-[#111111] border-[#303030] text-[#A3A3A3]" : "bg-white border-[#E1E5DF] text-[#626862]"
            }`}>
              <Eye className="w-3.5 h-3.5" />
            </div>
          )}
          <div>
            <p className={`text-xs font-bold tracking-wider uppercase font-meta leading-none ${theme === "dark" ? "text-gray-200" : "text-[#171B18]"}`}>
              ANONYMOUS SHIELD
            </p>
            <p className="text-[10px] text-[#A3A3A3] font-meta tracking-wide mt-0.5 uppercase">
              {user.isAnonymous ? "Your identity is encrypted" : "Your name is shown publicly"}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleAnonymous}
          disabled={isUpdating}
          className={`px-2.5 py-1 min-h-[28px] rounded-[8px] text-[11px] font-meta uppercase font-bold tracking-wider border transition-all cursor-pointer ${
            user.isAnonymous
              ? (theme === "dark" ? "bg-[#B7FF38] text-black border-[#B7FF38]" : "bg-[#537A00] text-white border-[#537A00]")
              : (theme === "dark" ? "bg-transparent text-[#A3A3A3] border-[#303030] hover:text-white" : "bg-transparent text-[#626862] border-[#E1E5DF] hover:text-black")
          }`}
          id="toggle-anonymity-btn"
        >
          {user.isAnonymous ? "ACTIVE" : "DISABLED"}
        </button>
      </div>

      {/* Theme Toggle Settings Card */}
      {onToggleTheme && (
        <div className={`p-2.5 border rounded-[8px] flex items-center justify-between transition-all duration-300 ${
          theme === "dark" ? "bg-[#191919] border-[#303030]" : "bg-[#F1F4EF] border-[#E1E5DF] shadow-xs"
        }`} id="theme-settings-card">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-[6px] border ${
              theme === "dark" ? "bg-[#111111] border-[#303030] text-white" : "bg-white border-[#E1E5DF] text-[#171B18]"
            }`}>
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </div>
            <div>
              <p className={`text-xs font-bold tracking-wider uppercase font-meta leading-none ${theme === "dark" ? "text-gray-200" : "text-[#171B18]"}`}>
                DISPLAY MODE
              </p>
              <p className="text-[10px] text-[#A3A3A3] font-meta tracking-wide mt-0.5 uppercase">
                {theme === "dark" ? "Dark Theme Engaged" : "Light Theme Engaged"}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className={`px-2.5 py-1 min-h-[28px] rounded-[8px] text-[11px] font-meta uppercase font-bold tracking-wider border transition-all cursor-pointer ${
              theme === "dark"
                ? "bg-[#111111] text-[#A3A3A3] border-[#303030] hover:text-white"
                : "bg-white text-[#626862] border-[#E1E5DF] hover:text-black"
            }`}
            id="toggle-theme-btn"
          >
            SWITCH TO {theme === "dark" ? "LIGHT" : "DARK"}
          </button>
        </div>
      )}

      {/* Trust Score & Impact Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5" id="trust-impact-metrics">
        {/* Trust score dial */}
        <div className={`p-2.5 border rounded-[8px] flex items-center gap-2.5 transition-all duration-300 ${
          theme === "dark" ? "bg-[#191919] border-[#303030]" : "bg-[#F1F4EF] border-[#E1E5DF] shadow-xs"
        }`}>
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="22" cy="22" r="18" stroke={theme === "dark" ? "#303030" : "#E1E5DF"} strokeWidth="3.5" fill="transparent" />
              <circle
                cx="22"
                cy="22"
                r="18"
                stroke={theme === "dark" ? "#B7FF38" : "#537A00"}
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={113.1}
                strokeDashoffset={113.1 - (113.1 * user.trustScore) / 100}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className={`absolute text-[11px] font-black font-meta ${theme === "dark" ? "text-white" : "text-[#171B18]"}`}>{user.trustScore}</span>
          </div>
          <div>
            <div className={`flex items-center gap-1 text-[11px] font-meta uppercase font-bold tracking-wider ${theme === "dark" ? "text-[#A3A3A3]" : "text-[#626862]"}`}>
              <Award className="w-3.5 h-3.5 text-[#B7FF38]" />
              Trust Score
            </div>
            <p className="text-[10px] text-[#A3A3A3] font-meta uppercase mt-0.5 leading-tight">
              Crowd verifications & resolutions.
            </p>
          </div>
        </div>

        {/* My Impact card */}
        <div className={`p-2.5 border rounded-[8px] flex items-center gap-2.5 transition-all duration-300 ${
          theme === "dark" ? "bg-[#191919] border-[#303030]" : "bg-[#F1F4EF] border-[#E1E5DF] shadow-xs"
        }`}>
          <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 border ${
            theme === "dark" ? "bg-[#111111] border-[#303030] text-white" : "bg-white border-[#E1E5DF] text-[#171B18] shadow-xs"
          }`}>
            <Sparkles className="w-4 h-4 text-[#B7FF38]" />
          </div>
          <div>
            <div className={`text-[11px] font-meta uppercase font-bold tracking-wider flex items-center gap-1 ${theme === "dark" ? "text-[#A3A3A3]" : "text-[#626862]"}`}>
              <Flame className="w-3.5 h-3.5 text-[#B7FF38]" />
              My Impact
            </div>
            <p className={`text-lg font-display font-black tracking-tight leading-none mt-0.5 ${theme === "dark" ? "text-[#B7FF38]" : "text-[#537A00]"}`}>
              {impactScore}
            </p>
            <p className="text-[10px] text-[#A3A3A3] font-meta uppercase mt-0.5 leading-tight">
              Trust Score × Reports Filed
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className={`grid grid-cols-3 gap-0 border rounded-[8px] overflow-hidden transition-all duration-300 ${
        theme === "dark" ? "border-[#303030] bg-[#191919]" : "border-[#E1E5DF] bg-[#F1F4EF]"
      }`} id="profile-stats-row">
        {/* Total Posts */}
        <div className={`p-2 text-center border-r ${theme === "dark" ? "border-[#303030]" : "border-[#E1E5DF]"}`}>
          <p className="text-[10px] font-meta text-[#A3A3A3] uppercase tracking-wider leading-none mb-1">Posts</p>
          <div className={`flex items-center justify-center gap-1 ${theme === "dark" ? "text-white" : "text-[#171B18]"}`}>
            <FileText className="w-3 h-3" />
            <span className="text-xs font-black font-meta leading-none">{totalPosts}</span>
          </div>
        </div>

        {/* Reactions Received */}
        <div className={`p-2 text-center border-r ${theme === "dark" ? "border-[#303030]" : "border-[#E1E5DF]"}`}>
          <p className="text-[10px] font-meta text-[#A3A3A3] uppercase tracking-wider leading-none mb-1">Reactions</p>
          <div className={`flex items-center justify-center gap-1 ${theme === "dark" ? "text-white" : "text-[#171B18]"}`}>
            <ThumbsUp className="w-3 h-3" />
            <span className="text-xs font-black font-meta leading-none">{totalReactions}</span>
          </div>
        </div>

        {/* People Reached */}
        <div className="p-2 text-center">
          <p className="text-[10px] font-meta text-[#A3A3A3] uppercase tracking-wider leading-none mb-1">Reached</p>
          <div className={`flex items-center justify-center gap-1 ${theme === "dark" ? "text-white" : "text-[#171B18]"}`}>
            <Users className="w-3 h-3" />
            <span className="text-xs font-black font-meta leading-none">{peopleReached}</span>
          </div>
        </div>
      </div>

      {/* Civic Badges Row */}
      <div className="space-y-1.5" id="profile-civic-badges-row">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold font-meta uppercase tracking-wider flex items-center gap-1.5 ${theme === "dark" ? "text-[#A3A3A3]" : "text-[#626862]"}`}>
            <ShieldCheck className="w-3.5 h-3.5 text-[#B7FF38]" />
            Earned Civic Badges
          </h3>
          <span className="text-[10px] text-[#A3A3A3] font-meta">GAMIFIED MILESTONES</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {badges.map((badge) => {
            const BadgeIcon = BADGE_ICONS[badge.id] || HelpCircle;
            return (
              <div
                key={badge.id}
                className={`p-2 border rounded-[8px] flex flex-col items-center text-center transition-all relative overflow-hidden ${
                  badge.earned
                    ? theme === "dark"
                      ? "bg-[#191919] border-[#303030]"
                      : "bg-white border-[#E1E5DF] shadow-xs"
                    : theme === "dark"
                      ? "bg-transparent border-[#303030]/40 opacity-30 select-none"
                      : "bg-transparent border-gray-200 opacity-35 select-none"
                }`}
                title={badge.description}
              >
                {/* Badge Icon */}
                <BadgeIcon className={`w-4 h-4 mb-1 ${badge.earned ? (theme === "dark" ? "text-[#B7FF38]" : "text-[#537A00]") : "text-[#A3A3A3]"}`} />
                <p className={`text-[11px] font-bold uppercase tracking-wider leading-tight ${badge.earned ? (theme === "dark" ? "text-white" : "text-[#171B18]") : "text-[#A3A3A3]"}`}>
                  {badge.title}
                </p>
                <p className="text-[9.5px] text-[#A3A3A3] font-meta leading-normal mt-0.5 line-clamp-2 uppercase">
                  {badge.description}
                </p>

                {/* Verified badge status banner */}
                {badge.earned && (
                  <span className={`absolute top-0 right-0 w-2 h-2 rounded-bl-sm ${theme === "dark" ? "bg-[#B7FF38]" : "bg-[#537A00]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Score rules explanation / guide */}
      <div className={`p-2.5 border rounded-[8px] text-[11px] space-y-1.5 font-ui transition-all duration-300 ${
        theme === "dark" ? "bg-[#191919] border-[#303030] text-[#A3A3A3]" : "bg-[#F1F4EF] border-[#E1E5DF] text-[#626862] shadow-xs"
      }`}>
        <p className={`font-bold flex items-center gap-1.5 text-xs uppercase font-meta ${theme === "dark" ? "text-white" : "text-[#171B18]"}`}>
          <HelpCircle className="w-3.5 h-3.5 shrink-0 text-[#B7FF38]" />
          Trust Metric Operations
        </p>
        <ul className="list-disc pl-4 space-y-0.5 font-meta uppercase tracking-wide text-[10px]">
          <li>Community logs <span className={theme === "dark" ? "text-[#B7FF38] font-bold" : "text-[#537A00] font-bold"}>[+5 TS]</span> for every "Verified" reaction.</li>
          <li>Submitting fake logs <span className="text-red-500 font-bold">[-12 TS]</span> for "Cap" consensus.</li>
          <li>Official Status updates <span className={theme === "dark" ? "text-[#B7FF38] font-bold" : "text-[#537A00] font-bold"}>[up to +25 TS]</span> when issue is Resolved!</li>
        </ul>
      </div>

      {/* My Stories (Personal Complaint list) */}
      <div className="space-y-1.5" id="reporter-history-section">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold font-meta uppercase tracking-wider flex items-center gap-1.5 ${theme === "dark" ? "text-[#A3A3A3]" : "text-[#626862]"}`}>
            <FileText className="w-3.5 h-3.5 text-[#B7FF38]" />
            My Stories ({userIssues.length})
          </h3>
          <span className="text-[10px] text-[#A3A3A3] font-meta">REPORT REGISTRY</span>
        </div>

        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-none">
          {userIssues.length === 0 ? (
            <div className={`p-3 border rounded-[8px] text-center text-xs ${
              theme === "dark" ? "bg-[#191919] border-[#303030] text-[#A3A3A3]" : "bg-[#F1F4EF] border-[#E1E5DF] text-[#626862]"
            }`}>
              <p>You haven't filed any grid reports yet.</p>
              <p className="text-[10px] text-[#A3A3A3] font-meta mt-0.5 uppercase">TAP 'POST' IN FOOTER TO FILE AN INCIDENT</p>
            </div>
          ) : (
            userIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className={`py-2 px-2.5 border rounded-[8px] flex items-center justify-between cursor-pointer transition-all gap-2 ${
                  theme === "dark" ? "bg-[#191919] border-[#303030] hover:border-[#B7FF38]/40" : "bg-white border-[#E1E5DF] hover:border-[#537A00]/40 shadow-xs"
                }`}
                id={`history-item-${issue.id}`}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{
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
                    <span className={`text-[10.5px] font-meta uppercase font-bold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {issue.category}
                    </span>
                    <span className="text-[10px] text-[#A3A3A3] font-meta">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className={`text-xs font-bold tracking-tight truncate font-ui ${theme === "dark" ? "text-white" : "text-[#171B18]"}`}>{issue.title}</h4>
                  <div className="flex items-center gap-2.5 text-[10px] text-[#A3A3A3] font-meta uppercase">
                    <span>{issue.area}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5"><Check className="w-2.5 h-2.5 text-emerald-500" /> {issue.reactions.verified || 0}</span>
                      <span className="flex items-center gap-0.5"><Flag className="w-2.5 h-2.5 text-red-500" /> {issue.reactions.cap || 0}</span>
                      <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-amber-500" /> {issue.reactions.big_issue || 0}</span>
                      <span className="flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5 text-teal-400" /> {issue.reactions.bruh || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded-[5px] text-[10px] font-meta uppercase font-bold border ${
                    issue.status === "Resolved"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : issue.status === "Escalated"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : issue.status === "Verified"
                      ? (theme === "dark" ? "bg-[#B7FF38]/15 text-[#B7FF38] border-[#B7FF38]/30" : "bg-[#537A00]/15 text-[#537A00] border-[#537A00]/30")
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>
                    {issue.status}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
