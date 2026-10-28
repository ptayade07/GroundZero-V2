/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { Issue, Category } from "../types";
import { MapPin, Info, Plus, Navigation, Layers, Compass, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MapComponentProps {
  issues: Issue[];
  selectedIssue: Issue | null;
  onSelectIssue: (issue: Issue | null) => void;
  onSelectLocationForNewIssue?: (lat: number, lng: number, area: string) => void;
  isSelectingLocationMode: boolean;
  selectedLocation: { lat: number; lng: number } | null;
  theme?: "light" | "dark";
}

const CATEGORY_COLORS: Record<Category, { hex: string; bg: string; text: string; pin: string }> = {
  "Civic Issue": { hex: "#818cf8", bg: "bg-indigo-950/40", text: "text-indigo-400", pin: "bg-indigo-500" },
  "Pothole": { hex: "#f97316", bg: "bg-orange-950/40", text: "text-orange-400", pin: "bg-orange-500" },
  "Flooding": { hex: "#3b82f6", bg: "bg-blue-950/40", text: "text-blue-400", pin: "bg-blue-500" },
  "Power Cut": { hex: "#eab308", bg: "bg-yellow-950/40", text: "text-yellow-400", pin: "bg-yellow-500" },
  "Garbage": { hex: "#a16207", bg: "bg-amber-950/40", text: "text-amber-500", pin: "bg-amber-700" },
  "Corruption": { hex: "#ef4444", bg: "bg-red-950/40", text: "text-red-400", pin: "bg-red-500" },
  "Government Failure": { hex: "#b91c1c", bg: "bg-red-950/60", text: "text-red-500", pin: "bg-red-700" },
  "Protest / Rally": { hex: "#ec4899", bg: "bg-pink-950/40", text: "text-pink-400", pin: "bg-pink-500" },
  "Local Drama": { hex: "#14b8a6", bg: "bg-teal-950/40", text: "text-teal-400", pin: "bg-teal-500" },
  "Argument / Dispute": { hex: "#f43f5e", bg: "bg-rose-950/40", text: "text-rose-400", pin: "bg-rose-500" },
  "Harassment": { hex: "#dc2626", bg: "bg-red-950/50", text: "text-red-500", pin: "bg-red-600" },
  "Breaking News": { hex: "#06b6d4", bg: "bg-cyan-950/40", text: "text-cyan-400", pin: "bg-cyan-500" },
  "Village Problem": { hex: "#22c55e", bg: "bg-green-950/40", text: "text-green-400", pin: "bg-green-500" },
  "Weather": { hex: "#38bdf8", bg: "bg-sky-950/40", text: "text-sky-400", pin: "bg-sky-500" },
  "War / Conflict": { hex: "#4b5563", bg: "bg-gray-950/80", text: "text-gray-300", pin: "bg-gray-700" },
  "Other": { hex: "#6b7280", bg: "bg-gray-900/40", text: "text-gray-400", pin: "bg-gray-500" }
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  "Civic Issue": "🏢",
  "Pothole": "🕳️",
  "Flooding": "🌊",
  "Power Cut": "🔌",
  "Garbage": "🗑️",
  "Corruption": "💼",
  "Government Failure": "🏛️",
  "Protest / Rally": "📣",
  "Local Drama": "🍵",
  "Argument / Dispute": "🗣️",
  "Harassment": "⚠️",
  "Breaking News": "📰",
  "Village Problem": "🏡",
  "Weather": "☁️",
  "War / Conflict": "💥",
  "Other": "❓"
};

export default function MapComponent({
  issues,
  selectedIssue,
  onSelectIssue,
  onSelectLocationForNewIssue,
  isSelectingLocationMode,
  selectedLocation,
  theme = "dark"
}: MapComponentProps) {
  const [viewMode, setViewMode] = useState<"street" | "satellite">("street");
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  // GPS and center coordinates
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 51.5074, lng: -0.1278 }); // Default to London center
  const [hasGPS, setHasGPS] = useState(false);

  // Helper functions to prevent LatLng NaN errors
  const safeLat = (val: any): number => {
    const n = Number(val);
    return isNaN(n) ? 51.5074 : n;
  };

  const safeLng = (val: any): number => {
    const n = Number(val);
    return isNaN(n) ? -0.1278 : n;
  };

  // Attempt to detect GPS location automatically on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude);
          const lng = Number(position.coords.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter({ lat, lng });
            setHasGPS(true);
          } else {
            setMapCenter({ lat: 51.5074, lng: -0.1278 });
            setHasGPS(false);
          }
        },
        (error) => {
          console.warn("GPS request denied/unavailable. Defaulting to London center view.", error);
          setMapCenter({ lat: 51.5074, lng: -0.1278 });
          setHasGPS(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Dynamically compute active center around selection or default GPS/center coordinates
  const rawActiveCenter = selectedLocation || (selectedIssue ? { lat: selectedIssue.lat, lng: selectedIssue.lng } : mapCenter);
  const activeCenter = {
    lat: safeLat(rawActiveCenter?.lat),
    lng: safeLng(rawActiveCenter?.lng)
  };

  // Poll for window.L loading
  useEffect(() => {
    const checkLeaflet = () => {
      if ((window as any).L) {
        setLeafletLoaded(true);
      } else {
        setTimeout(checkLeaflet, 100);
      }
    };
    checkLeaflet();
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    const L = (window as any).L;
    if (!leafletLoaded || !L || !mapContainerRef.current) return;

    if (!mapInstance.current) {
      const zoom = selectedLocation || selectedIssue ? 14 : (hasGPS ? 12 : 5);
      
      // Initialize Map
      const map = L.map(mapContainerRef.current, {
        center: [activeCenter.lat, activeCenter.lng],
        zoom: zoom,
        zoomControl: false,
        attributionControl: true
      });

      setMapZoom(zoom);

      map.on("zoomend", () => {
        setMapZoom(map.getZoom());
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Handle map clicks in selecting location mode
      map.on("click", (e: any) => {
        if (isSelectingLocationMode && onSelectLocationForNewIssue) {
          const { lat, lng } = e.latlng;

          // Attempt to reverse-geocode using OpenStreetMap Nominatim
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            .then(res => res.json())
            .then(data => {
              const area = data.address?.suburb || data.address?.neighbourhood || data.address?.road || data.address?.city || data.address?.state || "Custom Area";
              onSelectLocationForNewIssue(lat, lng, area);
            })
            .catch(() => {
              // Fail-safe manual coordinate naming
              const closestArea = getClosestAreaName(lat, lng);
              onSelectLocationForNewIssue(lat, lng, closestArea);
            });
        }
      });

      mapInstance.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      // Keep map persistence alive across simple re-renders, clean up only if container changes
    };
  }, [leafletLoaded]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update Base Tile Layer when viewMode or theme changes
  useEffect(() => {
    const L = (window as any).L;
    if (!leafletLoaded || !L || !mapInstance.current) return;

    if (tileLayerRef.current) {
      mapInstance.current.removeLayer(tileLayerRef.current);
    }

    let tileUrl = "";
    let attribution = "";

    if (viewMode === "satellite") {
      // ESRI World Imagery Tile Layer
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
    } else {
      if (theme === "light") {
        // CartoDB Voyager Tile Layer (Modern light theme street map)
        tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      } else {
        // CartoDB Dark Matter Tile Layer (Modern dark theme street map)
        tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      }
      attribution = "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>";
    }

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 20
    }).addTo(mapInstance.current);

  }, [leafletLoaded, viewMode, theme]);

  // Pan / Zoom map when center reference target shifts
  useEffect(() => {
    if (mapInstance.current) {
      const zoom = selectedLocation || selectedIssue ? 14 : (hasGPS ? 12 : 5);
      mapInstance.current.flyTo([activeCenter.lat, activeCenter.lng], zoom, {
        animate: true,
        duration: 1.5, // 1.5 seconds for a gorgeous, flowing flight path
        easeLinearity: 0.25
      });
    }
  }, [selectedIssue, selectedLocation, mapCenter, hasGPS]);

  // Update Markers Layer dynamically
  useEffect(() => {
    const L = (window as any).L;
    if (!leafletLoaded || !L || !mapInstance.current || !markersGroupRef.current) return;

    // Clear previous dynamic layers
    markersGroupRef.current.clearLayers();

    // 1. Plot GPS user position blue dot
    if (hasGPS && mapCenter) {
      const userIconHtml = `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-500 opacity-60"></span>
          <div class="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        html: userIconHtml,
        className: "custom-leaflet-icon-gps",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([safeLat(mapCenter.lat), safeLng(mapCenter.lng)], { icon: userIcon, zIndexOffset: 1000 })
        .bindPopup("<div class='text-[#0A0A0A] font-sans font-bold text-xs p-1'>Your Live GPS Location</div>")
        .addTo(markersGroupRef.current);
    }

    // Custom tuned threshold mapping based on mapZoom
    const getThreshold = (zoom: number) => {
      if (zoom <= 4) return 2.5;
      if (zoom === 5) return 1.5;
      if (zoom === 6) return 0.8;
      if (zoom === 7) return 0.4;
      if (zoom === 8) return 0.2;
      if (zoom === 9) return 0.1;
      if (zoom === 10) return 0.05;
      if (zoom === 11) return 0.025;
      if (zoom === 12) return 0.012;
      if (zoom === 13) return 0.006;
      if (zoom === 14) return 0.003;
      if (zoom === 15) return 0.0015;
      if (zoom === 16) return 0.0008;
      if (zoom === 17) return 0.0004;
      return 0.0002;
    };

    const threshold = getThreshold(mapZoom);
    const tempClusters: {
      lat: number;
      lng: number;
      issues: Issue[];
    }[] = [];

    // Filter out issues that have invalid / NaN coordinates
    const validIssues = (issues || []).filter(issue => {
      if (!issue) return false;
      const lat = Number(issue.lat);
      const lng = Number(issue.lng);
      return !isNaN(lat) && !isNaN(lng);
    });

    // Simple agglomerative clustering
    validIssues.forEach(issue => {
      let found = false;
      for (const c of tempClusters) {
        const dist = Math.sqrt(Math.pow(c.lat - issue.lat, 2) + Math.pow(c.lng - issue.lng, 2));
        if (dist < threshold) {
          c.issues.push(issue);
          c.lat = c.issues.reduce((sum, i) => sum + i.lat, 0) / c.issues.length;
          c.lng = c.issues.reduce((sum, i) => sum + i.lng, 0) / c.issues.length;
          found = true;
          break;
        }
      }
      if (!found) {
        tempClusters.push({
          lat: issue.lat,
          lng: issue.lng,
          issues: [issue]
        });
      }
    });

    const activeBg = theme === "dark" ? "#111111" : "#FFFFFF";
    const activeBorderColor = theme === "dark" ? "#111111" : "#FFFFFF";
    const greenColor = theme === "dark" ? "#B7FF38" : "#537A00";

    // Now plot items: either cluster bubble (>= 3) or individual pins (< 3)
    tempClusters.forEach(c => {
      if (c.issues.length >= 3) {
        // Render as a high-visibility green cluster circle showing count
        const clusterHtml = `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-[#B7FF38] opacity-30"></span>
            <div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-${theme === 'dark' ? '[#111111]' : 'white'} border-2 text-xs font-black font-mono shadow-[0_0_15px_rgba(183,255,56,0.4)] transition-all transform hover:scale-110" style="color: ${greenColor}; border-color: ${greenColor};">
              ${c.issues.length}
            </div>
          </div>
        `;
        const clusterIcon = L.divIcon({
          html: clusterHtml,
          className: "custom-leaflet-icon-cluster",
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const marker = L.marker([safeLat(c.lat), safeLng(c.lng)], { icon: clusterIcon });
        marker.on("click", () => {
          const currentZoom = mapInstance.current.getZoom();
          mapInstance.current.setView([safeLat(c.lat), safeLng(c.lng)], Math.min(currentZoom + 2, 18), { animate: true });
        });

        // Add small hover popup showing titles inside the cluster
        const titleSnippet = c.issues.slice(0, 3).map(i => `• ${i.title}`).join("<br/>") + (c.issues.length > 3 ? `<br/>...and ${c.issues.length - 3} more` : "");
        marker.bindPopup(`
          <div class="text-[#0A0A0A] font-sans p-1.5 max-w-[200px]">
            <h4 class="font-bold text-xs leading-snug">Incident Cluster (${c.issues.length} reports)</h4>
            <div class="text-xs text-gray-700 mt-1.5 leading-normal">
              ${titleSnippet}
            </div>
            <p class="text-xs text-[#537A00] font-mono mt-1.5 uppercase font-bold">Tap to zoom in</p>
          </div>
        `);

        markersGroupRef.current.addLayer(marker);
      } else {
        // Render each issue inside as a normal individual pin
        c.issues.forEach(issue => {
          const color = CATEGORY_COLORS[issue.category]?.hex || greenColor;
          const isSelected = selectedIssue?.id === issue.id;
          const emoji = CATEGORY_EMOJIS[issue.category] || "📍";

          const confirmCount = issue.seeThisTooCount || 0;
          const size = isSelected ? "w-8 h-8 text-base" : "w-7.5 h-7.5 text-sm";
          const pingSize = isSelected ? "h-11 w-11" : "h-9 w-9";

          // Dynamic glow and pulse animations based on community confirmation counts
          const glowMultiplier = 1 + Math.min(confirmCount * 0.2, 2.0); // up to 3x scale
          const pingOpacity = Math.min(0.35 + (confirmCount * 0.08), 0.85);
          const baseShadow = isSelected ? `0 0 16px ${color}` : `0 0 8px ${color}`;
          
          let shadowStyle = `box-shadow: ${baseShadow};`;
          if (confirmCount > 0) {
            const extraGlowRadius = Math.min(confirmCount * 3.5, 25);
            const overlayOpacity = Math.min(0.3 + (confirmCount * 0.1), 0.9);
            // Stack multiple shadow glows for intense, hyper-vibrant radial bloom
            shadowStyle = `box-shadow: ${baseShadow}, 0 0 ${10 + extraGlowRadius}px rgba(183,255,56,${overlayOpacity}), 0 0 ${18 + extraGlowRadius * 1.5}px ${color};`;
          }

          const pinHtml = `
            <div class="relative flex items-center justify-center">
              <span class="animate-ping absolute inline-flex ${pingSize} rounded-full" style="background-color: ${color}; transform: scale(${glowMultiplier}); opacity: ${pingOpacity};"></span>
              <div class="relative flex items-center justify-center ${size} rounded-full bg-${theme === 'dark' ? '[#0A0A0A]' : 'white'} border-2 transition-all duration-300" style="border-color: ${color}; ${shadowStyle}; background-color: ${activeBg};">
                <span class="select-none leading-none">${emoji}</span>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: pinHtml,
            className: "custom-leaflet-icon-pin",
            iconSize: isSelected ? [36, 36] : [30, 30],
            iconAnchor: isSelected ? [18, 18] : [15, 15]
          });

          const marker = L.marker([safeLat(issue.lat), safeLng(issue.lng)], { icon: customIcon });

          marker.on("click", () => {
            onSelectIssue(issue);
          });

          marker.bindPopup(`
            <div class="text-[#0A0A0A] font-sans p-1.5 max-w-[200px]">
              <h4 class="font-bold text-xs leading-snug line-clamp-2">${issue.title}</h4>
              <p class="text-xs text-gray-700 uppercase font-bold tracking-wider mt-1" style="color: ${color};">
                ${issue.category}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">${issue.area}</p>
            </div>
          `);

          markersGroupRef.current.addLayer(marker);
        });
      }
    });

    // 3. Drop bouncing pin for the active user selection state
    if (isSelectingLocationMode && selectedLocation) {
      const selectedLocationIconHtml = `
        <div class="relative flex items-center justify-center animate-bounce">
          <div class="w-8 h-8 rounded-full bg-${greenColor} border-2 border-${activeBorderColor} shadow-xl flex items-center justify-center" style="background-color: ${greenColor}; border-color: ${activeBorderColor};">
            <span class="text-sm">➕</span>
          </div>
          <div class="w-3 h-3 bg-${greenColor} rounded-full blur-[1px] absolute -bottom-1" style="background-color: ${greenColor};"></div>
        </div>
      `;

      const creationIcon = L.divIcon({
        html: selectedLocationIconHtml,
        className: "custom-leaflet-icon-selection",
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      L.marker([safeLat(selectedLocation.lat), safeLng(selectedLocation.lng)], { icon: creationIcon })
        .addTo(markersGroupRef.current);
    }

  }, [leafletLoaded, issues, selectedIssue, isSelectingLocationMode, selectedLocation, mapCenter, hasGPS, mapZoom]);

  // Closest Area fallback computation helper
  const getClosestAreaName = (lat: number, lng: number): string => {
    const points = hasGPS ? [
      { name: "West End", lat: mapCenter.lat + 0.05, lng: mapCenter.lng - 0.04 },
      { name: "East Hub", lat: mapCenter.lat + 0.06, lng: mapCenter.lng + 0.06 },
      { name: "Central Square", lat: mapCenter.lat, lng: mapCenter.lng },
      { name: "North Sector", lat: mapCenter.lat + 0.11, lng: mapCenter.lng + 0.01 },
      { name: "South Harbor", lat: mapCenter.lat - 0.11, lng: mapCenter.lng - 0.03 },
      { name: "Sunset Beach", lat: mapCenter.lat - 0.06, lng: mapCenter.lng - 0.05 },
      { name: "Metro Center", lat: mapCenter.lat + 0.01, lng: mapCenter.lng + 0.04 },
      { name: "Tech District", lat: mapCenter.lat + 0.09, lng: mapCenter.lng + 0.07 },
    ] : [
      { name: "City Center", lat: 51.5074, lng: -0.1278 },
      { name: "Downtown Area", lat: 40.7128, lng: -74.0060 },
      { name: "Metro Grid", lat: 48.8566, lng: 2.3522 },
      { name: "East Hub", lat: 35.6762, lng: 139.6503 },
      { name: "West Sector", lat: 37.7749, lng: -122.4194 },
      { name: "Tech Park", lat: 52.5200, lng: 13.4050 },
      { name: "Bay Harbor", lat: -33.8688, lng: 151.2093 },
      { name: "North Gate", lat: 64.1466, lng: -21.9426 },
    ];

    let closest = "Sector Center";
    let minDist = Infinity;
    points.forEach(p => {
      const d = Math.sqrt(Math.pow(p.lat - lat, 2) + Math.pow(p.lng - lng, 2));
      if (d < minDist) {
        minDist = d;
        closest = p.name;
      }
    });
    return closest;
  };

  const isDark = theme === "dark";
  const activeGreen = isDark ? "#B7FF38" : "#537A00";

  return (
    <div className={`relative w-full h-full overflow-hidden select-none transition-colors duration-300 font-ui ${
      isDark ? 'bg-black text-white' : 'bg-[#FAFCFA] text-[#171B18]'
    }`} id="map-container-wrapper">
      {/* Map view controls in bottom right */}
      <div className={`absolute bottom-4 right-4 z-[1000] flex items-center gap-1 p-1 rounded-[10px] border shadow-lg backdrop-blur-xl transition-all duration-300 ${
        isDark ? 'bg-[#111111] border-[#303030]' : 'bg-white border-[#E1E5DF]'
      }`} id="map-view-controls">
        <button
          type="button"
          onClick={() => setViewMode("street")}
          className={`px-3 py-1.5 text-[10.5px] font-meta uppercase font-bold transition-all cursor-pointer rounded-[8px] min-h-[30px] flex items-center justify-center border ${
            viewMode === "street"
              ? isDark 
                ? "bg-[#B7FF38] text-black border-[#B7FF38] shadow-xs"
                : "bg-[#537A00] text-white border-[#537A00] shadow-xs"
              : isDark
                ? "bg-transparent border-transparent text-[#A3A3A3] hover:text-white"
                : "bg-transparent border-transparent text-[#626862] hover:text-[#171B18]"
          }`}
          id="btn-street-mode"
        >
          Street
        </button>
        <button
          type="button"
          onClick={() => setViewMode("satellite")}
          className={`px-3 py-1.5 text-[10.5px] font-meta uppercase font-bold transition-all cursor-pointer rounded-[8px] min-h-[30px] flex items-center justify-center border ${
            viewMode === "satellite"
              ? isDark 
                ? "bg-[#B7FF38] text-black border-[#B7FF38] shadow-xs"
                : "bg-[#537A00] text-white border-[#537A00] shadow-xs"
              : isDark
                ? "bg-transparent border-transparent text-[#A3A3A3] hover:text-white"
                : "bg-transparent border-transparent text-[#626862] hover:text-[#171B18]"
          }`}
          id="btn-satellite-mode"
        >
          Satellite
        </button>
      </div>

      {/* Mode indicators */}
      <AnimatePresence>
        {isSelectingLocationMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 z-[1000] right-16 pr-12 md:pr-0 md:max-w-xs pointer-events-none"
          >
            <div className={`px-3.5 py-2 text-xs font-bold font-meta rounded-[10px] shadow-lg border flex items-center gap-2 backdrop-blur-md animate-pulse ${
              isDark 
                ? 'bg-[#B7FF38] text-black border-[#B7FF38]' 
                : 'bg-[#537A00] text-white border-[#537A00]'
            }`}>
              <MapPin className="w-3.5 h-3.5 animate-bounce shrink-0" />
              <span>TAP MAP TO PLACE PIN</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaflet Core Map Component */}
      <div className="w-full h-full relative" id="leaflet-map-view">
        {!leafletLoaded && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-colors duration-300 ${
            isDark ? 'bg-black text-[#A3A3A3]' : 'bg-[#FAFCFA] text-[#626862]'
          }`}>
            <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-[#B7FF38]' : 'text-[#537A00]'}`} />
            <p className="text-xs font-meta">Launching OpenStreetMap Engine...</p>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full z-10" />
      </div>

      {/* Elegant Compass / Legend Footer (Floating and Collapsible) */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col items-start gap-2" id="map-legend-container">
        {isLegendOpen ? (
          <div className={`flex flex-col gap-2 p-3 border rounded-[14px] text-xs min-w-[160px] shadow-2xl transition-all duration-300 font-ui ${
            isDark ? 'bg-[#111111] border-[#303030] text-white' : 'bg-white border-[#E1E5DF] text-[#171B18]'
          }`}>
            <div className={`flex items-center justify-between w-full pb-1 border-b gap-3 ${
              isDark ? 'border-[#303030]' : 'border-[#E1E5DF]'
            }`}>
              <p className={`font-bold font-meta text-[10px] uppercase tracking-wider ${isDark ? 'text-[#A3A3A3]' : 'text-[#626862]'}`}>Radar Legend</p>
              <button 
                type="button"
                onClick={() => setIsLegendOpen(false)}
                className={`text-xs p-1 rounded-[6px] hover:bg-white/10 cursor-pointer ${isDark ? 'text-[#A3A3A3] hover:text-white' : 'text-[#626862] hover:text-[#171B18]'}`}
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1 scrollbar-none w-full">
              {(Object.keys(CATEGORY_COLORS) as Category[]).map(cat => (
                <div key={cat} className="flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat].hex }} />
                  <span className="truncate text-[10px] font-medium">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsLegendOpen(true)}
            className={`w-9 h-9 rounded-[10px] border flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300 ${
              isDark 
                ? 'bg-[#111111] border-[#303030] text-[#A3A3A3] hover:text-[#B7FF38] hover:border-[#B7FF38]/40' 
                : 'bg-white border-[#E1E5DF] text-[#626862] hover:text-[#537A00] hover:border-[#537A00]/40'
            }`}
            title="Show Radar Legend"
            id="toggle-legend-btn"
          >
            <Layers className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
