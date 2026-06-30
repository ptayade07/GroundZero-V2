import React, { useId } from "react";

interface LogoProps {
  theme?: "light" | "dark";
  className?: string;
  showBackground?: boolean;
}

export default function Logo({ theme = "dark", className = "w-16 h-16", showBackground = true }: LogoProps) {
  const clipId = useId().replace(/:/g, ""); // generate a clean unique ID for the clipPath to avoid clashing SVG elements

  const isDark = theme === "dark";

  return (
    <div className={`shrink-0 overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {showBackground && (
          <rect
            width="400"
            height="400"
            rx="48"
            fill={isDark ? "#0D0D0D" : "#FFFFFF"}
          />
        )}
        <g transform="translate(200,208)">
          <clipPath id={`${clipId}-clip`}>
            <path d="M0 -104 C52 -104 88 -60 88 -4 C88 56 0 116 0 116 C0 116 -88 56 -88 -4 C-88 -60 -52 -104 0 -104 Z" />
          </clipPath>
          <path
            d="M0 -104 C52 -104 88 -60 88 -4 C88 56 0 116 0 116 C0 116 -88 56 -88 -4 C-88 -60 -52 -104 0 -104 Z"
            fill="none"
            stroke={isDark ? "#39FF6B" : "#0DA84B"}
            strokeWidth="3"
            opacity="0.5"
          />
          <g clipPath={`url(#${clipId}-clip)`}>
            <circle cx="20" cy="-24" r="12" fill="none" stroke={isDark ? "#39FF6B" : "#0DA84B"} strokeWidth="8" />
            <circle cx="20" cy="-24" r="32" fill="none" stroke={isDark ? "#39FF6B" : "#0DA84B"} strokeWidth="8" />
            <circle cx="20" cy="-24" r="52" fill="none" stroke={isDark ? "#39FF6B" : "#0DA84B"} strokeWidth="8" />
            <circle cx="20" cy="-24" r="72" fill="none" stroke={isDark ? "#39FF6B" : "#0DA84B"} strokeWidth="8" />
            <circle cx="20" cy="-24" r="92" fill="none" stroke={isDark ? "#39FF6B" : "#0DA84B"} strokeWidth="8" />
            <circle cx="20" cy="-24" r="112" fill="none" stroke={isDark ? "#39FF6B" : "#0DA84B"} strokeWidth="8" />
          </g>
        </g>
      </svg>
    </div>
  );
}
