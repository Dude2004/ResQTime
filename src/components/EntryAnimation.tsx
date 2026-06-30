import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';

interface EntryAnimationProps {
  userName: string;
  theme: 'light' | 'dark';
  onComplete: () => void;
}

export default function EntryAnimation({ userName, theme, onComplete }: EntryAnimationProps) {
  useEffect(() => {
    // Automatically trigger completion after animation sequence
    const timer = setTimeout(() => {
      onComplete();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const isDark = theme === 'dark';

  return (
    <div 
      id="entry-animation-container"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-6 max-w-md px-6 text-center relative">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
          }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut" 
          }}
          className="flex flex-col items-center justify-center"
        >
          {/* Logo component */}
          <Logo size={100} showText={true} theme={theme} />
        </motion.div>

        {/* Dynamic welcome message with delayed fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold tracking-wide text-cyan-400 font-mono uppercase">
            Establishing Secure Sync
          </p>
          <h2 className={`text-xl md:text-2xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{userName}</span>
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Your personalized stress-relief dashboard is initializing...
          </p>
        </motion.div>

        {/* Subtle decorative glowing background ring */}
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute w-72 h-72 bg-cyan-500/10 rounded-full blur-2xl -z-10"
        />
      </div>
    </div>
  );
}
