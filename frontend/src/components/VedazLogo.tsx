import React from 'react';

interface VedazLogoProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const VedazLogo: React.FC<VedazLogoProps> = ({ 
  className = "drop-shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300",
  width = "80",
  height = "80"
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={width} height={height} aria-hidden="true" className={className}>
    <defs>
      <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4f46e5" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <radialGradient id="rg1" cx="35%" cy="25%" r="60%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <filter id="ds1"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#3730a3" floodOpacity="0.35" /></filter>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#lg1)" />
    <rect width="64" height="64" rx="15" fill="url(#rg1)" />
    <path d="M10 13C10 9.7 12.7 7 16 7h26c3.3 0 6 2.7 6 6v18c0 3.3-2.7 6-6 6H26L18 46V37c-3.3 0-6-2.7-6-6V13z" fill="#fff" opacity=".96" filter="url(#ds1)" />
    <path d="M33 41c0-1.7 1.3-3 3-3h14c1.7 0 3 1.3 3 3v9c0 1.7-1.3 3-3 3H40l-4 4v-4c-1.7 0-3-1.3-3-3v-9z" fill="#fff" opacity=".3" />
    <circle cx="22" cy="22" r="3" fill="url(#lg1)" />
    <circle cx="30" cy="22" r="3" fill="url(#lg1)" />
    <circle cx="38" cy="22" r="3" fill="url(#lg1)" />
    <rect x="8" y="8" width="48" height="7" rx="7" fill="#fff" opacity=".07" />
  </svg>
);
