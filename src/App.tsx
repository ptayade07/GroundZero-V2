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
import { Map, Plus, BarChart3, User as UserIcon, ShieldAlert, Navigation, Layers, AlertCircle, Sparkles, Check, ChevronDown, ListFilter, SlidersHorizontal, MessageSquare, Search, X, Sun, Moon, Eye, EyeOff } from "lucide-react";
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
    <div className={`w-full h-screen flex flex-col select-none relative font-sans overflow-hidden transition-all duration-300 ${
      theme === "dark" ? "bg-[#0A0A0A] text-white" : "bg-[#FAFAFA] text-neutral-900"
    }`} id="groundzero-root">
      
      {/* Top operational banner header */}
      {view !== "feed" && (
        <header className={`px-4 py-3 border-b flex items-center justify-between backdrop-blur shrink-0 z-50 shadow-md ${
          theme === 'dark' ? 'bg-[#0A0A0A]/95 border-neutral-900 text-white' : 'bg-white/95 border-gray-200 text-neutral-900'
        }`}>
          <div className="flex items-center gap-2">
            <Logo theme={theme} className="w-7 h-7 rounded-lg" />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <h1 className={`text-sm font-black tracking-tight uppercase leading-none ${
                  theme === 'dark' ? 'text-white' : 'text-neutral-900'
                }`}>
                  GROUND<span className={theme === 'dark' ? 'text-brand' : 'text-[#2ECC0F]'}>ZERO</span>
                </h1>
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider uppercase border ${
                  theme === 'dark' 
                    ? 'bg-emerald-950/80 border-[#39FF14]/30 text-[#39FF14]' 
                    : 'bg-emerald-50 border-[#2ECC0F]/30 text-[#2ECC0F]'
                }`}>
                  <span className={`w-1 h-1 rounded-full animate-ping ${
                    theme === 'dark' ? 'bg-[#39FF14]' : 'bg-[#2ECC0F]'
                  }`} />
                  <span className="animate-pulse">LIVE</span>
                </span>
              </div>
            </div>
          </div>
 
          {/* Live radar indicators and trust score */}
          <div className="flex items-center gap-2">
            {user ? (
              <div
                onClick={() => setView("profile")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs cursor-pointer transition-all font-mono border ${
                  theme === 'dark' 
                    ? 'bg-[#0A0A0A] border-gray-800 text-white hover:border-brand/40' 
                    : 'bg-white border-gray-250 text-neutral-850 hover:border-[#2ECC0F]/40 shadow-xs'
                }`}
                id="top-profile-badge"
              >
                {/* Profile picture or icon */}
                <div className={`w-5 h-5 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${
                  theme === 'dark' ? 'bg-neutral-900 border-neutral-800' : 'bg-gray-100 border-gray-200'
                }`}>
                  {user.isAnonymous ? (
                    <EyeOff className="w-3 h-3 text-gray-400" />
                  ) : user.avatarUrl ? (
                    user.avatarUrl.startsWith("data:") || user.avatarUrl.startsWith("http") ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[10px] leading-none select-none">{user.avatarUrl}</span>
                    )
                  ) : (
                    <UserIcon className="w-3 h-3 text-gray-500" />
                  )}
                </div>

                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                  theme === 'dark' ? 'bg-brand/10 text-brand' : 'bg-[#2ECC0F]/10 text-[#2ECC0F]'
                }`}>
                  {user.trustScore} TS
                </span>
              </div>
            ) : (
              <div className="text-[9px] text-gray-500 font-mono tracking-wider flex items-center gap-1.5 uppercase">
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
            {/* Time Filter & Merged Dropdown Filter Row (Requirement 6 & 4) */}
            <div className={`w-full px-4 py-2 border-b flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0 z-40 transition-colors duration-300 ${
              theme === 'dark' ? 'bg-[#0A0A0A] border-neutral-900' : 'bg-white border-gray-200'
            }`} id="time-filter-full-width-row">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none items-center flex-1">
                {(["2hrs", "today", "week", "all"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider font-extrabold transition-all duration-300 shrink-0 cursor-pointer border ${
                      timeFilter === filter
                        ? theme === 'dark'
                          ? 'bg-[#39FF14] border-[#39FF14] text-black'
                          : 'bg-[#2ECC0F] border-[#2ECC0F] text-white shadow-xs'
                        : theme === 'dark'
                          ? 'bg-neutral-900 border-neutral-800 text-gray-400 hover:text-white'
                          : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-black'
                    }`}
                  >
                    {filter === "2hrs" ? "2hrs" : filter === "today" ? "today" : filter === "week" ? "this week" : "all time"}
                  </button>
                ))}
              </div>

              {/* Merged Compact Filter Button & Dropdown Panel */}
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    setDraftCategoryFilter(categoryFilter);
                    setDraftStatusFilter(statusFilter);
                    setIsFilterDropdownOpen(true);
                  }}
                  className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider font-extrabold flex items-center gap-1.5 transition-all duration-300 cursor-pointer border ${
                    categoryFilter !== "all" || statusFilter !== "all"
                      ? theme === 'dark'
                        ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14]'
                        : 'bg-[#2ECC0F]/15 border-[#2ECC0F] text-[#2ECC0F]'
                      : theme === 'dark'
                        ? 'bg-neutral-900 border-neutral-800 text-gray-400 hover:text-white'
                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-black'
                  }`}
                  id="map-filter-toggle-btn"
                >
                  <ListFilter className="w-3 h-3" />
                  <span>Filter</span>
                  
                  {/* Green dot indicator when active (Requirement 5) */}
                  {(categoryFilter !== "all" || statusFilter !== "all") && (
                    <span className="relative flex h-1.5 w-1.5 animate-pulse" id="filter-active-indicator">
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#39FF14]"></span>
                    </span>
                  )}
                </button>

                {/* Bottom Sheet Backdrop & Panel */}
                <AnimatePresence>
                  {isFilterDropdownOpen && (
                    <>
                      {/* Backdrop (Requirement 6) */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[1100]"
                        onClick={() => setIsFilterDropdownOpen(false)}
                      />

                      {/* Bottom Sheet Panel (Requirement 6) */}
                      <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 220 }}
                        className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto rounded-t-[24px] border-t shadow-2xl z-[1200] flex flex-col max-h-[85vh] p-5 pb-6 backdrop-blur-[20px] transition-colors duration-300 ${
                          theme === 'dark' 
                            ? 'bg-neutral-950/95 border-neutral-850 text-white' 
                            : 'bg-white/95 border-gray-200 text-neutral-900'
                        }`}
                        id="map-filter-bottom-sheet"
                      >
                        {/* Drag Handle (Requirement 6) */}
                        <div 
                          className="w-12 h-1 rounded-full bg-neutral-500/40 mx-auto mb-5 shrink-0 cursor-pointer hover:bg-neutral-500/60 transition-colors" 
                          onClick={() => setIsFilterDropdownOpen(false)} 
                          id="bottom-sheet-drag-handle"
                        />

                        {/* Title Row */}
                        <div className="flex items-center justify-between mb-4 shrink-0">
                          <h3 className="text-[10px] font-mono font-black tracking-widest uppercase text-gray-500">
                            MAP FILTER BOARD
                          </h3>
                          <button
                            onClick={() => {
                              setDraftCategoryFilter("all");
                              setDraftStatusFilter("all");
                              triggerToast("Draft filters reset to All");
                            }}
                            className={`text-[9px] font-mono uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md transition-all cursor-pointer border ${
                              theme === 'dark'
                                ? 'border-neutral-800 bg-neutral-900/40 text-gray-400 hover:text-white hover:border-neutral-700'
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:text-black hover:border-gray-300'
                            }`}
                            id="filter-reset-action"
                          >
                            Reset Draft
                          </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-none mb-6">
                          
                          {/* 1. Category Section (Requirement 1) */}
                          <div className="flex flex-col gap-2.5">
                            <span className="text-[9px] font-mono uppercase text-gray-400 font-extrabold tracking-wider flex items-center gap-1">
                              <span>SECTOR / CATEGORY</span>
                              <span className="text-gray-500 font-normal">
                                ({draftCategoryFilter === "all" ? "All Selected" : `${draftCategoryFilter.length} Selected`})
                              </span>
                            </span>
                            
                            <div className="flex flex-wrap gap-1.5">
                              {/* Category 'All' Pill */}
                              <button
                                onClick={() => setDraftCategoryFilter("all")}
                                className={`px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer border ${
                                  draftCategoryFilter === "all"
                                    ? theme === 'dark'
                                      ? 'bg-[#39FF14] border-[#39FF14] text-black font-extrabold shadow-sm'
                                      : 'bg-[#2ECC0F] border-[#2ECC0F] text-white font-extrabold shadow-sm'
                                    : theme === 'dark'
                                      ? 'bg-neutral-900/60 border-neutral-850 text-gray-400 hover:text-white hover:border-neutral-700'
                                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-black hover:border-gray-300'
                                }`}
                              >
                                ALL CATEGORIES
                              </button>

                              {/* 16 Category Pills */}
                              {ALL_CATEGORIES.map((cat) => {
                                const isSelected = draftCategoryFilter !== "all" && draftCategoryFilter.includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    onClick={() => handleToggleDraftCategory(cat)}
                                    className={`px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer border ${
                                      isSelected
                                        ? theme === 'dark'
                                          ? 'bg-[#39FF14]/20 border-[#39FF14] text-[#39FF14] font-extrabold shadow-xs'
                                          : 'bg-[#2ECC0F]/15 border-[#2ECC0F] text-[#2ECC0F] font-extrabold shadow-xs'
                                        : theme === 'dark'
                                          ? 'bg-neutral-900/30 border-neutral-850 text-gray-400 hover:text-white hover:border-neutral-700'
                                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-black hover:border-gray-300'
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. Status Section (Requirement 2) */}
                          <div className="flex flex-col gap-2.5">
                            <span className="text-[9px] font-mono uppercase text-gray-400 font-extrabold tracking-wider flex items-center gap-1">
                              <span>MUNICIPAL RESOLUTION STATUS</span>
                              <span className="text-gray-500 font-normal">
                                ({draftStatusFilter === "all" ? "All Selected" : `${draftStatusFilter.length} Selected`})
                              </span>
                            </span>

                            <div className="flex flex-wrap gap-1.5">
                              {/* Status 'All' Pill */}
                              <button
                                onClick={() => setDraftStatusFilter("all")}
                                className={`px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer border ${
                                  draftStatusFilter === "all"
                                    ? theme === 'dark'
                                      ? 'bg-[#39FF14] border-[#39FF14] text-black font-extrabold shadow-sm'
                                      : 'bg-[#2ECC0F] border-[#2ECC0F] text-white font-extrabold shadow-sm'
                                    : theme === 'dark'
                                      ? 'bg-neutral-900/60 border-neutral-850 text-gray-400 hover:text-white hover:border-neutral-700'
                                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-black hover:border-gray-300'
                                }`}
                              >
                                ALL STATUSES
                              </button>

                              {/* 4 Status Pills */}
                              {ALL_STATUSES.map((stat) => {
                                const isSelected = draftStatusFilter !== "all" && draftStatusFilter.includes(stat);
                                return (
                                  <button
                                    key={stat}
                                    onClick={() => handleToggleDraftStatus(stat)}
                                    className={`px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer border ${
                                      isSelected
                                        ? theme === 'dark'
                                          ? 'bg-[#39FF14]/20 border-[#39FF14] text-[#39FF14] font-extrabold shadow-xs'
                                          : 'bg-[#2ECC0F]/15 border-[#2ECC0F] text-[#2ECC0F] font-extrabold shadow-xs'
                                        : theme === 'dark'
                                          ? 'bg-neutral-900/30 border-neutral-850 text-gray-400 hover:text-white hover:border-neutral-700'
                                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-black hover:border-gray-300'
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
                        <div className="flex items-center gap-3 mt-auto shrink-0 border-t pt-4 border-neutral-800/10 dark:border-white/5">
                          {/* Reset Option (Requirement 4) */}
                          <button
                            onClick={() => {
                              setCategoryFilter("all");
                              setStatusFilter("all");
                              setIsFilterDropdownOpen(false);
                              triggerToast("All filters reset successfully!");
                            }}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-mono uppercase tracking-widest font-black transition-all cursor-pointer border text-center ${
                              theme === 'dark'
                                ? 'border-red-950 bg-red-950/20 text-red-400 hover:bg-red-950/40'
                                : 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                            id="bottom-sheet-reset-all"
                          >
                            Reset
                          </button>

                          {/* Apply Filters (Requirement 3) */}
                          <button
                            onClick={() => {
                              setCategoryFilter(draftCategoryFilter);
                              setStatusFilter(draftStatusFilter);
                              setIsFilterDropdownOpen(false);
                              triggerToast("Map filters applied successfully!");
                            }}
                            className={`flex-2 py-3 rounded-xl text-[10px] font-mono uppercase tracking-widest font-black transition-all cursor-pointer border text-center ${
                              theme === 'dark'
                                ? 'bg-[#39FF14] border-[#39FF14] text-black hover:bg-[#39FF14]/90'
                                : 'bg-[#2ECC0F] border-[#2ECC0F] text-white hover:bg-[#2ECC0F]/90 shadow-md'
                            }`}
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

          {/* View 2: Social Feed */}
          <div className={`w-full h-full absolute inset-0 ${view === "feed" ? "block overflow-hidden" : "hidden"}`}>
            <SocialFeed
              issues={issuesFilteredByTime}
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
            />
          </div>

          {/* View: Search Page */}
          <div className={`w-full h-full absolute inset-0 overflow-y-auto px-4 py-6 ${view === "search" ? "block" : "hidden"}`}>
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
          <div className={`w-full h-full absolute inset-0 overflow-y-auto px-4 py-6 ${view === "report" ? "block" : "hidden"}`}>
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
          <div className={`w-full h-full absolute inset-0 overflow-y-auto px-4 py-6 ${view === "profile" ? "block" : "hidden"}`}>
            <div className={`max-w-lg mx-auto mb-4 border rounded-xl p-1 flex transition-all ${
              theme === "dark" ? "bg-black border-neutral-900" : "bg-gray-150 border-gray-200 shadow-xs"
            }`}>
              <button
                onClick={() => setProfileSubTab("registry")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  profileSubTab === "registry"
                    ? theme === "dark"
                      ? "bg-[#39FF14] text-black font-black"
                      : "bg-[#2ECC0F] text-white font-black shadow-xs"
                    : theme === "dark"
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-neutral-900"
                }`}
                id="profile-subtab-registry"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => setProfileSubTab("dashboard")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  profileSubTab === "dashboard"
                    ? theme === "dark"
                      ? "bg-[#39FF14] text-black font-black"
                      : "bg-[#2ECC0F] text-white font-black shadow-xs"
                    : theme === "dark"
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-neutral-900"
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
        <nav className={`px-4 py-2 border-t flex items-center justify-around shrink-0 z-50 backdrop-blur transition-all duration-300 ${
          theme === "dark" 
            ? "bg-black border-neutral-900" 
            : "bg-white border-gray-200 shadow-md text-neutral-800"
        }`}>
          {/* Map Feed tab */}
          <button
            onClick={() => {
              setView("map");
              setIsSelectingLocationMode(false);
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
              view === "map" 
                ? theme === "dark" 
                  ? "text-[#39FF14] font-extrabold" 
                  : "text-[#2ECC0F] font-extrabold"
                : theme === "dark" 
                  ? "text-gray-400 hover:text-white" 
                  : "text-gray-500 hover:text-neutral-900"
            }`}
            id="nav-map-btn"
          >
            <Map className="w-5 h-5" />
            <span className="text-[8px] font-mono uppercase tracking-wide">Map</span>
          </button>
 
          {/* Social Feed Tab */}
          <button
            onClick={() => {
              setView("feed");
              setIsSelectingLocationMode(false);
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
              view === "feed" 
                ? theme === "dark" 
                  ? "text-[#39FF14] font-extrabold" 
                  : "text-[#2ECC0F] font-extrabold"
                : theme === "dark" 
                  ? "text-gray-400 hover:text-white" 
                  : "text-gray-500 hover:text-neutral-900"
            }`}
            id="nav-feed-btn"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[8px] font-mono uppercase tracking-wide">Civic Tea</span>
          </button>
 
          {/* Search Tab */}
          <button
            onClick={() => {
              setView("search");
              setIsSelectingLocationMode(false);
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
              view === "search" 
                ? theme === "dark" 
                  ? "text-[#39FF14] font-extrabold" 
                  : "text-[#2ECC0F] font-extrabold"
                : theme === "dark" 
                  ? "text-gray-400 hover:text-white" 
                  : "text-gray-500 hover:text-neutral-900"
            }`}
            id="nav-search-btn"
          >
            <Search className="w-5 h-5" />
            <span className="text-[8px] font-mono uppercase tracking-wide">Search</span>
          </button>
 
          {/* Report Tab */}
          <button
            onClick={() => {
              setView("report");
              setIsSelectingLocationMode(false);
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
              view === "report" 
                ? theme === "dark" 
                  ? "text-[#39FF14] font-extrabold" 
                  : "text-[#2ECC0F] font-extrabold"
                : theme === "dark" 
                  ? "text-gray-400 hover:text-white" 
                  : "text-gray-500 hover:text-neutral-900"
            }`}
            id="nav-report-btn"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[8px] font-mono uppercase tracking-wide">Post</span>
          </button>
 
          {/* Profile tab */}
          <button
            onClick={() => {
              setView("profile");
              setIsSelectingLocationMode(false);
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
              view === "profile" 
                ? theme === "dark" 
                  ? "text-[#39FF14] font-extrabold" 
                  : "text-[#2ECC0F] font-extrabold"
                : theme === "dark" 
                  ? "text-gray-400 hover:text-white" 
                  : "text-gray-500 hover:text-neutral-900"
            }`}
            id="nav-profile-btn"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[8px] font-mono uppercase tracking-wide">Profile</span>
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
            <div className={`px-3 py-2.5 border text-xs font-black rounded-xl flex items-center gap-2 backdrop-blur transition-all ${
              theme === "dark"
                ? "bg-[#39FF14] border-[#39FF14] text-black"
                : "bg-[#2ECC0F] border-[#2ECC0F] text-white"
            }`}>
              <Sparkles className={`w-4 h-4 animate-pulse ${theme === "dark" ? "text-black" : "text-white"}`} />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
