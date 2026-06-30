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
import { Map, Plus, BarChart3, User as UserIcon, ShieldAlert, Navigation, Layers, AlertCircle, Sparkles, Check, ChevronDown, ListFilter, SlidersHorizontal, MessageSquare, Search, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [timeFilter, setTimeFilter] = useState<"2hrs" | "today" | "week" | "all">("today");
  const [showFeedDrawer, setShowFeedDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    const categoryMatches = categoryFilter === "all" || issue.category === categoryFilter;
    const statusMatches = statusFilter === "all" || issue.status === statusFilter;
    const searchMatches = searchQuery === "" ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.area.toLowerCase().includes(searchQuery.toLowerCase());

    // Time filter matching
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
            <div className={`px-2 py-1 rounded text-xs font-black font-mono shadow-md text-[#0A0A0A] ${
              theme === 'dark' ? 'bg-gradient-to-tr from-[#124d04] to-brand shadow-brand/20' : 'bg-gradient-to-tr from-[#2ECC0F] to-[#2ECC0F]/80 shadow-[#2ECC0F]/20 text-white'
            }`}>
              GZ
            </div>
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
              <p className="text-[8px] text-gray-500 font-mono leading-none tracking-widest uppercase mt-0.5">
                LIVE HYPERLOCAL CITIZEN GRID
              </p>
            </div>
          </div>
 
          {/* Live radar indicators and trust score */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-[#0a0a0a] border-neutral-800 text-gray-400 hover:text-white hover:border-neutral-700' 
                  : 'bg-white border-gray-200 text-gray-500 hover:text-black hover:border-gray-300 shadow-xs'
              }`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              id="top-theme-toggle"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {user ? (
              <div
                onClick={() => setView("profile")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-all font-mono border ${
                  theme === 'dark' 
                    ? 'bg-[#0A0A0A] border-gray-800 text-white hover:border-brand/40' 
                    : 'bg-white border-gray-250 text-neutral-850 hover:border-[#2ECC0F]/40 shadow-xs'
                }`}
                id="top-profile-badge"
              >
                <span className={`text-[10px] animate-pulse ${theme === 'dark' ? 'text-brand' : 'text-[#2ECC0F]'}`}>●</span>
                <span className={`font-sans font-medium line-clamp-1 max-w-[80px] text-[10px] ${
                  theme === 'dark' ? 'text-gray-400' : 'text-neutral-700'
                }`}>
                  {user.isAnonymous ? "Anonymous" : user.name.split(" ")[0]}
                </span>
                <span className={`px-1 py-0.2 rounded text-[8px] font-bold ${
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
          <div className={`w-full h-full absolute inset-0 ${view === "map" ? "block" : "hidden"}`}>
            {/* Filter Floating controls on Map */}
            <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 max-w-xs right-20">
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search radar reports..."
                  className="w-full pl-3 pr-8 py-2 text-xs bg-black border border-neutral-900 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/50 backdrop-blur"
                  id="radar-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2 text-gray-500 hover:text-white text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Time filter row below search bar */}
              <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none" id="radar-time-filters">
                {(["2hrs", "today", "week", "all"] as const).map((opt) => {
                  const label = {
                    "2hrs": "Last 2hrs",
                    "today": "Today",
                    "week": "This Week",
                    "all": "All Time"
                  }[opt];
                  return (
                    <button
                      key={opt}
                      onClick={() => setTimeFilter(opt)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider font-bold shrink-0 transition-all cursor-pointer border ${
                        timeFilter === opt
                          ? "bg-[#39FF14] text-black border-[#39FF14]"
                          : "bg-black text-gray-500 border-neutral-900 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Filters Collapse Row */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" id="radar-filters-row">
                {/* Category Filter selector */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="px-2 py-1 bg-black border border-neutral-900 rounded-md text-[10px] text-gray-300 font-mono outline-none focus:border-[#39FF14]/50"
                >
                  <option value="all">ALL SECTORS</option>
                  <option value="flood">🌊 FLOODS</option>
                  <option value="pothole">🕳️ POTHOLES</option>
                  <option value="crime">🚨 SECURITY</option>
                  <option value="power cut">🔌 POWER CUTS</option>
                  <option value="garbage">🗑️ GARBAGE</option>
                  <option value="protest">📣 PROTESTS</option>
                  <option value="event">🕺 EVENTS</option>
                  <option value="drama">🍵 LOCAL DRAMA</option>
                </select>

                {/* Status Filter selector */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2 py-1 bg-black border border-neutral-900 rounded-md text-[10px] text-gray-300 font-mono outline-none focus:border-[#39FF14]/50"
                >
                  <option value="all">ALL STATUS</option>
                  <option value="Reported">REPORTED</option>
                  <option value="Verified">VERIFIED</option>
                  <option value="Escalated">ESCALATED</option>
                  <option value="Resolved">RESOLVED</option>
                </select>

                {/* Toggle Drawer button */}
                <button
                  onClick={() => setShowFeedDrawer(!showFeedDrawer)}
                  className={`px-2 py-1 bg-black border rounded-md text-[10px] font-mono flex items-center gap-1 shrink-0 ${
                    showFeedDrawer ? "border-[#39FF14] text-[#39FF14]" : "border-neutral-900 text-gray-400 hover:text-white"
                  }`}
                >
                  <span>FEED LIST ({filteredIssues.length})</span>
                </button>
              </div>
            </div>

            {/* Collapsible Feed Drawer (Bottom/Side slide overlay list) */}
            <AnimatePresence>
              {showFeedDrawer && (
                <motion.div
                  initial={{ opacity: 0, x: -300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  className="absolute top-18 bottom-4 left-4 z-30 w-72 bg-black border border-neutral-900 rounded-xl p-3 flex flex-col backdrop-blur max-h-[72vh] md:max-h-[80vh]"
                  id="feed-list-drawer"
                >
                  <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">CIVIC COMPLAINT FEED</span>
                    <button
                      onClick={() => setShowFeedDrawer(false)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-all shrink-0 cursor-pointer"
                      id="close-feed-drawer-btn"
                      title="Close Feed"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                    {filteredIssues.length === 0 ? (
                      <p className="text-xs text-gray-600 italic text-center py-8">No issues logged on selected filters.</p>
                    ) : (
                      filteredIssues.map(issue => (
                        <div
                          key={issue.id}
                          onClick={() => {
                            setSelectedIssue(issue);
                            setShowFeedDrawer(false); // Close feed to show map pin zoom
                          }}
                          className={`p-2 bg-black hover:bg-neutral-950 border rounded-lg cursor-pointer transition-all flex flex-col gap-1 ${
                            selectedIssue?.id === issue.id ? "border-[#39FF14] bg-neutral-950" : "border-neutral-900"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase ${
                              issue.category === "flood" ? "bg-blue-950/40 text-blue-400" :
                              issue.category === "pothole" ? "bg-brand/15 text-brand" :
                              issue.category === "crime" ? "bg-red-950/40 text-red-400" :
                              issue.category === "power cut" ? "bg-yellow-950/40 text-yellow-400" :
                              issue.category === "protest" ? "bg-purple-950/40 text-purple-400" :
                              issue.category === "event" ? "bg-pink-950/40 text-pink-400" :
                              issue.category === "drama" ? "bg-teal-950/40 text-teal-400" :
                              "bg-amber-950/40 text-amber-500"
                            }`}>
                              {issue.category}
                            </span>
                            <span className="text-[8px] font-mono text-gray-500">{issue.area}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white leading-tight line-clamp-1">{issue.title}</h4>
                          <p className="text-[10px] text-gray-400 line-clamp-1 leading-snug">{issue.description}</p>
                          <div className="flex items-center justify-between text-[8px] text-gray-500 font-mono mt-0.5">
                            <span>✅ {issue.reactions.verified} vouches</span>
                            <span className="uppercase font-bold text-brand">{issue.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Maps Canvas Layer */}
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
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
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
                👤 My Profile
              </button>
              <button
                onClick={() => setProfileSubTab("dashboard")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
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
                📊 Impact Dashboard
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
