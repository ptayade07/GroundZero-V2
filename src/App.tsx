/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Issue, DashboardMetrics, Category, Status, ReactionType } from "./types";
import LoginPage from "./components/LoginPage";
import LandingPage from "./components/LandingPage";
import MapComponent from "./components/MapComponent";
import IssuePopup from "./components/IssuePopup";
import ReportForm from "./components/ReportForm";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import UserProfile from "./components/UserProfile";
import SocialFeed from "./components/SocialFeed";
import Onboarding from "./components/Onboarding";
import SearchPage from "./components/SearchPage";
import Logo from "./components/Logo";
import { Map, Plus, BarChart3, User as UserIcon, ShieldAlert, Navigation, Layers, AlertCircle, Sparkles, Check, ChevronDown, ListFilter, SlidersHorizontal, MessageSquare, Search, X, Sun, Moon, Eye, EyeOff, LogOut, Shield, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ALL_CATEGORIES: Category[] = [
  "Civic Issue",
  "Pothole",
  "Flooding",
  "Power Cut",
  "Garbage",
  "Corruption",
  "Government Failure",
  "Protest / Rally",
  "Local Drama",
  "Argument / Dispute",
  "Harassment",
  "Breaking News",
  "Village Problem",
  "Weather",
  "War / Conflict",
  "Other"
];

const ALL_STATUSES: Status[] = [
  "Reported",
  "Verified",
  "Escalated",
  "Resolved"
];

export default function App() {
  // State managers
  const [user, setUser] = useState<User | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const onboardingCompleted = localStorage.getItem("gz_onboarding_completed") === "true";
        return !onboardingCompleted;
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  const [view, setView] = useState<"map" | "feed" | "search" | "report" | "profile">("map");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  
  // Profile sub-tab selector: "profile" (My Registry) vs "dashboard" (City Outrage)
  const [profileSubTab, setProfileSubTab] = useState<"registry" | "dashboard">("registry");

  // Theme state: dark by default, stored in localStorage
  const [theme, setTheme] = useState<"light" | "dark">(
    () => {
      if (typeof window !== "undefined") {
        try {
          return (localStorage.getItem("theme") as "light" | "dark") || "dark";
        } catch (e) {
          return "dark";
        }
      }
      return "dark";
    }
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
      } catch (e) {
        // Ignore
      }
    }
  }, [theme]);

  // Filter and Search for Map/Feed list
  const [categoryFilter, setCategoryFilter] = useState<Category[] | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status[] | "all">("all");
  const [draftCategoryFilter, setDraftCategoryFilter] = useState<Category[] | "all">("all");
  const [draftStatusFilter, setDraftStatusFilter] = useState<Status[] | "all">("all");

  const handleToggleDraftCategory = (cat: Category) => {
    if (draftCategoryFilter === "all") {
      setDraftCategoryFilter([cat]);
    } else {
      const exists = draftCategoryFilter.includes(cat);
      if (exists) {
        const next = draftCategoryFilter.filter(c => c !== cat);
        setDraftCategoryFilter(next.length === 0 ? "all" : next);
      } else {
        const next = [...draftCategoryFilter, cat];
        setDraftCategoryFilter(next.length === 16 ? "all" : next);
      }
    }
  };

  const handleToggleDraftStatus = (stat: Status) => {
    if (draftStatusFilter === "all") {
      setDraftStatusFilter([stat]);
    } else {
      const exists = draftStatusFilter.includes(stat);
      if (exists) {
        const next = draftStatusFilter.filter(s => s !== stat);
        setDraftStatusFilter(next.length === 0 ? "all" : next);
      } else {
        const next = [...draftStatusFilter, stat];
        setDraftStatusFilter(next.length === 4 ? "all" : next);
      }
    }
  };

  const [timeFilter, setTimeFilter] = useState<"2hrs" | "today" | "week" | "all">("today");
  const [showFeedDrawer, setShowFeedDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Report Form placement states
  const [isSelectingLocationMode, setIsSelectingLocationMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; area: string } | null>(null);
  const [preLinkedParentIssue, setPreLinkedParentIssue] = useState<Issue | null>(null);

  const handleAddPerspective = (parentId: string) => {
    const parentIssue = issues.find(i => i.id === parentId);
    if (parentIssue) {
      setPreLinkedParentIssue(parentIssue);
      setSelectedLocation({
        lat: parentIssue.lat,
        lng: parentIssue.lng,
        area: parentIssue.area
      });
      setSelectedIssue(null);
      setView("report");
      triggerToast(`Adding perspective linked to: "${parentIssue.title}"`);
    }
  };

  // Global loading and error message banners
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Auto-clear toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Fetch all issues from backend
  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (err) {
      console.error("Error fetching issues:", err);
    }
  };

  // Fetch dashboard metrics
  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/dashboard/metrics");
      if (res.ok) {
        const data = await res.json();
        setDashboardMetrics(data);
      }
    } catch (err) {
      console.error("Error fetching dashboard metrics:", err);
    }
  };

  // Refresh User Trust Score from database
  const refreshUserTrustScore = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, trustScore: data.trustScore } : null);
      }
    } catch (err) {
      console.error("Error refreshing trust score:", err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchIssues();
    fetchMetrics();

    // Recover login from localStorage if exists
    const storedUser = localStorage.getItem("gz_citizen");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setShowLanding(false);
        refreshUserTrustScore(parsed.id);
      } catch (e) {
        localStorage.removeItem("gz_citizen");
      }
    }
  }, []);

  // Sync metrics whenever issues refresh
  useEffect(() => {
    fetchMetrics();
    if (user) {
      refreshUserTrustScore(user.id);
    }
  }, [issues]);

  // Auth logins
  const handleLogin = async (email: string, name: string, isAnonymous: boolean) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, isAnonymous })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Login Failed");
      }

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("gz_citizen", JSON.stringify(data.user));
        triggerToast(`Welcome to GroundZero Grid, ${data.user.name}!`);
        setView("map");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Connection refused to GroundZero central server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setShowLanding(true);
    localStorage.removeItem("gz_citizen");
    triggerToast("Logged out of GroundZero operations grid.");
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem("gz_citizen", JSON.stringify(updatedUser));
    triggerToast(`Anonymity shield ${updatedUser.isAnonymous ? "activated" : "deactivated"}.`);
  };

  // Submitting a new issue report
  const handleReportSubmit = async (reportData: {
    description: string;
    category: Category | "";
    photoUrl: string;
    mediaUrls?: string[];
    mediaType?: 'photo' | 'video';
    parentIssueId?: string;
    lat: number;
    lng: number;
    isAnonymous: boolean;
    useAI: boolean;
  }) => {
    if (!user) return;

    const res = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...reportData,
        reporterId: user.id,
        useAI: reportData.useAI
      })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to log report.");
    }

    const data = await res.json();
    if (data.success) {
      // Re-fetch list
      await fetchIssues();
      
      // Reset creation states
      setSelectedLocation(null);
      setIsSelectingLocationMode(false);
      setPreLinkedParentIssue(null);
      setView("map");

      // Highlight newest report on map instantly
      setSelectedIssue(data.issue);

      if (data.aiAnalysis) {
        triggerToast(`Gemini AI detected Category: ${data.issue.category.toUpperCase()}`);
      } else {
        triggerToast("Civic report broadcasted onto the live radar map.");
      }
    }
  };

  // Community reacting to reports
  const handleReactToIssue = async (issueId: string, reactionType: ReactionType) => {
    if (!user) {
      triggerToast("Please authenticate to reaction-vouch reports.");
      return;
    }

    try {
      const res = await fetch(`/api/issues/${issueId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, reactionType })
      });

      if (res.ok) {
        const data = await res.json();
        // Update issues local state array
        setIssues(prev => prev.map(issue => issue.id === issueId ? data.issue : issue));
        
        // Update selected issue popup detail in place
        if (selectedIssue?.id === issueId) {
          setSelectedIssue(data.issue);
        }

        // Trigger dynamic reporter trust score recalculation updates
        await refreshUserTrustScore(user.id);

        triggerToast("Vouch reaction broadcasted. Trust Scores synchronized!");
      }
    } catch (err) {
      console.error("Error submitting reaction:", err);
    }
  };

  // Status updating (Sandboxed Admin Demonstration)
  const handleUpdateStatus = async (issueId: string, newStatus: Status) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setIssues(prev => prev.map(issue => issue.id === issueId ? data.issue : issue));
        if (selectedIssue?.id === issueId) {
          setSelectedIssue(data.issue);
        }
        triggerToast(`Municipal status updated to: ${newStatus}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Handle location selected from map clicking
  const handleSelectLocationForNewIssue = (lat: number, lng: number, area: string) => {
    setSelectedLocation({ lat, lng, area });
    setIsSelectingLocationMode(false);
    setView("report"); // Switch back to report form screen
    triggerToast(`Location pin placed at ${area} successfully.`);
  };

  const handleEnterLocationSelectionMode = () => {
    setIsSelectingLocationMode(true);
    setView("map"); // Swaps to map so they can tap on it
    setSelectedIssue(null); // Clear active popups
    triggerToast("Tap anywhere on the map to place complaint pin");
  };

  // Confirmation handler for "I See This Too"
  const handleSeeThisToo = async (issueId: string) => {
    if (!user) {
      triggerToast("Please authenticate to validate reports.");
      return;
    }

    try {
      const res = await fetch(`/api/issues/${issueId}/see-this-too`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });

      if (res.ok) {
        const data = await res.json();
        // Update issues local state array
        setIssues(prev => prev.map(issue => issue.id === issueId ? data.issue : issue));
        
        // Update selected issue popup detail in place
        if (selectedIssue?.id === issueId) {
          setSelectedIssue(data.issue);
        }

        const isConfirmed = data.issue.seeThisTooUsers?.includes(user.id);
        triggerToast(isConfirmed ? "Validation submitted! Pin glow synchronized." : "Your validation has been withdrawn.");
      }
    } catch (err) {
      console.error("Error confirming issue:", err);
    }
  };

  // Pre-filter issues strictly by time filter for the social feed
  const issuesFilteredByTime = issues.filter(issue => {
    let timeMatches = true;
    if (timeFilter !== "all") {
      const createdTime = new Date(issue.createdAt).getTime();
      const now = Date.now();
      const diffMs = now - createdTime;

      if (timeFilter === "2hrs") {
        timeMatches = diffMs <= 2 * 60 * 60 * 1000;
      } else if (timeFilter === "today") {
        const createdDate = new Date(issue.createdAt).toDateString();
        const todayDate = new Date().toDateString();
        timeMatches = createdDate === todayDate || diffMs <= 24 * 60 * 60 * 1000;
      } else if (timeFilter === "week") {
        timeMatches = diffMs <= 7 * 24 * 60 * 60 * 1000;
      }
    }
    return timeMatches;
  });

  // Filter issues based on UI selections
  const filteredIssues = issues.filter(issue => {
    const categoryMatches = categoryFilter === "all" || categoryFilter.includes(issue.category);
    const statusMatches = statusFilter === "all" || statusFilter.includes(issue.status);
    
    const query = searchQuery.trim().toLowerCase();
    let searchMatches = false;

    if (query === "") {
      searchMatches = true;
    } else {
      const textMatch = issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.area.toLowerCase().includes(query);

      let keywordTimeMatch = false;
      const createdTime = new Date(issue.createdAt).getTime();
      const now = Date.now();
      const diffMs = now - createdTime;

      if (query === "today") {
        const createdDate = new Date(issue.createdAt).toDateString();
        const todayDate = new Date().toDateString();
        keywordTimeMatch = createdDate === todayDate || diffMs <= 24 * 60 * 60 * 1000;
      } else if (query === "2hrs" || query === "2 hours" || query === "2h" || query === "recent") {
        keywordTimeMatch = diffMs <= 2 * 60 * 60 * 1000;
      } else if (query === "week" || query === "this week" || query === "7 days") {
        keywordTimeMatch = diffMs <= 7 * 24 * 60 * 60 * 1000;
      }

      searchMatches = textMatch || keywordTimeMatch;
    }

    // Default manual time filter logic
    let timeMatches = true;
    if (timeFilter !== "all" && query === "") {
      const createdTime = new Date(issue.createdAt).getTime();
      const now = Date.now();
      const diffMs = now - createdTime;

      if (timeFilter === "2hrs") {
        timeMatches = diffMs <= 2 * 60 * 60 * 1000;
      } else if (timeFilter === "today") {
        const createdDate = new Date(issue.createdAt).toDateString();
        const todayDate = new Date().toDateString();
        timeMatches = createdDate === todayDate || diffMs <= 24 * 60 * 60 * 1000;
      } else if (timeFilter === "week") {
        timeMatches = diffMs <= 7 * 24 * 60 * 60 * 1000;
      }
    }

    return categoryMatches && statusMatches && searchMatches && timeMatches;
  });

  if (showOnboarding) {
    return (
      <Onboarding
        theme={theme}
        onComplete={() => {
          localStorage.setItem("gz_onboarding_completed", "true");
          setShowOnboarding(false);
        }}
      />
    );
  }

  if (!user) {
    if (showLanding) {
      return (
        <LandingPage
          theme={theme}
          onLoginClick={() => setShowLanding(false)}
          onSignUpClick={() => setShowLanding(false)}
          onContinueAnonymously={() => handleLogin("", "", true)}
        />
      );
    } else {
      return (
        <div className={`w-full h-screen flex flex-col relative overflow-y-auto transition-all duration-300 ${
          theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-neutral-900'
        }`} id="login-container-wrapper">
          {/* Top Back navigation */}
          <div className="absolute top-6 left-6 z-50">
            <button
              onClick={() => setShowLanding(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border shadow-xl ${
                theme === 'dark' 
                  ? 'bg-[#141414] hover:bg-[#1f1f1f] text-gray-400 hover:text-white border-gray-900' 
                  : 'bg-white hover:bg-gray-50 text-gray-650 hover:text-black border-gray-200'
              }`}
              id="back-to-landing-btn"
            >
              ← Back
            </button>
          </div>
          <div className="w-full min-h-screen flex items-center justify-center py-16">
            <LoginPage onLogin={handleLogin} theme={theme} />
          </div>
        </div>
      );
    }
  }  return (
    <div className={`w-full h-screen flex flex-col select-none relative font-ui overflow-hidden transition-all duration-180 ${
      theme === "dark" ? "bg-black text-white" : "bg-[#FAFCFA] text-[#171B18]"
    }`} id="groundzero-root" data-theme={theme}>
      
      {/* Top operational banner header */}
      {view !== "feed" && (
        <header className={`px-3 h-10 border-b flex items-center justify-between backdrop-blur-md shrink-0 z-50 ${
          theme === 'dark' ? 'bg-black/95 border-[#303030] text-white' : 'bg-white/95 border-[#E1E5DF] text-[#171B18]'
        }`}>
          <div className="flex items-center gap-2">
            <Logo theme={theme} className="w-6 h-6 rounded-[6px] shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <h1 className={`text-xs sm:text-sm font-bold font-display tracking-wider uppercase leading-none ${
                  theme === 'dark' ? 'text-white' : 'text-[#171B18]'
                }`}>
                  GROUND<span className={theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}>ZERO</span>
                </h1>
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] text-[9.5px] font-bold font-meta tracking-wider uppercase border ${
                  theme === 'dark' 
                    ? 'bg-[#111111] border-[#303030] text-[#B7FF38]' 
                    : 'bg-[#F1F4EF] border-[#E1E5DF] text-[#537A00]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    theme === 'dark' ? 'bg-[#B7FF38]' : 'bg-[#537A00]'
                  }`} />
                  <span>LIVE</span>
                </span>
              </div>
            </div>
          </div>
 
          {/* Live radar indicators and trust score */}
          <div className="flex items-center gap-2">
            {user ? (
              <div 
                className="relative" 
                id="top-profile-badge-container"
                onMouseLeave={() => setIsProfileDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  onMouseEnter={() => setIsProfileDropdownOpen(true)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 min-h-[30px] rounded-[8px] text-xs cursor-pointer transition-all font-meta border ${
                    theme === 'dark' 
                      ? 'bg-[#111111] border-[#303030] text-white hover:border-[#B7FF38]/60 hover:bg-[#191919]' 
                      : 'bg-white border-[#E1E5DF] text-[#171B18] hover:border-[#537A00]/60 hover:bg-[#F1F4EF]'
                  }`}
                  id="top-profile-badge"
                  aria-label="User Profile Menu"
                >
                  {/* Profile picture or icon */}
                  <div className={`w-5 h-5 rounded-[5px] overflow-hidden flex items-center justify-center shrink-0 border ${
                    theme === 'dark' ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF]'
                  }`}>
                    {user.isAnonymous ? (
                      <EyeOff className="w-3 h-3 text-[#A3A3A3]" />
                    ) : user.avatarUrl ? (
                      user.avatarUrl.startsWith("data:") || user.avatarUrl.startsWith("http") ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[10px] font-bold leading-none select-none">{user.avatarUrl}</span>
                      )
                    ) : (
                      <UserIcon className="w-3 h-3 text-[#A3A3A3]" />
                    )}
                  </div>

                  <span className={`px-1.5 py-0.5 rounded-[5px] text-[11px] font-bold font-meta tracking-wide ${
                    theme === 'dark' ? 'bg-[#B7FF38]/15 text-[#B7FF38]' : 'bg-[#B7FF38]/25 text-[#537A00]'
                  }`}>
                    {user.trustScore} TS
                  </span>
                </button>

                {/* Sleek Dropdown Panel */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <>
                      {/* Invisible backdrop to click outside and close */}
                      <div 
                        className="fixed inset-0 z-45" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProfileDropdownOpen(false);
                        }} 
                        id="profile-dropdown-backdrop"
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                        className="absolute right-0 mt-1.5 w-56 rounded-[12px] border border-[#303030] bg-[#191919]/98 backdrop-blur-2xl text-white shadow-2xl p-2.5 flex flex-col gap-2 z-50 select-none max-w-[240px]"
                        id="profile-dropdown-panel"
                      >
                        {/* Top Profile Summary: Avatar, username, and trust score badge */}
                        <div className="flex items-center gap-2.5 pb-2 border-b border-[#303030]">
                          {/* Avatar Initials / Image */}
                          <div className="w-8 h-8 rounded-[6px] bg-[#111111] border border-[#303030] overflow-hidden flex items-center justify-center text-xs font-meta font-bold shrink-0 text-white shadow-inner">
                            {user.isAnonymous ? (
                              <EyeOff className="w-3.5 h-3.5 text-[#A3A3A3]" />
                            ) : user.avatarUrl && (user.avatarUrl.startsWith("data:") || user.avatarUrl.startsWith("http")) ? (
                              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span>{user.avatarUrl || user.name.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          {/* Name + Trust score */}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold tracking-tight font-ui truncate text-white">
                              {user.isAnonymous ? "Anonymous User" : user.name}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#B7FF38]/15 text-[#B7FF38] border border-[#B7FF38]/30 font-meta tracking-wide leading-none uppercase">
                                {user.trustScore} TS
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="flex flex-col gap-1.5">
                          
                          {/* 1. Civic Tea Feed */}
                          <button
                            onClick={() => {
                              setView("feed");
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full text-left py-1.5 px-2.5 rounded-[8px] hover:bg-white/[0.08] active:bg-white/[0.12] text-xs font-ui font-medium text-gray-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer min-h-[32px] border border-transparent hover:border-[#303030]"
                            id="profile-dropdown-civic-tea"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#B7FF38] shrink-0" />
                            <span>Civic Tea Feed</span>
                          </button>

                          {/* 2. My Profile */}
                          <button
                            onClick={() => {
                              setView("profile");
                              setProfileSubTab("registry");
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full text-left py-1.5 px-2.5 rounded-[8px] hover:bg-white/[0.08] active:bg-white/[0.12] text-xs font-ui font-medium text-gray-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer min-h-[32px] border border-transparent hover:border-[#303030]"
                            id="profile-dropdown-my-profile"
                          >
                            <UserIcon className="w-3.5 h-3.5 text-[#B7FF38] shrink-0" />
                            <span>My Profile</span>
                          </button>

                          {/* 2. My Stories */}
                          <button
                            onClick={() => {
                              setView("profile");
                              setProfileSubTab("registry");
                              setIsProfileDropdownOpen(false);
                              setTimeout(() => {
                                const el = document.getElementById("reporter-history-section");
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                                }
                              }, 100);
                            }}
                            className="w-full text-left py-1.5 px-2.5 rounded-[8px] hover:bg-white/[0.08] active:bg-white/[0.12] text-xs font-ui font-medium text-gray-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer min-h-[32px] border border-transparent hover:border-[#303030]"
                            id="profile-dropdown-my-stories"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#B7FF38] shrink-0" />
                            <span>My Stories</span>
                          </button>

                          {/* 3. Anonymous Shield toggle */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = { ...user, isAnonymous: !user.isAnonymous };
                              handleUpdateUser(updated);
                            }}
                            className="w-full text-left py-1.5 px-2.5 rounded-[8px] hover:bg-white/[0.08] active:bg-white/[0.12] text-xs font-ui font-medium text-gray-200 hover:text-white flex items-center justify-between transition-all cursor-pointer min-h-[32px] border border-transparent hover:border-[#303030]"
                            id="profile-dropdown-anon-shield"
                          >
                            <div className="flex items-center gap-2">
                              <Shield className={`w-3.5 h-3.5 shrink-0 ${user.isAnonymous ? "text-[#B7FF38]" : "text-[#A3A3A3]"}`} />
                              <span>Anon Shield</span>
                            </div>
                            <div className={`w-7 h-4 rounded-full p-0.5 border border-[#303030] transition-all ${user.isAnonymous ? "bg-[#B7FF38]" : "bg-[#111111]"}`}>
                              <div className={`w-3 h-3 rounded-full bg-black transition-all transform ${user.isAnonymous ? "translate-x-3" : "translate-x-0"}`} />
                            </div>
                          </div>

                          {/* 4. Theme switcher */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextTheme = theme === 'dark' ? 'light' : 'dark';
                              setTheme(nextTheme);
                              triggerToast(`Theme set to ${nextTheme.toUpperCase()}`);
                            }}
                            className="w-full text-left py-1.5 px-2.5 rounded-[8px] hover:bg-white/[0.08] active:bg-white/[0.12] text-xs font-ui font-medium text-gray-200 hover:text-white flex items-center justify-between transition-all cursor-pointer min-h-[32px] border border-transparent hover:border-[#303030]"
                            id="profile-dropdown-theme"
                          >
                            <div className="flex items-center gap-2">
                              {theme === 'dark' ? (
                                <Moon className="w-3.5 h-3.5 text-[#A3A3A3] shrink-0" />
                              ) : (
                                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                              <span>Theme: <span className="font-meta uppercase text-[11px]">{theme}</span></span>
                            </div>
                            <div className={`w-7 h-4 rounded-full p-0.5 border border-[#303030] transition-all ${theme === 'dark' ? "bg-[#B7FF38]" : "bg-gray-300"}`}>
                              <div className={`w-3 h-3 rounded-full bg-black transition-all transform ${theme === 'dark' ? "translate-x-3" : "translate-x-0"}`} />
                            </div>
                          </div>

                        </div>

                        {/* 5. Exit / Logout Button */}
                        <div className="border-t border-[#303030] pt-2 mt-0.5">
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full py-1.5 px-2.5 rounded-[8px] bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 active:bg-red-900/60 text-xs font-meta tracking-wider font-bold text-red-400 hover:text-red-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[32px]"
                            id="profile-dropdown-logout"
                          >
                            <LogOut className="w-3.5 h-3.5 shrink-0" />
                            <span>EXIT OPERATION</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-xs text-gray-500 font-mono tracking-wider flex items-center gap-1.5 uppercase">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                OFFLINE GRIDS
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main operational panel */}
      <main className="flex-1 relative overflow-hidden" id="main-grid-panel">
        {/* Main Views */}
        <div className="w-full h-full relative">
          
          {/* View 1: Feed & Map (Google Maps Engine) */}
          <div className={`w-full h-full absolute inset-0 ${view === "map" ? "flex flex-col" : "hidden"}`}>
            {/* Time Filter & Merged Dropdown Filter Row */}
            <div className={`w-full px-3 py-1.5 border-b flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0 z-40 transition-colors duration-180 ${
              theme === 'dark' ? 'bg-black border-[#303030]' : 'bg-[#FAFCFA] border-[#E1E5DF]'
            }`} id="time-filter-full-width-row">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none items-center flex-1 py-0.5">
                {(["2hrs", "today", "week", "all"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1 rounded-[10px] text-xs font-ui capitalize tracking-normal font-semibold transition-all duration-120 shrink-0 cursor-pointer border min-h-[28px] flex items-center justify-center ${
                      timeFilter === filter
                        ? 'bg-[#B7FF38] border-[#B7FF38] text-black shadow-xs font-bold'
                        : theme === 'dark'
                          ? 'bg-[#111111] border-[#303030] text-[#A3A3A3] hover:text-white hover:border-neutral-500'
                          : 'bg-[#F1F4EF] border-[#E1E5DF] text-[#626862] hover:text-[#171B18] hover:border-gray-400'
                    }`}
                  >
                    {filter === "2hrs" ? "2 hrs" : filter === "today" ? "Today" : filter === "week" ? "This week" : "All time"}
                  </button>
                ))}
              </div>

              {/* Merged Compact Filter Button & Dropdown Panel */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setDraftCategoryFilter(categoryFilter);
                    setDraftStatusFilter(statusFilter);
                    setIsFilterDropdownOpen(true);
                  }}
                  className={`px-3 py-1 rounded-[10px] text-xs font-ui font-semibold flex items-center gap-1.5 transition-all duration-120 cursor-pointer border min-h-[28px] ${
                    categoryFilter !== "all" || statusFilter !== "all"
                      ? theme === 'dark'
                        ? 'bg-[#B7FF38]/20 border-[#B7FF38] text-[#B7FF38] font-bold'
                        : 'bg-[#B7FF38]/30 border-[#537A00] text-[#537A00] font-bold'
                      : theme === 'dark'
                        ? 'bg-[#111111] border-[#303030] text-[#A3A3A3] hover:text-white hover:border-neutral-500'
                        : 'bg-[#F1F4EF] border-[#E1E5DF] text-[#626862] hover:text-[#171B18] hover:border-gray-400'
                  }`}
                  id="map-filter-toggle-btn"
                  aria-label="Filter Map Markers"
                >
                  <ListFilter className="w-3.5 h-3.5 shrink-0" />
                  <span>Filter</span>
                  
                  {/* Green dot indicator when active */}
                  {(categoryFilter !== "all" || statusFilter !== "all") && (
                    <span className="relative flex h-2 w-2" id="filter-active-indicator">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B7FF38]"></span>
                    </span>
                  )}
                </button>

                {/* Bottom Sheet Backdrop & Panel */}
                <AnimatePresence>
                  {isFilterDropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/75 z-[1100]"
                        onClick={() => setIsFilterDropdownOpen(false)}
                      />

                      {/* Bottom Sheet Panel */}
                      <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 260 }}
                        className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto rounded-t-[14px] border-t shadow-2xl z-[1200] flex flex-col max-h-[85vh] p-3.5 pb-4.5 backdrop-blur-2xl transition-colors duration-180 ${
                          theme === 'dark' 
                            ? 'bg-[#191919] border-[#303030] text-white' 
                            : 'bg-white border-[#E1E5DF] text-[#171B18]'
                        }`}
                        id="map-filter-bottom-sheet"
                      >
                        {/* Drag Handle */}
                        <div 
                          className={`w-10 h-1 rounded-full mx-auto mb-2.5 shrink-0 cursor-pointer ${
                            theme === 'dark' ? 'bg-[#303030]' : 'bg-[#E1E5DF]'
                          }`}
                          onClick={() => setIsFilterDropdownOpen(false)} 
                          id="bottom-sheet-drag-handle"
                        />

                        {/* Title Row */}
                        <div className="flex items-center justify-between mb-2.5 shrink-0">
                          <h3 className="text-xs font-meta font-bold tracking-wider uppercase text-[#A3A3A3]">
                            Map Filters
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setDraftCategoryFilter("all");
                              setDraftStatusFilter("all");
                              triggerToast("Draft filters reset to All");
                            }}
                            className={`text-xs font-ui font-medium px-2.5 py-1 rounded-[10px] transition-all cursor-pointer border min-h-[26px] ${
                              theme === 'dark'
                                ? 'border-[#303030] bg-[#111111] text-[#A3A3A3] hover:text-white hover:border-neutral-500'
                                : 'border-[#E1E5DF] bg-[#F1F4EF] text-[#626862] hover:text-[#171B18] hover:border-gray-400'
                            }`}
                            id="filter-reset-action"
                          >
                            Reset Draft
                          </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none mb-3">
                          
                          {/* 1. Category Section */}
                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-meta uppercase text-[#A3A3A3] font-bold tracking-wider flex items-center justify-between">
                              <span>Categories</span>
                              <span className="text-[#A3A3A3] font-meta font-normal text-[11px]">
                                {draftCategoryFilter === "all" ? "All active" : `${draftCategoryFilter.length} active`}
                              </span>
                            </span>
                            
                            <div className="flex flex-wrap gap-1.5">
                              {/* Category 'All' Pill */}
                              <button
                                type="button"
                                onClick={() => setDraftCategoryFilter("all")}
                                className={`px-3 py-1.5 rounded-[10px] text-xs font-ui font-semibold transition-all duration-120 cursor-pointer border min-h-[32px] flex items-center ${
                                  draftCategoryFilter === "all"
                                    ? 'bg-[#B7FF38] border-[#B7FF38] text-black font-bold shadow-xs'
                                    : theme === 'dark'
                                      ? 'bg-[#111111] border-[#303030] text-[#A3A3A3] hover:text-white hover:border-neutral-500'
                                      : 'bg-[#F1F4EF] border-[#E1E5DF] text-[#626862] hover:text-[#171B18] hover:border-gray-400'
                                }`}
                              >
                                All Categories
                              </button>

                              {/* 16 Category Pills */}
                              {ALL_CATEGORIES.map((cat) => {
                                const isSelected = draftCategoryFilter !== "all" && draftCategoryFilter.includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleToggleDraftCategory(cat)}
                                    className={`px-3 py-1.5 rounded-[10px] text-xs font-ui font-medium transition-all duration-120 cursor-pointer border min-h-[32px] flex items-center ${
                                      isSelected
                                        ? 'bg-[#B7FF38] border-[#B7FF38] text-black font-bold shadow-xs'
                                        : theme === 'dark'
                                          ? 'bg-[#111111] border-[#303030] text-[#A3A3A3] hover:text-white hover:border-neutral-500'
                                          : 'bg-[#F1F4EF] border-[#E1E5DF] text-[#626862] hover:text-[#171B18] hover:border-gray-400'
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. Status Section */}
                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-meta uppercase text-[#A3A3A3] font-bold tracking-wider flex items-center justify-between">
                              <span>Resolution Status</span>
                              <span className="text-[#A3A3A3] font-meta font-normal text-[11px]">
                                {draftStatusFilter === "all" ? "All active" : `${draftStatusFilter.length} active`}
                              </span>
                            </span>

                            <div className="flex flex-wrap gap-1.5">
                              {/* Status 'All' Pill */}
                              <button
                                type="button"
                                onClick={() => setDraftStatusFilter("all")}
                                className={`px-3 py-1.5 rounded-[10px] text-xs font-ui font-semibold transition-all duration-120 cursor-pointer border min-h-[32px] flex items-center ${
                                  draftStatusFilter === "all"
                                    ? 'bg-[#B7FF38] border-[#B7FF38] text-black font-bold shadow-xs'
                                    : theme === 'dark'
                                      ? 'bg-[#111111] border-[#303030] text-[#A3A3A3] hover:text-white hover:border-neutral-500'
                                      : 'bg-[#F1F4EF] border-[#E1E5DF] text-[#626862] hover:text-[#171B18] hover:border-gray-400'
                                }`}
                              >
                                All Statuses
                              </button>

                              {/* 4 Status Pills */}
                              {ALL_STATUSES.map((stat) => {
                                const isSelected = draftStatusFilter !== "all" && draftStatusFilter.includes(stat);
                                return (
                                  <button
                                    key={stat}
                                    type="button"
                                    onClick={() => handleToggleDraftStatus(stat)}
                                    className={`px-3 py-1.5 rounded-[10px] text-xs font-ui font-medium transition-all duration-120 cursor-pointer border min-h-[32px] flex items-center ${
                                      isSelected
                                        ? 'bg-[#B7FF38] border-[#B7FF38] text-black font-bold shadow-xs'
                                        : theme === 'dark'
                                          ? 'bg-[#111111] border-[#303030] text-[#A3A3A3] hover:text-white hover:border-neutral-500'
                                          : 'bg-[#F1F4EF] border-[#E1E5DF] text-[#626862] hover:text-[#171B18] hover:border-gray-400'
                                    }`}
                                  >
                                    {stat}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        {/* Bottom Actions Row */}
                        <div className={`flex items-center gap-2.5 mt-auto shrink-0 border-t pt-3 ${
                          theme === 'dark' ? 'border-[#303030]' : 'border-[#E1E5DF]'
                        }`}>
                          {/* Reset Option */}
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryFilter("all");
                              setStatusFilter("all");
                              setIsFilterDropdownOpen(false);
                              triggerToast("All filters reset successfully!");
                            }}
                            className={`flex-1 py-2 rounded-[10px] text-xs font-ui font-bold uppercase tracking-wider transition-all cursor-pointer border text-center min-h-[44px] flex items-center justify-center ${
                              theme === 'dark'
                                ? 'border-red-950/60 bg-red-950/20 text-red-400 hover:bg-red-950/40'
                                : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                            id="bottom-sheet-reset-all"
                          >
                            Reset All
                          </button>

                          {/* Apply Filters: Signature Primary Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryFilter(draftCategoryFilter);
                              setStatusFilter(draftStatusFilter);
                              setIsFilterDropdownOpen(false);
                              triggerToast("Map filters applied successfully!");
                            }}
                            className="flex-2 py-2 rounded-[10px] text-xs font-ui font-bold uppercase tracking-wider transition-all cursor-pointer border border-transparent bg-[#B7FF38] hover:bg-[#A6ED27] active:bg-[#94D91F] text-black text-center min-h-[44px] flex items-center justify-center"
                            id="bottom-sheet-apply-filters"
                          >
                            Apply Filters
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Google Maps Canvas Layer */}
            <div className="flex-1 w-full relative h-full">
              <MapComponent
                issues={filteredIssues}
                selectedIssue={selectedIssue}
                onSelectIssue={setSelectedIssue}
                onSelectLocationForNewIssue={handleSelectLocationForNewIssue}
                isSelectingLocationMode={isSelectingLocationMode}
                selectedLocation={selectedLocation}
                theme={theme}
              />

              {/* Clicked Map Pin Info Overlay Popup */}
              <AnimatePresence>
                {selectedIssue && (
                  <IssuePopup
                    issue={selectedIssue}
                    allIssues={issues}
                    currentUserId={user.id}
                    onClose={() => setSelectedIssue(null)}
                    onReact={handleReactToIssue}
                    onAddPerspective={handleAddPerspective}
                    onSelectPerspective={setSelectedIssue}
                    onSeeThisToo={handleSeeThisToo}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* View 2: Social Feed (Civic Tea) */}
          <div className={`w-full h-full absolute inset-0 ${view === "feed" ? "block overflow-hidden" : "hidden"}`}>
            <SocialFeed
              issues={issues}
              currentUserId={user.id}
              onSelectIssue={(issue) => {
                setSelectedIssue(issue);
                setView("map"); // Swaps to map to focus and show info popup
                triggerToast(`Centering map on: ${issue.title}`);
              }}
              onReact={handleReactToIssue}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              onSeeThisToo={handleSeeThisToo}
              onNavigateToSearch={() => setView("search")}
              onRefreshIssues={fetchIssues}
              onTriggerToast={triggerToast}
              theme={theme}
              onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            />
          </div>

          {/* View: Search Page */}
          <div className={`w-full h-full absolute inset-0 overflow-y-auto px-3.5 py-4 ${view === "search" ? "block" : "hidden"}`}>
            <SearchPage
              issues={issues}
              currentUserId={user.id}
              theme={theme}
              onSelectIssue={(issue) => {
                setSelectedIssue(issue);
                setView("map"); // Swaps to map to focus and show info popup
                triggerToast(`Centering map on: ${issue.title}`);
              }}
            />
          </div>

          {/* View 3: Report Form */}
          <div className={`w-full h-full absolute inset-0 overflow-y-auto px-3.5 py-4 ${view === "report" ? "block" : "hidden"}`}>
            <ReportForm
              onSubmit={handleReportSubmit}
              onCancel={() => {
                setSelectedLocation(null);
                setIsSelectingLocationMode(false);
                setPreLinkedParentIssue(null);
                setView("map");
              }}
              selectedLocation={selectedLocation}
              parentIssueId={preLinkedParentIssue?.id}
              parentIssue={preLinkedParentIssue}
              onClearParentIssue={() => {
                setPreLinkedParentIssue(null);
                setSelectedLocation(null);
              }}
              onEnterLocationSelectionMode={handleEnterLocationSelectionMode}
              onSelectLocation={handleSelectLocationForNewIssue}
              theme={theme}
            />
          </div>

          {/* View 4: Profile & Dashboard combined */}
          <div className={`w-full h-full absolute inset-0 overflow-y-auto px-3.5 py-4 ${view === "profile" ? "block" : "hidden"}`}>
            <div className={`max-w-lg mx-auto mb-3 border rounded-[10px] p-0.5 flex transition-all ${
              theme === "dark" ? "bg-[#111111] border-[#303030]" : "bg-[#F1F4EF] border-[#E1E5DF] shadow-xs"
            }`}>
              <button
                onClick={() => setProfileSubTab("registry")}
                className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1.5 font-ui ${
                  profileSubTab === "registry"
                    ? "bg-[#B7FF38] text-black font-bold shadow-xs"
                    : theme === "dark"
                      ? "text-[#A3A3A3] hover:text-white"
                      : "text-[#626862] hover:text-[#171B18]"
                }`}
                id="profile-subtab-registry"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => setProfileSubTab("dashboard")}
                className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1.5 font-ui ${
                  profileSubTab === "dashboard"
                    ? "bg-[#B7FF38] text-black font-bold shadow-xs"
                    : theme === "dark"
                      ? "text-[#A3A3A3] hover:text-white"
                      : "text-[#626862] hover:text-[#171B18]"
                }`}
                id="profile-subtab-dashboard"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Impact Dashboard</span>
              </button>
            </div>

            {profileSubTab === "registry" ? (
              <UserProfile
                user={user}
                issues={issues}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
                onSelectIssue={(issue) => {
                  setSelectedIssue(issue);
                  setView("map"); // Swaps to map to highlight selected history complaint
                }}
                theme={theme}
                onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              />
            ) : (
              <AnalyticsDashboard metrics={dashboardMetrics} theme={theme} />
            )}
          </div>

        </div>
      </main>

      {/* Global Bottom Navigation bar */}
      {user && (
        <nav className={`h-11 px-2 sm:px-6 border-t flex items-center justify-around shrink-0 z-50 backdrop-blur-md transition-all duration-180 ${
          theme === "dark" 
            ? "bg-black/95 border-[#303030] text-[#A3A3A3]" 
            : "bg-white/95 border-[#E1E5DF] shadow-md text-[#626862]"
        }`}>
          {/* Map Feed tab */}
          <button
            type="button"
            onClick={() => {
              setView("map");
              setIsSelectingLocationMode(false);
            }}
            className={`min-h-[34px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 py-0.5 px-2 rounded-[8px] transition-all cursor-pointer active:scale-95 ${
              view === "map" 
                ? theme === "dark" 
                  ? "text-[#B7FF38] font-bold" 
                  : "text-[#537A00] font-bold"
                : theme === "dark" 
                  ? "text-[#A3A3A3] hover:text-white" 
                  : "text-[#626862] hover:text-[#171B18]"
            }`}
            id="nav-map-btn"
          >
            <Map className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-ui font-semibold tracking-tight">Map</span>
          </button>
 
          {/* Social Feed Tab */}
          <button
            type="button"
            onClick={() => {
              setView("feed");
              setIsSelectingLocationMode(false);
            }}
            className={`min-h-[34px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 py-0.5 px-2 rounded-[8px] transition-all cursor-pointer active:scale-95 ${
              view === "feed" 
                ? theme === "dark" 
                  ? "text-[#B7FF38] font-bold" 
                  : "text-[#537A00] font-bold"
                : theme === "dark" 
                  ? "text-[#A3A3A3] hover:text-white" 
                  : "text-[#626862] hover:text-[#171B18]"
            }`}
            id="nav-feed-btn"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-ui font-semibold tracking-tight">Civic Tea</span>
          </button>
 
          {/* Search Tab */}
          <button
            type="button"
            onClick={() => {
              setView("search");
              setIsSelectingLocationMode(false);
            }}
            className={`min-h-[34px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 py-0.5 px-2 rounded-[8px] transition-all cursor-pointer active:scale-95 ${
              view === "search" 
                ? theme === "dark" 
                  ? "text-[#B7FF38] font-bold" 
                  : "text-[#537A00] font-bold"
                : theme === "dark" 
                  ? "text-[#A3A3A3] hover:text-white" 
                  : "text-[#626862] hover:text-[#171B18]"
            }`}
            id="nav-search-btn"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-ui font-semibold tracking-tight">Search</span>
          </button>
 
          {/* Report Tab */}
          <button
            type="button"
            onClick={() => {
              setView("report");
              setIsSelectingLocationMode(false);
            }}
            className={`min-h-[34px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 py-0.5 px-2 rounded-[8px] transition-all cursor-pointer active:scale-95 ${
              view === "report" 
                ? theme === "dark" 
                  ? "text-[#B7FF38] font-bold" 
                  : "text-[#537A00] font-bold"
                : theme === "dark" 
                  ? "text-[#A3A3A3] hover:text-white" 
                  : "text-[#626862] hover:text-[#171B18]"
            }`}
            id="nav-report-btn"
          >
            <div className={`p-0.5 rounded-[5px] ${view === "report" ? (theme === "dark" ? "bg-[#B7FF38]/20 border border-[#B7FF38]/50" : "bg-[#B7FF38]/30 border border-[#537A00]/50") : ""}`}>
              <Plus className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-[10px] font-ui font-semibold tracking-tight">Post</span>
          </button>
 
          {/* Profile tab */}
          <button
            type="button"
            onClick={() => {
              setView("profile");
              setIsSelectingLocationMode(false);
            }}
            className={`min-h-[34px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 py-0.5 px-2 rounded-[8px] transition-all cursor-pointer active:scale-95 ${
              view === "profile" 
                ? theme === "dark" 
                  ? "text-[#B7FF38] font-bold" 
                  : "text-[#537A00] font-bold"
                : theme === "dark" 
                  ? "text-[#A3A3A3] hover:text-white" 
                  : "text-[#626862] hover:text-[#171B18]"
            }`}
            id="nav-profile-btn"
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-ui font-semibold tracking-tight">Profile</span>
          </button>
        </nav>
      )}
 
      {/* Global Interactive Float Notifications (Toast) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-20 left-4 right-4 z-50 max-w-sm mx-auto pointer-events-none"
          >
            <div className="px-3.5 py-2.5 border border-[#B7FF38] text-xs font-bold font-ui rounded-[10px] flex items-center gap-2 backdrop-blur transition-all shadow-xl bg-[#B7FF38] text-black">
              <Sparkles className="w-4 h-4 text-black shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
