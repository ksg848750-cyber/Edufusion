'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  variant?: 'volt' | 'plasma' | 'ion' | 'nova';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  variant = 'volt',
  height = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  const heightClass = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  }[height];

  const getColor = () => `var(--${variant})`;

  return (
    <div className={cn('w-full flex items-center gap-3', className)}>
      <div className={cn('nb-progress w-full', heightClass)}>
        <motion.div
          className="nb-progress-bar h-full"
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: getColor() }}
        >
          {/* Animated scanline overlay internally */}
          <div className="absolute inset-0 w-full h-full opacity-30" 
               style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
        </motion.div>
      </div>
      {showLabel && (
        <span className="nb-mono text-xs w-10 text-right">
          {safeProgress}%
        </span>
      )}
    </div>
  );
}
