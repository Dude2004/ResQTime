import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  theme?: 'light' | 'dark';
}

export default function Logo({ className = '', size = 120, showText = false, theme = 'dark' }: LogoProps) {
  // Determine styles based on theme
  const accentColor = theme === 'dark' ? '#00f2fe' : '#0ea5e9'; // Glow cyan vs deep sky blue
  const secondaryColor = theme === 'dark' ? '#4facfe' : '#2563eb'; // Deep blue vs royal blue
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subtitleColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* SVG Clock + Arrow Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform duration-500 hover:scale-105"
      >
        <defs>
          {/* Radial glow for dark mode, subtle shadow for light mode */}
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
          
          {/* Stroke gradients */}
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          
          {/* Arrow gradient */}
          <linearGradient id="arrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor={accentColor} />
          </linearGradient>

          {/* Filter for glow */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Glow Circle (Only in Dark Mode) */}
        {theme === 'dark' && (
          <circle cx="100" cy="100" r="90" fill="url(#glowGrad)" />
        )}

        {/* Stopwatch top buttons */}
        {/* Winding stem at 12 o'clock */}
        <rect x="92" y="16" width="16" height="14" rx="2" fill="url(#ringGrad)" />
        <rect x="86" y="10" width="28" height="6" rx="1" fill="url(#ringGrad)" />

        {/* Angled button at 10 o'clock */}
        <g transform="rotate(-35, 100, 100)">
          <rect x="94" y="16" width="12" height="10" rx="1" fill="url(#ringGrad)" />
        </g>

        {/* Angled button at 2 o'clock */}
        <g transform="rotate(35, 100, 100)">
          <rect x="94" y="16" width="12" height="10" rx="1" fill="url(#ringGrad)" />
        </g>

        {/* Main Casing Casing Outer Ring */}
        <circle 
          cx="100" 
          cy="110" 
          r="66" 
          stroke="url(#ringGrad)" 
          strokeWidth="6" 
          strokeLinecap="round"
          filter={theme === 'dark' ? 'url(#neonGlow)' : undefined}
          className="opacity-90"
        />

        {/* Inner track */}
        <circle 
          cx="100" 
          cy="110" 
          r="54" 
          stroke="url(#ringGrad)" 
          strokeWidth="1.5" 
          strokeDasharray="4 8"
          className="opacity-40"
        />

        {/* Clock Ticks */}
        <g stroke={theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'} strokeWidth="2" strokeLinecap="round">
          {/* 12 o'clock */}
          <line x1="100" y1="58" x2="100" y2="64" />
          {/* 3 o'clock */}
          <line x1="142" y1="110" x2="148" y2="110" />
          {/* 6 o'clock */}
          <line x1="100" y1="156" x2="100" y2="162" />
          {/* 9 o'clock */}
          <line x1="52" y1="110" x2="58" y2="110" />
          
          {/* Sub ticks */}
          <line x1="121" y1="74" x2="125" y2="79" strokeWidth="1" />
          <line x1="136" y1="89" x2="141" y2="93" strokeWidth="1" />
          <line x1="136" y1="131" x2="141" y2="127" strokeWidth="1" />
          <line x1="121" y1="146" x2="125" y2="141" strokeWidth="1" />
          <line x1="79" y1="146" x2="75" y2="141" strokeWidth="1" />
          <line x1="64" y1="131" x2="59" y2="127" strokeWidth="1" />
          <line x1="64" y1="89" x2="59" y2="93" strokeWidth="1" />
          <line x1="79" y1="74" x2="75" y2="79" strokeWidth="1" />
        </g>

        {/* Center Pivot Point */}
        <circle cx="100" cy="110" r="4.5" fill="url(#ringGrad)" />

        {/* Beautiful sweeping arrow swooping from bottom-left to top-right */}
        {/* Curved Path: sweeps from bottom-left (around (50, 150)) curves inward to the center and launches up-right */}
        <path
          d="M 45 130 C 40 100, 60 70, 95 105 L 142 58"
          stroke="url(#arrowGrad)"
          strokeWidth="6.5"
          strokeLinecap="round"
          filter={theme === 'dark' ? 'url(#neonGlow)' : undefined}
        />
        
        {/* Dynamic soaring Q-Arrow swooping tail details */}
        <path
          d="M 45 130 C 50 160, 110 170, 150 120"
          stroke="url(#ringGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          className="opacity-80"
        />

        {/* Large Arrow Head pointing up-right, breaking out */}
        <path
          d="M 125 54 L 150 50 L 146 75 Z"
          fill="url(#arrowGrad)"
          filter={theme === 'dark' ? 'url(#neonGlow)' : undefined}
        />
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="text-center mt-3">
          <h1 className={`text-4xl font-extrabold tracking-tight ${textColor} font-sans flex items-center justify-center gap-1`}>
            Res<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-mono italic">Q</span>Time
          </h1>
          <p className={`text-[10px] font-bold tracking-[0.25em] ${subtitleColor} mt-1.5 font-mono uppercase`}>
            Your AI Productivity Companion
          </p>
        </div>
      )}
    </div>
  );
}
