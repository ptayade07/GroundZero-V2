/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { DashboardMetrics, Category } from "../types";
import {
  ShieldCheck,
  HelpCircle,
  Activity,
  BarChart3,
  AlertCircle,
  Map,
  Search,
  Flame,
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
  Cloud
} from "lucide-react";

interface AnalyticsDashboardProps {
  metrics: DashboardMetrics | null;
  theme?: "light" | "dark";
}

const CATEGORY_ICONS: Record<Category, React.ComponentType<any>> = {
  "Civic Issue": Building,
  "Pothole": Construction,
  "Flooding": Waves,
  "Power Cut": Zap,
  "Garbage": Trash2,
  "Corruption": Scale,
  "Government Failure": Landmark,
  "Protest / Rally": Megaphone,
  "Local Drama": MessageCircle,
  "Argument / Dispute": MessageSquare,
  "Harassment": ShieldAlert,
  "Breaking News": Newspaper,
  "Village Problem": Home,
  "Weather": Cloud,
  "War / Conflict": Flame,
  "Other": HelpCircle
};

const CATEGORY_NAMES: Record<Category, string> = {
  "Civic Issue": "Civic Issue",
  "Pothole": "Pothole",
  "Flooding": "Flooding & Waterlogging",
  "Power Cut": "Power Cut / Outage",
  "Garbage": "Garbage & Waste",
  "Corruption": "Corruption & Graft",
  "Government Failure": "Government Failure",
  "Protest / Rally": "Protest / Rally",
  "Local Drama": "Local Drama",
  "Argument / Dispute": "Argument / Dispute",
  "Harassment": "Harassment",
  "Breaking News": "Breaking News",
  "Village Problem": "Village Problem",
  "Weather": "Weather Conditions",
  "War / Conflict": "War / Conflict",
  "Other": "Other"
};

const CATEGORY_COLORS: Record<Category, string> = {
  "Civic Issue": "bg-indigo-500",
  "Pothole": "bg-orange-500",
  "Flooding": "bg-blue-500",
  "Power Cut": "bg-yellow-500",
  "Garbage": "bg-amber-700",
  "Corruption": "bg-red-500",
  "Government Failure": "bg-red-700",
  "Protest / Rally": "bg-pink-500",
  "Local Drama": "bg-teal-500",
  "Argument / Dispute": "bg-rose-500",
  "Harassment": "bg-red-600",
  "Breaking News": "bg-cyan-500",
  "Village Problem": "bg-green-500",
  "Weather": "bg-sky-500",
  "War / Conflict": "bg-gray-700",
  "Other": "bg-gray-500"
};

export default function AnalyticsDashboard({ metrics, theme = "dark" }: AnalyticsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const isDark = theme === "dark";
  const greenColor = isDark ? "#39FF14" : "#2ECC0F";

  if (!metrics) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 gap-2 ${isDark ? 'text-gray-400' : 'text-gray-650'}`}>
        <Activity className={`w-8 h-8 animate-spin ${isDark ? 'text-[#39FF14]' : 'text-[#2ECC0F]'}`} />
        <p className={`text-xs font-mono uppercase tracking-widest ${isDark ? 'text-[#39FF14]' : 'text-[#2ECC0F]'}`}>Compiling radar metrics...</p>
      </div>
    );
  }

  const resolutionRate = metrics.totalIssues > 0
    ? Math.round((metrics.resolvedCount / metrics.totalIssues) * 100)
    : 0;

  // Filter area metrics based on search term
  const filteredAreas = Object.entries(metrics.byArea).filter(([areaName]) =>
    areaName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`w-full max-w-lg mx-auto border rounded-xl p-4 md:p-6 space-y-6 overflow-y-auto max-h-[85vh] scrollbar-none transition-all duration-300 ${
      isDark ? 'bg-black border-neutral-900 text-white' : 'bg-white border-gray-200 text-neutral-900 shadow-md'
    }`} id="analytics-dashboard-view">
      {/* Title */}
      <div>
        <h2 className={`text-base font-extrabold tracking-tight flex items-center gap-2 ${
          isDark ? 'text-[#39FF14]' : 'text-[#2ECC0F]'
        }`}>
          <Activity className="w-4 h-4" />
          MUNICIPAL IMPACT RADAR
        </h2>
        <p className={`text-[10px] font-mono uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>CIVIC RESOLUTION & ENGAGEMENT STATISTICS</p>
      </div>

      {/* Grid: 3 core counters */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className={`p-3 border rounded-lg transition-all ${
          isDark ? 'bg-black border-neutral-900' : 'bg-gray-50 border-gray-250 shadow-xs'
        }`}>
          <p className={`text-xl font-black font-mono ${isDark ? 'text-white' : 'text-neutral-900'}`}>{metrics.totalIssues}</p>
          <p className="text-[8px] text-gray-500 font-mono uppercase tracking-wide mt-1">TOTAL FILED</p>
        </div>
        <div className={`p-3 border rounded-lg transition-all ${
          isDark ? 'bg-[#39FF14]/5 border-[#39FF14]/20' : 'bg-red-50/40 border-red-200/40'
        }`}>
          <p className={`text-xl font-black font-mono ${isDark ? 'text-[#39FF14]' : 'text-red-500'}`}>{metrics.unresolvedCount}</p>
          <p className="text-[8px] text-gray-400 font-mono uppercase tracking-wide mt-1">ACTIVE ISSUES</p>
        </div>
        <div className={`p-3 border rounded-lg transition-all ${
          isDark ? 'bg-green-950/20 border border-green-500/30' : 'bg-emerald-50 border border-emerald-100'
        }`}>
          <p className={`text-xl font-black font-mono ${isDark ? 'text-green-400' : 'text-emerald-700'}`}>{metrics.resolvedCount}</p>
          <p className="text-[8px] text-gray-400 font-mono uppercase tracking-wide mt-1">RESOLVED</p>
        </div>
      </div>

      {/* Circle resolution meter */}
      <div className={`flex items-center gap-4 p-4 border rounded-xl transition-all ${
        isDark ? 'bg-black border-neutral-900' : 'bg-gray-50 border-gray-150'
      }`}>
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke={isDark ? "#141414" : "#e5e7eb"}
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke={isDark ? "#39FF14" : "#2ECC0F"} // Neon green brand accent
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={175.9}
              strokeDashoffset={175.9 - (175.9 * resolutionRate) / 100}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xs font-black font-mono ${isDark ? 'text-white' : 'text-neutral-950'}`}>{resolutionRate}%</span>
          </div>
        </div>
 
        <div>
          <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-neutral-900'}`}>Civic Resolution Speed</h3>
          <p className={`text-[10px] leading-normal mt-0.5 font-sans ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Official municipal bodies are acting faster. Currently resolving {resolutionRate}% of all community-verified citizen reports.
          </p>
        </div>
      </div>
 
      {/* Category Distribution Chart */}
      <div className="space-y-3" id="category-chart-section">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
            <BarChart3 className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-neutral-700'}`} />
            OUTRAGE BY CATEGORY
          </h3>
          <span className="text-[8px] text-gray-500 font-mono">SECTOR METRICS</span>
        </div>
 
        <div className={`space-y-2.5 p-3.5 border rounded-xl transition-all ${
          isDark ? 'bg-black border-neutral-900' : 'bg-gray-50 border-gray-150'
        }`}>
          {(Object.entries(metrics.byCategory) as [Category, number][]).map(([cat, count]) => {
            const pct = metrics.totalIssues > 0 ? (count / metrics.totalIssues) * 100 : 0;
            const barColor = CATEGORY_COLORS[cat];
            const name = CATEGORY_NAMES[cat];
            const IconComponent = CATEGORY_ICONS[cat] || HelpCircle;
 
            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                    {name}
                  </span>
                  <span className={`font-mono font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{count} reports ({Math.round(pct)}%)</span>
                </div>
                {/* Visual bar */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#141414]' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${Math.max(3, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Area-wise Heatmap list */}
      <div className="space-y-3" id="area-heatmap-section">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
            <Map className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-neutral-700'}`} />
            WARD HEATMAPS & LOCALITIES
          </h3>
          <span className="text-[8px] text-gray-500 font-mono">BY WARD AREA</span>
        </div>
 
        {/* Search filter for wards */}
        <div className="relative">
          <Search className={`absolute left-2.5 top-2 w-3.5 h-3.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search nearby neighborhoods (e.g., West End)..."
            className={`w-full pl-8 pr-3 py-1.5 text-[11px] rounded-lg outline-none transition-all ${
              isDark 
                ? 'bg-black border border-neutral-900 text-white placeholder-gray-600 focus:border-[#39FF14]/50'
                : 'bg-white border border-gray-250 text-neutral-900 placeholder-gray-400 focus:border-[#2ECC0F]/50 shadow-xs'
            }`}
            id="ward-search-input"
          />
        </div>
 
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {filteredAreas.length === 0 ? (
            <p className="text-[10px] text-gray-500 italic text-center py-4 font-sans">No data compiled for search query.</p>
          ) : (
            filteredAreas.map(([areaName, areaStats]) => {
              const areaTotal = areaStats.resolved + areaStats.unresolved;
              const areaResolvedPct = areaTotal > 0 ? (areaStats.resolved / areaTotal) * 100 : 0;
 
              return (
                <div key={areaName} className={`p-2.5 border rounded-lg flex flex-col gap-1.5 transition-all ${
                  isDark ? 'bg-black border-neutral-900' : 'bg-gray-50 border-gray-200 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>{areaName}</span>
                    <span className={`text-[9px] font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {areaStats.resolved} Res • {areaStats.unresolved} Active
                    </span>
                  </div>
 
                  {/* Multi-segmented resolution heatmap bar */}
                  <div className={`flex w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#141414]' : 'bg-gray-200'}`}>
                    {areaStats.resolved > 0 && (
                      <div
                        className={isDark ? "h-full bg-[#39FF14]" : "h-full bg-[#2ECC0F]"}
                        style={{ width: `${(areaStats.resolved / areaTotal) * 100}%` }}
                        title={`Resolved: ${areaStats.resolved}`}
                      />
                    )}
                    {areaStats.unresolved > 0 && (
                      <div
                        className="h-full bg-red-600"
                        style={{ width: `${(areaStats.unresolved / areaTotal) * 100}%` }}
                        title={`Active: ${areaStats.unresolved}`}
                      />
                    )}
                  </div>
 
                  <div className="flex justify-between items-center text-[8px] text-gray-500 font-mono uppercase tracking-wide">
                    <span>MUNICIPAL CLEANUP INDEX</span>
                    <span className={
                      areaResolvedPct >= 70 
                        ? `${isDark ? "text-[#39FF14]" : "text-[#2ECC0F]"} font-bold` 
                        : areaResolvedPct >= 40 
                          ? "text-yellow-600 font-bold" 
                          : "text-red-500 font-bold"
                    }>
                      {Math.round(areaResolvedPct)}% RECOVERY
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
 
      {/* Bottom disclaimer */}
      <div className={`p-2.5 border rounded-lg text-center text-[9px] flex items-center gap-1.5 justify-center transition-all ${
        isDark ? 'bg-black border-neutral-900 text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-600'
      }`}>
        <Flame className={`w-3.5 h-3.5 animate-pulse ${isDark ? 'text-[#39FF14]' : 'text-[#2ECC0F]'}`} />
        <span>GroundZero dashboard refreshes automatically as local ward officers resolve issues.</span>
      </div>
    </div>
  );
}
