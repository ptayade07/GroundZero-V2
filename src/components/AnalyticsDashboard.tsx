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
  const greenColor = isDark ? "#B7FF38" : "#537A00";

  if (!metrics) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 gap-2 font-ui ${isDark ? 'text-[#A3A3A3]' : 'text-[#626862]'}`}>
        <Activity className={`w-8 h-8 animate-spin ${isDark ? 'text-[#B7FF38]' : 'text-[#537A00]'}`} />
        <p className={`text-xs font-meta uppercase tracking-widest ${isDark ? 'text-[#B7FF38]' : 'text-[#537A00]'}`}>Compiling radar metrics...</p>
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
    <div className={`w-full max-w-md mx-auto border rounded-[12px] p-3 space-y-3 overflow-y-auto max-h-[85vh] scrollbar-none font-ui transition-all duration-300 ${
      isDark ? 'bg-[#111111] border-[#303030] text-white' : 'bg-white border-[#E1E5DF] text-[#171B18] shadow-md'
    }`} id="analytics-dashboard-view">
      {/* Title */}
      <div>
        <h2 className={`text-sm font-display font-black tracking-wide flex items-center gap-1.5 ${
          isDark ? 'text-[#B7FF38]' : 'text-[#537A00]'
        }`}>
          <Activity className="w-3.5 h-3.5" />
          MUNICIPAL IMPACT RADAR
        </h2>
        <p className={`text-[11px] font-meta uppercase mt-0.5 ${isDark ? 'text-[#A3A3A3]' : 'text-[#626862]'}`}>CIVIC RESOLUTION & ENGAGEMENT STATISTICS</p>
      </div>

      {/* Grid: 3 core counters */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className={`p-2 border rounded-[8px] transition-all ${
          isDark ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF] shadow-xs'
        }`}>
          <p className={`text-lg font-display font-black ${isDark ? 'text-white' : 'text-[#171B18]'}`}>{metrics.totalIssues}</p>
          <p className="text-[9px] text-[#A3A3A3] font-meta uppercase tracking-wider mt-0.5">TOTAL FILED</p>
        </div>
        <div className={`p-2 border rounded-[8px] transition-all ${
          isDark ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF]'
        }`}>
          <p className={`text-lg font-display font-black ${isDark ? 'text-[#B7FF38]' : 'text-[#537A00]'}`}>{metrics.unresolvedCount}</p>
          <p className="text-[9px] text-[#A3A3A3] font-meta uppercase tracking-wider mt-0.5">ACTIVE ISSUES</p>
        </div>
        <div className={`p-2 border rounded-[8px] transition-all ${
          isDark ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF]'
        }`}>
          <p className={`text-lg font-display font-black ${isDark ? 'text-white' : 'text-[#171B18]'}`}>{metrics.resolvedCount}</p>
          <p className="text-[9px] text-[#A3A3A3] font-meta uppercase tracking-wider mt-0.5">RESOLVED</p>
        </div>
      </div>

      {/* Circle resolution meter */}
      <div className={`flex items-center gap-2.5 p-2.5 border rounded-[8px] transition-all font-ui ${
        isDark ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF]'
      }`}>
        <div className="relative w-12 h-12 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke={isDark ? "#303030" : "#E1E5DF"}
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke={isDark ? "#B7FF38" : "#537A00"} // Signature UI Hyperlime accent
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={125.6}
              strokeDashoffset={125.6 - (125.6 * resolutionRate) / 100}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-[11px] font-black font-meta ${isDark ? 'text-white' : 'text-[#171B18]'}`}>{resolutionRate}%</span>
          </div>
        </div>
 
        <div>
          <h3 className={`text-xs font-bold uppercase tracking-wider font-display ${isDark ? 'text-white' : 'text-[#171B18]'}`}>Civic Resolution Speed</h3>
          <p className={`text-[11px] leading-snug mt-0.5 ${isDark ? 'text-[#A3A3A3]' : 'text-[#626862]'}`}>
            Official municipal bodies are acting faster. Currently resolving {resolutionRate}% of all community-verified citizen reports.
          </p>
        </div>
      </div>
 
      {/* Category Distribution Chart */}
      <div className="space-y-2" id="category-chart-section">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold font-meta uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#A3A3A3]' : 'text-[#626862]'}`}>
            <BarChart3 className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-[#171B18]'}`} />
            OUTRAGE BY CATEGORY
          </h3>
          <span className="text-xs text-[#A3A3A3] font-meta">SECTOR METRICS</span>
        </div>
 
        <div className={`space-y-2.5 p-3 border rounded-[10px] transition-all ${
          isDark ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF]'
        }`}>
          {(Object.entries(metrics.byCategory) as [Category, number][]).map(([cat, count]) => {
            const pct = metrics.totalIssues > 0 ? (count / metrics.totalIssues) * 100 : 0;
            const barColor = CATEGORY_COLORS[cat];
            const name = CATEGORY_NAMES[cat];
            const IconComponent = CATEGORY_ICONS[cat] || HelpCircle;
 
            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                    {name}
                  </span>
                  <span className={`font-meta font-bold ${isDark ? 'text-[#A3A3A3]' : 'text-[#626862]'}`}>{count} reports ({Math.round(pct)}%)</span>
                </div>
                {/* Visual bar */}
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#111111]' : 'bg-gray-200'}`}>
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
      <div className="space-y-2" id="area-heatmap-section">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold font-meta uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#A3A3A3]' : 'text-[#626862]'}`}>
            <Map className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-[#171B18]'}`} />
            WARD HEATMAPS & LOCALITIES
          </h3>
          <span className="text-xs text-[#A3A3A3] font-meta">BY WARD AREA</span>
        </div>
 
        {/* Search filter for wards */}
        <div className="relative">
          <Search className={`absolute left-2.5 top-2.5 w-3.5 h-3.5 ${isDark ? 'text-[#A3A3A3]' : 'text-[#626862]'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search nearby neighborhoods (e.g., West End)..."
            className={`w-full pl-8 pr-3 py-1.5 min-h-[34px] text-xs rounded-[8px] outline-none transition-all font-ui ${
              isDark 
                ? 'bg-[#111111] border border-[#303030] text-white placeholder-gray-500 focus:border-[#B7FF38]/50'
                : 'bg-white border border-[#E1E5DF] text-[#171B18] placeholder-gray-400 focus:border-[#537A00]/50 shadow-xs'
            }`}
            id="ward-search-input"
          />
        </div>
 
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-none">
          {filteredAreas.length === 0 ? (
            <p className="text-xs text-[#A3A3A3] italic text-center py-3 font-ui">No data compiled for search query.</p>
          ) : (
            filteredAreas.map(([areaName, areaStats]) => {
              const areaTotal = areaStats.resolved + areaStats.unresolved;
              const areaResolvedPct = areaTotal > 0 ? (areaStats.resolved / areaTotal) * 100 : 0;
 
              return (
                <div key={areaName} className={`p-2.5 border rounded-[8px] flex flex-col gap-1 transition-all ${
                  isDark ? 'bg-[#111111] border-[#303030]' : 'bg-white border-[#E1E5DF] shadow-xs'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold font-ui tracking-tight ${isDark ? 'text-white' : 'text-[#171B18]'}`}>{areaName}</span>
                    <span className={`text-[10.5px] font-meta ${isDark ? 'text-[#A3A3A3]' : 'text-[#626862]'}`}>
                      {areaStats.resolved} Res • {areaStats.unresolved} Active
                    </span>
                  </div>
 
                  {/* Multi-segmented resolution heatmap bar */}
                  <div className={`flex w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#191919]' : 'bg-gray-250'}`}>
                    {areaStats.resolved > 0 && (
                      <div
                        className={isDark ? "h-full bg-[#B7FF38]" : "h-full bg-[#537A00]"}
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
 
                  <div className="flex justify-between items-center text-[9.5px] text-[#A3A3A3] font-meta uppercase tracking-wide">
                    <span>MUNICIPAL CLEANUP INDEX</span>
                    <span className={
                      areaResolvedPct >= 70 
                        ? `${isDark ? "text-[#B7FF38]" : "text-[#537A00]"} font-bold` 
                        : areaResolvedPct >= 40 
                          ? "text-yellow-500 font-bold" 
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
      <div className={`p-2 border rounded-[8px] text-center text-[10.5px] font-meta flex items-center gap-1.5 justify-center transition-all ${
        isDark ? 'bg-[#191919] border-[#303030] text-[#A3A3A3]' : 'bg-[#F1F4EF] border-[#E1E5DF] text-[#626862]'
      }`}>
        <Flame className={`w-3 h-3 animate-pulse shrink-0 ${isDark ? 'text-[#B7FF38]' : 'text-[#537A00]'}`} />
        <span>GroundZero dashboard refreshes automatically as local ward officers resolve issues.</span>
      </div>
    </div>
  );
}
