'use client';

import { useEffect, useState } from 'react';
import NbButton from '@/components/ui/NbButton';
import { LEVEL_UP_MESSAGES } from '@/lib/xp';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  tier: string;
  activeInterest?: string;
}

export default function LevelUpModal({
  isOpen,
  onClose,
  level,
  tier,
  activeInterest,
}: LevelUpModalProps) {
  const [confettiFired, setConfettiFired] = useState(false);

  useEffect(() => {
    if (isOpen && !confettiFired) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#D4FF00', '#FF2D78', '#00FFD1', '#FF8C00', '#7B2FFF'],
        });
      });
      setConfettiFired(true);
    }
    if (!isOpen) setConfettiFired(false);
  }, [isOpen, confettiFired]);

  if (!isOpen) return null;

  const message = activeInterest
    ? LEVEL_UP_MESSAGES[activeInterest] || 'You leveled up! Keep going!'
    : 'You leveled up! Keep going!';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 nb-fade-in"
      style={{ background: 'rgba(10, 10, 10, 0.9)' }}
      onClick={onClose}
    >
      <div 
        className="nb-card text-center p-12 max-w-lg relative overflow-hidden"
        style={{ 
          background: 'var(--theme-bg)', 
          border: 'var(--theme-border)', 
          boxShadow: 'var(--theme-shadow)',
          borderRadius: '0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="nb-display nb-glitch" style={{ fontSize: '72px', color: 'var(--theme-accent)' }}>
          LEVEL UP!
        </div>

        <div className="mt-4">
          <span
            className="nb-display inline-block px-6 py-2"
            style={{
              fontSize: '48px',
              background: 'var(--theme-accent)',
              color: 'var(--theme-bg)',
              border: 'var(--theme-border)',
              boxShadow: 'var(--theme-shadow)',
              borderRadius: '0'
            }}
          >
            {level}
          </span>
        </div>

        <div className="mt-4">
          <span className={`nb-tier nb-tier-${tier.toLowerCase()}`}>
            {tier}
          </span>
        </div>

        <p className="nb-mono mt-8" style={{ fontSize: '15px', color: 'var(--theme-text)', lineHeight: 1.5 }}>
          {message}
        </p>

        <div className="mt-6">
          <NbButton 
            variant="default" 
            onClick={onClose}
            style={{ background: 'var(--theme-accent)', color: 'var(--theme-bg)' }}
          >
            KEEP GOING →
          </NbButton>
        </div>
      </div>
    </div>
  );
}
