'use client';

import { useState } from 'react';
import NbCard from '@/components/ui/NbCard';
import NbButton from '@/components/ui/NbButton';
import { INTEREST_EMOJIS, INTEREST_LABELS } from '@/lib/utils';

interface SceneSwitcherProps {
  currentInterest: string;
  userInterests: string[];
  onDifferentScene: () => void;
  onCustomScene: (specificity: string) => void;
  onSwitchInterest: (newInterest: string) => void;
  loading?: boolean;
}

export default function SceneSwitcher({
  currentInterest,
  userInterests,
  onDifferentScene,
  onCustomScene,
  onSwitchInterest,
  loading,
}: SceneSwitcherProps) {
  const [customInput, setCustomInput] = useState('');

  return (
    <NbCard className="p-8" style={{ background: 'var(--ink)', border: 'var(--bd)', boxShadow: 'var(--sh)' }}>
      <div className="nb-mono mb-4" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        WANT A DIFFERENT VIBE?
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <NbButton
          variant="volt"
          onClick={onDifferentScene}
          disabled={loading}
        >
          🔄 NEW SCENE IN THIS WORLD
        </NbButton>
      </div>

      <div className="flex gap-3 mb-8">
        <input
          type="text"
          className="nb-input flex-1"
          placeholder='INPUT CUSTOM COMMAND...'
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customInput.trim()) {
              onCustomScene(customInput.trim());
              setCustomInput('');
            }
          }}
        />
        <NbButton
          variant="solar"
          disabled={!customInput.trim() || loading}
          onClick={() => {
            if (customInput.trim()) {
              onCustomScene(customInput.trim());
              setCustomInput('');
            }
          }}
        >
          USE THIS
        </NbButton>
      </div>

      {/* Switch interest */}
      <div>
        <div className="nb-mono mb-2" style={{ fontSize: '9px', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          OR SWITCH INTEREST
        </div>
        <div className="flex gap-2 flex-wrap">
          {userInterests
            .filter((i) => i !== currentInterest)
            .map((interest) => (
              <button
                key={interest}
                onClick={() => onSwitchInterest(interest)}
                disabled={loading}
                className="nb-mono px-4 py-2 transition-all hover:scale-105 active:scale-95"
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: 'var(--bd)',
                  boxShadow: '4px 4px 0 black',
                  background: 'var(--ink)',
                  color: 'var(--chalk)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {INTEREST_EMOJIS[interest]} {INTEREST_LABELS[interest]?.toUpperCase()}
              </button>
            ))}
        </div>
      </div>
    </NbCard>
  );
}
