'use client';

import { useState } from 'react';
import NbCard from '@/components/ui/NbCard';
import NbButton from '@/components/ui/NbButton';
import type { Explanation } from '@/types/explanation';
import { INTEREST_EMOJIS, INTEREST_LABELS } from '@/lib/utils';

interface SceneExplainerProps {
  explanation: Explanation;
  interest: string;
  mode: 'casual' | 'exam';
  onGenerateImage: () => void;
  imageUrl?: string;
  loadingImage?: boolean;
}

export default function SceneExplainer({
  explanation,
  interest,
  mode,
  onGenerateImage,
  imageUrl,
  loadingImage,
}: SceneExplainerProps) {
  const [showImage, setShowImage] = useState(false);

  const handleGenerateImage = () => {
    setShowImage(true);
    onGenerateImage();
  };

  return (
    <div className="space-y-6">
      {/* Scene Source Tag */}
      <div className="nb-fade-in">
        <span
          className="nb-mono inline-block px-3 py-1"
          style={{
            fontSize: '10px',
            background: 'var(--solar)',
            color: '#fff',
            border: 'var(--bd)',
            boxShadow: 'var(--sh-sm)',
          }}
        >
          📍 {explanation.scene_source?.toUpperCase() || 'REAL SCENE'}
        </span>
      </div>

      {/* BEAT 1 — THE HOOK */}
      <div className="nb-fade-in">
        <NbCard variant="solar" className="border-l-[8px]" style={{ borderLeftColor: 'var(--solar)', borderRadius: '0' }}>
          <div className="nb-mono mb-2" style={{ fontSize: '10px', color: 'var(--solar)', fontWeight: 'bold', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            THE HOOK
          </div>
          <p className="nb-display" style={{ fontSize: '26px', lineHeight: 1.2, color: 'var(--chalk)' }}>
            {explanation.hook}
          </p>
        </NbCard>
      </div>

      {/* BEAT 2 — THE SCENE */}
      <div className="nb-fade-in">
        <NbCard variant="volt" style={{ borderRadius: '0' }}>
          <div className="nb-mono mb-3" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            {INTEREST_EMOJIS[interest]} THE SCENE — {INTEREST_LABELS[interest]?.toUpperCase()}
          </div>
          <div style={{ color: 'var(--chalk)', fontSize: '18px', lineHeight: 1.6 }}>
            {explanation.scene?.split('. ').map((sentence, i) => (
              <span key={i}>
                {sentence}{i < (explanation.scene?.split('. ').length || 1) - 1 ? '. ' : ''}
              </span>
            ))}
          </div>

          {/* Generate Scene Image Button */}
          <div className="mt-6">
            {!showImage ? (
              <NbButton variant="volt" size="sm" onClick={handleGenerateImage}>
                🖼️ VISUALIZE THIS SCENE →
              </NbButton>
            ) : loadingImage ? (
              <div className="nb-mono" style={{ fontSize: '12px', color: '#666' }}>
                Painting your scene...
              </div>
            ) : imageUrl ? (
              <div className="mt-4 nb-fade-in">
                <img
                  src={imageUrl}
                  alt={explanation.scene_source || 'Scene illustration'}
                  className="w-full"
                  style={{ border: 'var(--bd)', boxShadow: 'var(--sh)', borderRadius: '0' }}
                />
              </div>
            ) : null}
          </div>
        </NbCard>
      </div>

      {/* BEAT 3 — THE TWIST */}
      <div className="nb-fade-in">
        <NbCard variant="plasma" className="text-center">
          <p className="nb-display" style={{ fontSize: '22px', color: 'var(--chalk)', lineHeight: 1.3 }}>
            {explanation.twist}
          </p>
        </NbCard>
      </div>

      {/* BEAT 4 — THE DEEP DIVE */}
      <div className="nb-fade-in">
        <div className="p-8 bg-black/20 border-2 border-white/5">
          <div className="nb-mono mb-4" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            THE DEEP DIVE
          </div>
          <div className="space-y-6">
            {explanation.deep_dive?.split('\n\n').map((paragraph, i) => (
              <p key={i} style={{ color: 'var(--chalk)', lineHeight: 1.7, fontSize: '16px' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* CONCEPT MAPPING */}
      {explanation.mapping && explanation.mapping.length > 0 && (
        <div className="nb-fade-in">
          <NbCard variant="nova">
            <div className="nb-mono mb-3" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              CONCEPT MAPPING
            </div>
            <div className="space-y-2">
              {explanation.mapping.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 nb-mono"
                  style={{ fontSize: '13px' }}
                >
                  <span style={{ color: 'var(--chalk)' }}>{m.scene_element}</span>
                  <span style={{ color: '#666' }}>→</span>
                  <span style={{ color: 'var(--nova)' }}>{m.concept}</span>
                </div>
              ))}
            </div>
          </NbCard>
        </div>
      )}

      {/* KEY POINTS (Exam Mode Only) */}
      {mode === 'exam' && explanation.key_points && explanation.key_points.length > 0 && (
        <div className="nb-fade-in">
          <NbCard variant="plasma">
            <div className="nb-mono mb-3" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              EXAM KEY POINTS
            </div>
            <ol className="nb-mono space-y-2" style={{ fontSize: '12px', color: 'var(--chalk)' }}>
              {explanation.key_points.map((point, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: 'var(--plasma)' }}>{i + 1}.</span>
                  <span>{point}</span>
                </li>
              ))}
            </ol>
          </NbCard>
        </div>
      )}

      {/* BEAT 5 — TECHNICAL */}
      <div className="nb-fade-in">
        <NbCard variant="ion">
          <div className="nb-mono mb-3" style={{ fontSize: '10px', color: 'var(--ion)', fontWeight: 'bold', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            CORE TECHNICAL DEFINITION
          </div>
          <p style={{ color: 'var(--chalk)', lineHeight: 1.7, fontSize: '15px', fontStyle: 'italic' }}>
            &ldquo;{explanation.technical}&rdquo;
          </p>
        </NbCard>
      </div>

      {/* BEAT 6 — WHERE IT BREAKS */}
      <div className="nb-fade-in">
        <div
          className="p-6"
          style={{
            borderLeft: '6px solid var(--solar)',
            background: 'rgba(255, 107, 107, 0.05)',
          }}
        >
          <div className="nb-mono mb-2" style={{ fontSize: '9px', color: 'var(--solar)', fontWeight: 'bold', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            LIMITS OF THE ANALOGY
          </div>
          <p style={{ color: 'var(--chalk)', opacity: 0.7, fontSize: '14px', lineHeight: 1.6 }}>
            {explanation.analogy_breaks}
          </p>
        </div>
      </div>

      {/* STORYBOARD */}
      {explanation.storyboard && explanation.storyboard.length > 0 && (
        <div className="nb-fade-in">
          <div className="nb-mono mb-3" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            SCENE STORYBOARD
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3">
            {explanation.storyboard.map((frame, i) => {
              const colors = ['var(--volt)', 'var(--plasma)', 'var(--ion)', 'var(--solar)'];
              return (
                <div
                  key={i}
                  className="nb-card flex-shrink-0"
                  style={{
                    borderTop: `4px solid ${colors[i % colors.length]}`,
                    minWidth: '200px',
                    maxWidth: '250px',
                    background: 'var(--ink)',
                  }}
                >
                  <div className="nb-display" style={{ fontSize: '32px', color: colors[i % colors.length] }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <p className="mt-2" style={{ fontSize: '12px', color: 'var(--chalk)' }}>
                    {frame}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BEAT 7 — CLIFFHANGER SUMMARY */}
      <div className="nb-fade-in">
        <div
          className="nb-card text-center py-6"
          style={{ background: 'var(--ink)', border: 'var(--bd)' }}
        >
          <p className="nb-display" style={{ fontSize: '20px', color: 'var(--volt)', lineHeight: 1.3 }}>
            {explanation.summary}
          </p>
        </div>
      </div>
    </div>
  );
}
