'use client';

import { motion } from 'framer-motion';

interface ThemeFlareProps {
  interest: string;
}

export default function ThemeFlare({ interest }: ThemeFlareProps) {
  if (interest === 'cricket') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1] opacity-30">
        <div className="absolute top-0 left-0 w-48 h-48 bg-white blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-white blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-full h-1/3" style={{ background: 'linear-gradient(to top, rgba(var(--theme-accent-rgb), 0.3), transparent)' }} />
      </div>
    );
  }

  if (interest === 'anime') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1] opacity-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <motion.div 
          animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
          transition={{ duration: 0.1, repeat: Infinity }}
          className="absolute inset-0 border-[40px] skew-x-12"
          style={{ borderColor: 'rgba(var(--theme-accent-rgb), 0.15)' }}
        />
      </div>
    );
  }

  if (interest === 'gaming') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1] opacity-40">
        <div className="absolute inset-0 nb-bg-grid opacity-30" style={{ 
          backgroundSize: '24px 24px', 
          backgroundImage: 'linear-gradient(rgba(var(--theme-accent-rgb), 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-accent-rgb), 0.1) 1px, transparent 1px)' 
        }} />
        <div className="absolute top-0 left-0 w-full h-1.5 animate-scan" style={{ background: 'linear-gradient(to right, transparent, var(--theme-accent), transparent)', boxShadow: '0 0 15px var(--theme-accent)' }} />
      </div>
    );
  }

  if (interest === 'f1') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1] opacity-20">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-30" />
         <div className="absolute bottom-0 left-0 w-full h-3 animate-pulse" style={{ background: 'var(--theme-accent)', boxShadow: '0 0 20px var(--theme-accent)' }} />
      </div>
    );
  }

  if (interest === 'movies') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1] opacity-30">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'radial-gradient(circle at 50% -10%, rgba(var(--theme-accent-rgb), 0.25), transparent 60%)' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 animate-pulse" />
      </div>
    );
  }

  if (interest === 'football') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1] opacity-20">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(90deg, transparent 49.5%, rgba(var(--theme-text-rgb), 0.2) 50%, transparent 50.5%)', backgroundSize: '10% 100%' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-8 rounded-full opacity-30" style={{ borderColor: 'var(--theme-accent)' }} />
      </div>
    );
  }

  if (interest === 'music') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1] opacity-30">
        <div className="absolute bottom-0 left-0 w-full h-1/2" style={{ background: 'linear-gradient(to top, rgba(var(--theme-accent-rgb), 0.2), transparent)' }} />
        <div className="absolute top-1/2 left-0 w-full h-1 shadow-2xl" style={{ background: 'var(--theme-accent-secondary)', boxShadow: '0 0 30px rgba(var(--theme-accent-secondary-rgb), 0.8)' }} />
      </div>
    );
  }

  if (interest === 'tvshows') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1] opacity-20">
        <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top right, rgba(var(--theme-accent-rgb), 0.1), transparent)' }} />
      </div>
    );
  }

  return null;
}
