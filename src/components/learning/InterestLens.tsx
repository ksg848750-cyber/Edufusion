'use client';

import { INTEREST_EMOJIS, INTEREST_LABELS, INTEREST_TEASERS } from '@/lib/utils';
import NbButton from '@/components/ui/NbButton';

interface InterestLensProps {
  userInterests: string[];
  topicTitle: string;
  onSelect: (interest: string) => void;
  selectedInterest: string | null;
}

export default function InterestLens({
  userInterests,
  topicTitle,
  onSelect,
  selectedInterest,
}: InterestLensProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden nb-bg-grid">
      <div className="nb-scanline-overlay" />

      <h1
        className="nb-display text-center relative z-10"
        style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'var(--volt)', lineHeight: 0.9, letterSpacing: '-0.02em' }}
      >
        HOW SHALL WE <br />
        <span className="nb-glitch" style={{ color: 'var(--plasma)', textShadow: '6px 6px 0 black' }}>EXPLORE</span> TODAY?
      </h1>

      <p
        className="nb-mono text-center mt-5 bg-white text-black px-4 py-1 font-bold transform -rotate-1"
        style={{ fontSize: '16px' }}
      >
        &ldquo;{topicTitle.toUpperCase()}&rdquo;
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12 max-w-6xl w-full relative z-10">
        {userInterests.map((interest, index) => {
          const isSelected = selectedInterest === interest;
          return (
            <div key={interest} className="group">
              <div
                onClick={() => onSelect(interest)}
                className="nb-card cursor-pointer text-center p-10 transition-all duration-300"
                style={{
                  background: isSelected ? 'var(--volt)' : 'var(--ink)',
                  color: isSelected ? 'var(--ink)' : 'var(--chalk)',
                  border: 'var(--bd)',
                  boxShadow: isSelected ? 'var(--sh-lg)' : 'var(--sh)',
                  transform: isSelected ? 'translateY(-12px) rotate(3deg)' : 'none',
                }}
              >
                <div style={{ fontSize: '80px', filter: isSelected ? 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' : 'grayscale(1) opacity(0.3)' }} className="transition-all group-hover:grayscale-0 group-hover:opacity-100">
                  {INTEREST_EMOJIS[interest] || '🎯'}
                </div>
                <div className="nb-display mt-6" style={{ fontSize: '30px', lineHeight: 1 }}>
                  {INTEREST_LABELS[interest]?.toUpperCase() || interest}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="nb-mono text-center mb-4" style={{ fontSize: '11px', color: '#666' }}>
          Pick one. We&apos;ll explain everything through that world.
        </p>
      </div>
    </div>
  );
}
