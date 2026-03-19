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
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="nb-scanline-overlay" />

      <h1
        className="nb-display text-center relative z-10"
        style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'var(--volt)', lineHeight: 1 }}
      >
        HOW SHALL WE <br />
        <span style={{ color: 'var(--plasma)', textShadow: '4px 4px 0 black' }}>EXPLORE</span> TODAY?
      </h1>

      <p
        className="nb-mono text-center mt-3"
        style={{ fontSize: '14px', color: '#666' }}
      >
        &ldquo;{topicTitle}&rdquo;
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10 max-w-5xl w-full">
        {userInterests.map((interest, index) => {
          const isSelected = selectedInterest === interest;
          return (
            <div key={interest}>
              <div
                onClick={() => onSelect(interest)}
                className="nb-card cursor-pointer text-center p-8 transition-all duration-300"
                style={{
                  background: isSelected ? 'var(--volt)' : 'var(--ink)',
                  color: isSelected ? 'var(--ink)' : 'var(--chalk)',
                  border: 'var(--bd)',
                  borderRadius: 'var(--radius)',
                  boxShadow: isSelected ? 'var(--sh-lg)' : 'var(--sh)',
                  transform: isSelected ? 'translateY(-8px) rotate(2deg)' : 'none',
                }}
              >
                <div style={{ fontSize: '64px', filter: isSelected ? 'none' : 'grayscale(0.5) opacity(0.8)' }}>
                  {INTEREST_EMOJIS[interest] || '🎯'}
                </div>
                <div className="nb-display mt-5" style={{ fontSize: '28px' }}>
                  {INTEREST_LABELS[interest] || interest}
                </div>
                <div
                  className="nb-mono mt-2"
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: isSelected ? 'var(--ink)' : 'var(--chalk)',
                    opacity: 0.5,
                  }}
                >
                  {INTEREST_TEASERS[interest] || ''}
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
        <NbButton
          variant="volt"
          size="lg"
          disabled={!selectedInterest}
          onClick={() => selectedInterest && onSelect(selectedInterest)}
        >
          START LEARNING →
        </NbButton>
      </div>
    </div>
  );
}
