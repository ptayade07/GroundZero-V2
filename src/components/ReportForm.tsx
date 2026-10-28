/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Category } from "../types";
import {
  Camera,
  MapPin,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  EyeOff,
  ShieldAlert,
  ArrowLeft,
  Navigation,
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
  Cpu,
  Link
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReportFormProps {
  onSubmit: (data: {
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
  }) => Promise<void>;
  onCancel: () => void;
  selectedLocation: { lat: number; lng: number; area: string } | null;
  parentIssueId?: string;
  parentIssue?: any | null;
  onClearParentIssue?: () => void;
  onEnterLocationSelectionMode: () => void;
  onSelectLocation: (lat: number, lng: number, area: string) => void;
  theme?: "light" | "dark";
}

const CATEGORY_ITEMS: { value: Category; label: string; icon: React.ComponentType<any>; desc: string; color: string }[] = [
  { value: "Civic Issue", label: "Civic Issue", icon: Building, desc: "General civic, public safety or infrastructure problems", color: "border-indigo-500/20 hover:border-indigo-500 bg-indigo-950/20" },
  { value: "Pothole", label: "Pothole Crater", icon: Construction, desc: "Damaged tarmac, road pits, or broken paths", color: "border-orange-500/20 hover:border-orange-500 bg-orange-950/20" },
  { value: "Flooding", label: "Flooding & Waterlog", icon: Waves, desc: "Monsoon floods, waterlogging, or choked drains", color: "border-blue-500/20 hover:border-blue-500 bg-blue-950/20" },
  { value: "Power Cut", label: "Power Cut / Outage", icon: Zap, desc: "Electricity cuts, blackouts, or broken streetlights", color: "border-yellow-500/20 hover:border-yellow-500 bg-yellow-950/20" },
  { value: "Garbage", label: "Garbage & Waste", icon: Trash2, desc: "Accumulated trash, dirty dumps, or overflowing bins", color: "border-amber-700/20 hover:border-amber-700 bg-amber-950/20" },
  { value: "Corruption", label: "Corruption & Graft", icon: Scale, desc: "Bribery, misuse of power, or shady transactions", color: "border-red-500/20 hover:border-red-500 bg-red-950/20" },
  { value: "Government Failure", label: "Government Failure", icon: Landmark, desc: "Neglect of civic infrastructure, offices or services", color: "border-red-700/20 hover:border-red-700 bg-red-950/25" },
  { value: "Protest / Rally", label: "Protest / Rally", icon: Megaphone, desc: "Demonstrations, rallies, assemblies, or blockades", color: "border-pink-500/20 hover:border-pink-500 bg-pink-950/20" },
  { value: "Local Drama", label: "Local Drama / Chaos", icon: MessageCircle, desc: "Gossip, public chaos, street fights, or neighbor drama", color: "border-teal-500/20 hover:border-teal-500 bg-teal-950/20" },
  { value: "Argument / Dispute", label: "Argument / Dispute", icon: MessageSquare, desc: "Public disagreements, disputes, or screaming matches", color: "border-rose-500/20 hover:border-rose-500 bg-rose-950/20" },
  { value: "Harassment", label: "Harassment", icon: ShieldAlert, desc: "Unsafe environment, catcalling, or intimidation", color: "border-red-600/20 hover:border-red-600 bg-red-950/20" },
  { value: "Breaking News", label: "Breaking News", icon: Newspaper, desc: "Live incidents, unfolding updates, or emergency announcements", color: "border-cyan-500/20 hover:border-cyan-500 bg-cyan-950/20" },
  { value: "Village Problem", label: "Village Problem", icon: Home, desc: "Rural or localized community issues", color: "border-green-500/20 hover:border-green-500 bg-green-950/20" },
  { value: "Weather", label: "Weather Conditions", icon: Cloud, desc: "Heavy rain, storms, extreme heat, or dense fog", color: "border-sky-500/20 hover:border-sky-500 bg-sky-950/20" },
  { value: "War / Conflict", label: "War / Conflict", icon: Flame, desc: "Active clashes, structural damage, or violent skirmishes", color: "border-gray-700/20 hover:border-gray-500 bg-gray-950/20" },
  { value: "Other", label: "Other Issues", icon: HelpCircle, desc: "Any other hyperlocal issues or bulletins", color: "border-gray-500/20 hover:border-gray-500 bg-gray-950/20" }
];

export default function ReportForm({
  onSubmit,
  onCancel,
  selectedLocation,
  parentIssueId,
  parentIssue,
  onClearParentIssue,
  onEnterLocationSelectionMode,
  onSelectLocation,
  theme = "dark"
}: ReportFormProps) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [useAI, setUseAI] = useState(true);

  // Gemini real-time states
  const [isAiReading, setIsAiReading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    category: Category;
    title: string;
    isSpam: boolean;
    spamReasoning: string;
  } | null>(null);
  const [showAiCard, setShowAiCard] = useState(false);

  const [isAiVisionLoading, setIsAiVisionLoading] = useState(false);
  const [aiVisionResult, setAiVisionResult] = useState<{
    description: string;
    suggestedCategory: Category;
  } | null>(null);

  const lastAnalyzedTextRef = useRef("");

  useEffect(() => {
    if (!description || description.trim().length < 10) {
      setAiAnalysisResult(null);
      setShowAiCard(false);
      setIsAiReading(false);
      return;
    }

    if (description === lastAnalyzedTextRef.current) {
      return;
    }

    setIsAiReading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/gemini/analyze-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description })
        });
        if (response.ok) {
          const data = await response.json();
          setAiAnalysisResult(data);
          setShowAiCard(true);
          lastAnalyzedTextRef.current = description;
        }
      } catch (err) {
        console.error("Failed to analyze description via real-time Gemini:", err);
      } finally {
        setIsAiReading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [description]);

  const analyzePhotoWithAi = async (photoBase64: string) => {
    setIsAiVisionLoading(true);
    setAiVisionResult(null);
    try {
      const response = await fetch("/api/gemini/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: photoBase64 })
      });
      if (response.ok) {
        const data = await response.json();
        setAiVisionResult(data);
        if (data.suggestedCategory && data.suggestedCategory !== "Other") {
          setCategory(data.suggestedCategory);
        }
      }
    } catch (err) {
      console.error("Failed to analyze photo via real-time Gemini Vision:", err);
    } finally {
      setIsAiVisionLoading(false);
    }
  };

  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [locationStatus, setLocationStatus] = useState<"idle" | "detecting" | "success" | "error">("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback neighborhoods list for manual selection if map tapping is skipped
  const [manualArea, setManualArea] = useState("");

  // Dynamically generated nearby areas based on detected/active GPS coords or standard fallbacks
  const getNearbyAreas = () => {
    if (selectedLocation) {
      const lat = selectedLocation.lat;
      const lng = selectedLocation.lng;
      return [
        { name: `${selectedLocation.area || "Current Spot"} (Central)`, lat, lng },
        { name: `North Ward`, lat: lat + 0.015, lng: lng },
        { name: `South Ward`, lat: lat - 0.015, lng: lng },
        { name: `East Hub`, lat: lat, lng: lng + 0.015 },
        { name: `West End`, lat: lat, lng: lng - 0.015 },
      ];
    }

    // Default fallback neighborhoods (Worldwide/Generic seeds location-agnostic)
    return [
      { name: "Central Square", lat: 51.5074, lng: -0.1278 },
      { name: "West End", lat: 51.5135, lng: -0.1585 },
      { name: "Metro Center", lat: 51.5012, lng: -0.1150 },
      { name: "Tech District", lat: 51.5262, lng: -0.0782 },
      { name: "South Harbor", lat: 51.4875, lng: -0.0030 },
      { name: "North District", lat: 51.5456, lng: -0.1345 },
      { name: "Sunset Beach", lat: 51.4820, lng: -0.1915 },
      { name: "Commercial District", lat: 51.5155, lng: -0.0922 },
    ];
  };

  const nearbyAreas = getNearbyAreas();

  // Geolocation detector (fully worldwide and location-agnostic)
  const handleAutoGPS = () => {
    setLocationStatus("detecting");
    setErrorMessage("");

    if (!navigator.geolocation) {
      setLocationStatus("error");
      setErrorMessage("HTML5 Geolocation is not supported by your browser. Please tap the map or select a neighborhood.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Set the active selected location via parent handler instantly
        // Attempt to find a descriptive area or reverse-geocode it
        const areaName = "Detected Location";
        onSelectLocation(lat, lng, areaName);
        setLocationStatus("success");
      },
      (error) => {
        console.warn("Geolocation API failed inside iframe container:", error);
        setLocationStatus("error");
        setErrorMessage("Auto GPS request blocked or unavailable in sandbox. Please tap on map or select neighborhood manually.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Convert uploaded files to base64 representations (supporting up to 5 photos or 1 video)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    const hasVideo = fileList.some(f => f.type.startsWith("video/"));
    
    if (hasVideo) {
      // 1 video limit
      const videoFile = fileList.find(f => f.type.startsWith("video/"))!;
      if (videoFile.size > 25 * 1024 * 1024) {
        setErrorMessage("Video exceeds 25MB limit. Please upload a smaller video clip.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrls([reader.result as string]);
        setMediaType("video");
        setPhotoUrl(""); // clear for legacy compatibility
        setErrorMessage("");
      };
      reader.readAsDataURL(videoFile);
    } else {
      // Photo files (up to 5)
      const imageFiles = fileList.filter(f => f.type.startsWith("image/"));
      if (imageFiles.length === 0) {
        setErrorMessage("Please select valid image or video files.");
        return;
      }
      
      let processed = 0;
      const results: string[] = [];
      setMediaType("photo");
      
      imageFiles.forEach(file => {
        if (file.size > 8 * 1024 * 1024) {
          setErrorMessage("One or more photos exceed 8MB limit.");
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          results.push(reader.result as string);
          processed++;
          if (processed === imageFiles.length) {
            setMediaUrls(prev => {
              // combine and limit to 5
              const updated = [...prev, ...results].slice(0, 5);
              if (updated.length > 0) {
                setPhotoUrl(updated[0]); // legacy compatibility
                analyzePhotoWithAi(updated[0]);
              }
              return updated;
            });
            setErrorMessage("");
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleManualAreaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const areaName = e.target.value;
    setManualArea(areaName);
    const found = nearbyAreas.find(n => n.name === areaName);
    if (found) {
      // Create a default location pin based on the neighborhood center
      onSelectLocation(found.lat, found.lng, found.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!category) {
      setErrorMessage("Please select a category in STEP 2 before submitting.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Please enter a clear description of the civic issue.");
      return;
    }

    // Determine final latitude and longitude (Default to London center if absolutely nothing chosen)
    let finalLat = 51.5074;
    let finalLng = -0.1278;

    if (selectedLocation) {
      finalLat = selectedLocation.lat;
      finalLng = selectedLocation.lng;
    } else if (manualArea) {
      const found = nearbyAreas.find(n => n.name === manualArea);
      if (found) {
        finalLat = found.lat;
        finalLng = found.lng;
      }
    }

    setIsPending(true);

    try {
      await onSubmit({
        description,
        category: useAI ? "" : (category as Category),
        photoUrl,
        mediaUrls,
        mediaType,
        parentIssueId,
        lat: finalLat,
        lng: finalLng,
        isAnonymous,
        useAI
      });
      setSuccessMsg("Civic issue successfully logged on GroundZero radar!");
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while posting your report.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto border rounded-[14px] shadow-2xl backdrop-blur-2xl p-4 sm:p-5 md:p-6 transition-all duration-180 font-ui ${
      theme === 'dark' ? 'bg-[#111111]/98 border-[#303030] text-white' : 'bg-white/98 border-[#E1E5DF] text-[#171B18]'
    }`} id="report-creation-view">
      <div className={`flex items-center gap-2.5 mb-3.5 pb-2.5 border-b ${theme === 'dark' ? 'border-[#303030]' : 'border-[#E1E5DF]'}`}>
        <button
          type="button"
          onClick={onCancel}
          className={`p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-[10px] transition-all cursor-pointer border ${
            theme === 'dark' ? 'bg-[#191919] text-[#A3A3A3] hover:text-white border-[#303030]' : 'bg-[#F1F4EF] text-[#626862] hover:text-[#171B18] border-[#E1E5DF]'
          }`}
          id="report-back-btn"
          aria-label="Back to Map"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <div>
          <h2 className={`text-sm sm:text-base font-bold font-ui tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#171B18]'}`}>Report a Local Incident</h2>
          <p className="text-[11px] text-[#A3A3A3] font-ui">Broadcast verified updates to your community grid</p>
        </div>
      </div>

      {/* Linked Incident Banner if pre-linked parent post is active */}
      {parentIssue && (
        <div className={`mb-4 p-3 rounded-[10px] flex items-center justify-between text-xs border ${
          theme === 'dark' ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF]'
        }`}>
          <div className="flex items-center gap-2">
            <Link className="w-3.5 h-3.5 text-[#B7FF38] shrink-0" />
            <div>
              <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-[#171B18]'}`}>Linked to Incident</p>
              <p className="text-xs text-[#A3A3A3] line-clamp-1">"{parentIssue.title}"</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearParentIssue}
            className={`px-2.5 py-1 min-h-[30px] rounded-[8px] text-xs font-bold uppercase tracking-wider cursor-pointer border ${
              theme === 'dark' ? 'bg-[#111111] hover:bg-[#191919] text-gray-300 border-[#303030]' : 'bg-white border-[#E1E5DF] hover:bg-gray-50 text-[#171B18]'
            }`}
          >
            Unlink
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Step 1: Upload Photo / Video (up to 5 photos or 1 video) */}
        <div>
          <label className={`block text-xs font-mono uppercase tracking-wider mb-1.5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            STEP 1: ADD PHOTO OR VIDEO (OPTIONAL)
          </label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="report-photo-input"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-18 border border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-0.5 backdrop-blur-md ${
              theme === 'dark' 
                ? 'bg-white/[0.02] border-white/10 text-gray-350 hover:bg-white/[0.05] hover:border-white/20' 
                : 'bg-white/40 border-neutral-300 text-gray-700 hover:bg-white/60 hover:border-neutral-400 shadow-xs'
            }`}
            id="upload-placeholder-box"
          >
            <Camera className={`w-4 h-4 transition-all ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-neutral-950'}`} />
            <span className="text-xs font-semibold font-ui">Upload Photos or Video / Capture</span>
            <span className={`text-[11px] font-meta ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Max 5 Photos or 1 Video clip (Max 25MB video, 8MB photo)</span>
          </div>

          {/* Horizontal scrollable thumbnail row */}
          {mediaUrls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2.5 mt-2 scrollbar-thin">
              {mediaUrls.map((url, idx) => {
                const isUrlVideo = mediaType === "video" || url.startsWith("data:video/");
                return (
                  <div key={idx} className={`relative w-16 h-16 rounded-[10px] overflow-hidden border shrink-0 group ${
                    theme === 'dark' ? 'border-[#303030] bg-black/40' : 'border-[#E1E5DF] bg-gray-50 shadow-xs'
                  }`}>
                    {isUrlVideo ? (
                      <video src={url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaUrls(prev => {
                          const updated = prev.filter((_, i) => i !== idx);
                          if (updated.length > 0) {
                            setPhotoUrl(updated[0]);
                          } else {
                            setPhotoUrl("");
                          }
                          return updated;
                        });
                      }}
                      className="absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] text-center font-meta py-0.5 text-white">
                      {isUrlVideo ? "VIDEO" : `IMG ${idx+1}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isAiVisionLoading && (
            <div className={`flex items-center gap-2 mt-2.5 p-3.5 border rounded-[10px] text-xs font-meta uppercase tracking-wide animate-pulse ${
              theme === 'dark' ? 'bg-[#191919] border-[#303030] text-gray-300' : 'bg-emerald-50/50 border-emerald-200 text-emerald-800 font-medium'
            }`}>
              <Loader2 className={`w-4 h-4 animate-spin ${theme === 'dark' ? 'text-[#B7FF38]' : 'text-emerald-600'}`} />
              <span>Gemini Vision is inspecting uploaded evidence...</span>
            </div>
          )}

          {aiVisionResult && (
            <div className={`mt-2.5 p-4 border rounded-[14px] space-y-2.5 ${
              theme === 'dark' ? 'bg-[#111111] border-[#303030]' : 'bg-[#FAFCFA] border-[#E1E5DF] text-[#171B18]'
            }`} id="gemini-vision-card">
              <p className="text-xs font-ui leading-relaxed flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#B7FF38] shrink-0" /> <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#171B18]'}`}>AI Analysis:</span> {aiVisionResult.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-meta uppercase text-[#A3A3A3]">
                <Check className="w-4 h-4 text-[#B7FF38]" /> <span>Auto-suggested category:</span>
                <span className="px-2.5 py-0.5 rounded-[6px] font-bold text-black bg-[#B7FF38] shadow-xs">{aiVisionResult.suggestedCategory}</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: SELECT CATEGORY */}
        <div className="space-y-1.5" id="manual-category-section">
          <label className={`block text-xs font-meta uppercase tracking-wider mb-1 ${
            theme === 'dark' ? 'text-[#A3A3A3]' : 'text-[#626862]'
          }`}>
            STEP 2: SELECT CATEGORY
          </label>
          
          <div className="flex gap-1.5 overflow-x-auto py-0.5 scrollbar-thin">
            {CATEGORY_ITEMS.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => {
                    setCategory(item.value);
                  }}
                  className={`px-2.5 py-1.5 min-h-[30px] rounded-[8px] border text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 font-ui ${
                    category === item.value
                      ? "bg-[#B7FF38] text-black border-[#B7FF38] font-bold shadow-xs"
                      : theme === 'dark'
                        ? "bg-[#191919] text-[#A3A3A3] border-[#303030] hover:border-neutral-500 hover:text-white"
                        : "bg-[#F1F4EF] text-[#626862] border-[#E1E5DF] hover:border-gray-400"
                  }`}
                  id={`manual-cat-${item.value}`}
                >
                  <IconComponent className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Auto-categorize switch */}
        <div className={`flex items-center justify-between p-2.5 border rounded-[8px] backdrop-blur-md transition-all duration-180 ${
          theme === 'dark' ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF]'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}`} />
            <div>
              <p className={`text-xs font-bold font-ui ${theme === 'dark' ? 'text-white' : 'text-[#171B18]'}`}>Gemini AI Auto-Categorizer</p>
              <p className="text-[11px] text-[#A3A3A3] font-ui">Classifies categories & crafts specific titles instantly</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setUseAI(!useAI);
            }}
            className={`w-7 h-4 rounded-full p-0.5 border border-[#303030] transition-colors cursor-pointer ${
              useAI 
                ? "bg-[#B7FF38]" 
                : theme === 'dark' ? "bg-[#111111]" : "bg-gray-300"
            }`}
            id="ai-categorize-toggle"
          >
            <div className="w-3 h-3 rounded-full bg-black transition-transform duration-180" style={{ transform: useAI ? "translateX(12px)" : "translateX(0px)" }} />
          </button>
        </div>

        {/* Step 3: Description */}
        <div>
          <label className={`block text-xs font-meta uppercase tracking-wider mb-1 ${
            theme === 'dark' ? 'text-[#A3A3A3]' : 'text-[#626862]'
          }`}>
            STEP 3: DETAILED CIVIC DESCRIPTION
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Tell your story. What did you see, hear, or experience? Be the reporter."
            className={`w-full p-2.5 text-xs border rounded-[8px] font-ui resize-none focus:outline-none transition-all ${
              theme === 'dark' 
                ? 'bg-[#191919] border-[#303030] text-white placeholder-[#A3A3A3] focus:border-[#B7FF38]/50' 
                : 'bg-white border-[#E1E5DF] text-[#171B18] placeholder-[#626862] focus:border-[#537A00]/50 shadow-xs'
            }`}
            id="report-desc-textarea"
          />

          {isAiReading && (
            <div className="flex items-center gap-2 mt-2 text-[#B7FF38] text-xs font-meta uppercase tracking-wide animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is reading your report...</span>
            </div>
          )}

          {/* Gemini Real-time Text Analysis Card */}
          <AnimatePresence>
            {showAiCard && aiAnalysisResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-2.5 p-3.5 border rounded-[14px] space-y-2.5 relative overflow-hidden ${
                  theme === 'dark' ? 'bg-[#111111] border-[#303030] text-white' : 'bg-[#FAFCFA] border-[#E1E5DF] text-[#171B18]'
                }`}
                id="gemini-ai-analysis-card"
              >
                {/* Corner Glow */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#B7FF38]/5 blur-xl pointer-events-none" />

                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <p className={`text-xs font-bold font-ui flex items-center gap-2 ${
                      theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'
                    }`}>
                      <Cpu className="w-4 h-4 shrink-0" /> AI detected: {aiAnalysisResult.category}
                    </p>
                    <p className={`text-xs font-ui leading-relaxed flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-[#171B18]'}`}>
                      <Newspaper className="w-4 h-4 shrink-0 text-[#B7FF38]" /> <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#171B18]'}`}>Suggested headline:</span> "{aiAnalysisResult.title}"
                    </p>
                    <p className={`text-xs font-meta uppercase tracking-wider font-bold flex items-center gap-2 ${
                      theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'
                    }`}>
                      <Check className="w-4 h-4 shrink-0 text-[#B7FF38]" /> Auto-selected category: {aiAnalysisResult.category}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(aiAnalysisResult.category);
                      setUseAI(true);
                      setSuccessMsg(`Applied suggested category "${aiAnalysisResult.category}" & dynamic headline!`);
                      setTimeout(() => setSuccessMsg(""), 3000);
                    }}
                    className="px-3.5 py-2 text-xs font-ui font-bold uppercase rounded-[10px] transition-all flex items-center gap-1.5 cursor-pointer border border-[#B7FF38] bg-[#B7FF38] hover:bg-[#A6ED27] active:bg-[#94D91F] text-black shadow-xs min-h-[36px]"
                  >
                    <Check className="w-4 h-4 shrink-0 text-black" />
                    <span>Use this</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUseAI(false);
                      setSuccessMsg("Manual override active. Please pick category & enter headline manually.");
                      setTimeout(() => setSuccessMsg(""), 3000);
                    }}
                    className={`px-3.5 py-2 border text-xs font-ui font-bold uppercase rounded-[10px] transition-all cursor-pointer min-h-[36px] ${
                      theme === 'dark' 
                        ? 'bg-[#191919] hover:bg-[#222222] text-[#A3A3A3] hover:text-white border-[#303030]' 
                        : 'bg-[#F1F4EF] hover:bg-gray-200 text-[#626862] hover:text-[#171B18] border-[#E1E5DF]'
                    }`}
                  >
                    Edit manually
                  </button>
                </div>

                {/* Small "Powered by Gemini" badge */}
                <div className={`pt-2.5 border-t flex items-center justify-between text-xs font-meta uppercase tracking-wider ${
                  theme === 'dark' ? 'border-[#303030] text-[#A3A3A3]' : 'border-[#E1E5DF] text-[#626862]'
                }`}>
                  <span>RADAR AI CORE v1.0</span>
                  <span className={`flex items-center gap-1.5 font-bold ${theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    Powered by Gemini
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step 4: Coordinates Location selection */}
        <div>
          <label className={`block text-xs font-meta uppercase tracking-wider mb-1.5 ${
            theme === 'dark' ? 'text-[#A3A3A3]' : 'text-[#626862]'
          }`}>
            STEP 4: REPORT LOCATION & AREA (OPTIONAL)
          </label>
          
          <div className="flex flex-col gap-2">
            {/* Map tapping trigger button */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onEnterLocationSelectionMode}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 min-h-[34px] rounded-[8px] text-xs font-ui font-semibold border transition-all cursor-pointer ${
                  selectedLocation
                    ? "bg-[#B7FF38] text-black border-[#B7FF38] font-bold shadow-xs"
                    : theme === 'dark'
                      ? "bg-[#191919] text-[#A3A3A3] border-[#303030] hover:text-white hover:border-neutral-500"
                      : "bg-[#F1F4EF] text-[#626862] border-[#E1E5DF] hover:text-[#171B18]"
                }`}
                id="select-on-map-btn"
              >
                <MapPin className="w-3.5 h-3.5" />
                {selectedLocation ? "Location Locked on Map" : "Tap Location on Map"}
              </button>

              <button
                type="button"
                onClick={handleAutoGPS}
                disabled={locationStatus === "detecting"}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[34px] border rounded-[8px] text-xs font-ui font-semibold transition-all disabled:opacity-50 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#191919] border-[#303030] hover:border-neutral-500 text-[#A3A3A3] hover:text-white'
                    : 'bg-white border-[#E1E5DF] hover:bg-gray-50 text-[#626862] hover:text-[#171B18]'
                }`}
                id="gps-trigger-btn"
              >
                {locationStatus === "detecting" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span>Auto GPS</span>
              </button>
            </div>

            {/* Displaying selected location */}
            {selectedLocation ? (
              <div className={`px-2.5 py-1.5 border rounded-[6px] text-xs flex items-center gap-2 font-meta ${
                theme === 'dark' ? 'bg-[#191919] border-[#303030] text-gray-200' : 'bg-[#F1F4EF] border-[#E1E5DF] text-[#171B18]'
              }`}>
                <Check className="w-3.5 h-3.5 shrink-0 text-[#B7FF38]" />
                <span>Locked Coords: ({selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}) at {selectedLocation.area}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#A3A3A3] font-ui italic">OR Choose Nearest Ward Neighborhood Center:</span>
                <select
                  value={manualArea}
                  onChange={handleManualAreaSelect}
                  className={`w-full px-2.5 py-1.5 min-h-[34px] text-xs border rounded-[8px] focus:outline-none font-ui ${
                    theme === 'dark' ? 'bg-[#191919] border-[#303030] text-gray-200' : 'bg-white border-[#E1E5DF] text-[#171B18]'
                  }`}
                  id="neighborhood-manual-select"
                >
                  <option value="">-- Choose Ward Neighborhood --</option>
                  {nearbyAreas.map(n => (
                    <option key={n.name} value={n.name}>{n.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Step 5: Anonymous Toggle */}
        <div className={`flex items-center justify-between p-2.5 border rounded-[8px] text-xs transition-all duration-180 ${
          theme === 'dark' ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF]'
        }`}>
          <div className="flex items-center gap-2">
            <EyeOff className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-[#A3A3A3]' : 'text-[#626862]'}`} />
            <div>
              <p className={`font-semibold font-ui text-xs ${theme === 'dark' ? 'text-gray-200' : 'text-[#171B18]'}`}>Submit Anonymously</p>
              <p className="text-[11px] text-[#A3A3A3] font-ui">Your real name won't be visible to others</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`w-7 h-4 rounded-full p-0.5 border border-[#303030] transition-colors cursor-pointer ${
              isAnonymous 
                ? "bg-[#B7FF38]" 
                : theme === 'dark' ? "bg-[#111111]" : "bg-gray-300"
            }`}
            id="anonymous-report-toggle"
          >
            <div className="w-3 h-3 rounded-full bg-black transition-transform duration-180" style={{ transform: isAnonymous ? "translateX(12px)" : "translateX(0px)" }} />
          </button>
        </div>

        {/* Errors & Success Feedback */}
        {errorMessage && (
          <div className={`p-2 border rounded-[8px] text-xs flex items-center gap-2 ${
            theme === 'dark' 
              ? 'bg-red-600/10 border-red-500/30 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-600 font-medium'
          }`}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMsg && (
          <div className={`p-2 border rounded-[8px] text-xs flex items-center gap-2 ${
            theme === 'dark' 
              ? 'bg-emerald-600/10 border-emerald-500/30 text-[#B7FF38]' 
              : 'bg-emerald-50 border-emerald-200 text-[#537A00] font-medium'
          }`}>
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className={`flex-1 py-1.5 min-h-[36px] rounded-[8px] text-xs font-ui font-semibold transition-all cursor-pointer border ${
              theme === 'dark' 
                ? 'bg-[#191919] hover:bg-[#222222] text-[#A3A3A3] hover:text-white border-[#303030]' 
                : 'bg-[#F1F4EF] hover:bg-gray-200 text-[#626862] hover:text-[#171B18] border-[#E1E5DF]'
            }`}
            id="report-cancel-btn"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isPending}
            className="flex-2 py-1.5 min-h-[36px] rounded-[8px] text-xs font-ui font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer border border-transparent bg-[#B7FF38] hover:bg-[#A6ED27] active:bg-[#94D91F] text-black"
            id="report-submit-btn"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                <span>{useAI ? "Gemini Auto-Detecting..." : "Logging to Radar..."}</span>
              </>
            ) : (
              <span>POST TO GROUNDZERO</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
