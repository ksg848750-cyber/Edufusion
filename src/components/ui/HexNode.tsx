'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Lock, Play } from 'lucide-react';

interface HexNodeProps {
  status: 'locked' | 'available' | 'completed' | 'active';
  title: string;
  onClick?: () => void;
  className?: string;
  delay?: number;
}

export function HexNode({
  status,
  title,
  onClick,
  className,
}: HexNodeProps) {
  let colorVar = 'var(--chalk)';
  let bgVar = 'var(--ink)';
  let Icon = Lock;

  switch (status) {
    case 'locked':
      colorVar = '#555';
      bgVar = '#1a1a1a';
      Icon = Lock;
      break;
    case 'available':
      colorVar = 'var(--volt)';
      bgVar = 'var(--ink)';
      Icon = Play;
      break;
    case 'active':
      colorVar = 'var(--carbon)';
      bgVar = 'var(--volt)';
      Icon = Play;
      break;
    case 'completed':
      colorVar = 'var(--plasma)';
      bgVar = 'var(--ink)';
      Icon = Check;
      break;
  }

  return (
    <div
      onClick={status !== 'locked' ? onClick : undefined}
      className={cn(
        'relative flex flex-col items-center justify-center nb-hex',
        status !== 'locked' ? 'cursor-pointer hover:scale-105 transition-all' : 'cursor-not-allowed',
        status === 'active' ? 'nb-glitch shadow-[0_0_20px_var(--volt)]' : '',
        className
      )}
      style={{
        width: '100px',
        height: '115px',
        background: bgVar,
        color: colorVar,
        borderColor: colorVar,
        borderRadius: '0'
      }}
    >
      <Icon className="w-8 h-8 mb-1" />
      <span
        className="text-[10px] font-mono font-bold text-center px-2 uppercase leading-tight line-clamp-2"
        style={{ color: colorVar }}
      >
        {title}
      </span>
    </div>
  );
}
