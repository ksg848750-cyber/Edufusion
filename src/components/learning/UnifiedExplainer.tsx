'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldAlert, CheckCircle2, RefreshCw, Loader2, Image as ImageIcon } from 'lucide-react';
import NbCard from '@/components/ui/NbCard';
import NbButton from '@/components/ui/NbButton';
import type { Explanation } from '@/types/explanation';

interface UnifiedExplainerProps {
  explanation: Explanation;
  interest: string;
  mode: 'casual' | 'exam';
  loadingImage?: boolean;
  imageUrl?: string;
  onGenerateImage?: () => void;
  onRegenerate?: (specificity: string) => void;
  onGenerateStoryboard?: () => void;
  storyboardImages?: string[];
  loadingStoryboard?: boolean;
  isCourseMode?: boolean;
  fallbackUrl?: string;
  storyboardFallbacks?: string[];
}

export default function UnifiedExplainer({
  explanation,
  interest,
  mode,
  loadingImage,
  imageUrl,
  onGenerateImage,
  onRegenerate,
  onGenerateStoryboard,
  storyboardImages,
  loadingStoryboard,
  isCourseMode = false,
}: UnifiedExplainerProps) {
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [retryCounts, setRetryCounts] = useState<Record<string, number>>({});

  const handleImageError = (id: string) => {
    const currentRetries = retryCounts[id] || 0;
    if (currentRetries < 5) {
      // Exponential backoff + Jitter (3.5s to 15s)
      const delay = Math.min(3500 * Math.pow(1.5, currentRetries) + Math.random() * 2000, 15000);
      
      console.log(`Retrying image ${id} in ${Math.round(delay/1000)}s... (Attempt ${currentRetries + 1})`);
      
      setTimeout(() => {
        setRetryCounts(prev => ({ ...prev, [id]: currentRetries + 1 }));
        // Brief toggle to force <img> re-render
        setBrokenImages(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
            setBrokenImages(prev => ({ ...prev, [id]: false }));
        }, 50);
      }, delay);
    } else {
      setBrokenImages(prev => ({ ...prev, [id]: true }));
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Main Column */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <NbCard variant="default" className="p-0 overflow-hidden" style={{ border: 'var(--theme-border)', background: 'var(--theme-bg)', boxShadow: 'var(--theme-shadow)' }}>
          {/* Header Strip */}
          <div className="border-b-4 border-black px-6 py-3 flex items-center justify-between" style={{ background: 'var(--theme-accent)' }}>
            <span className="nb-mono text-black font-bold text-[11px] tracking-thinner">
              {explanation.scene_source?.toUpperCase() || 'CINEMATIC MASTERCLASS'}
            </span>
            <span className="nb-mono text-black/60 text-[9px] font-bold">V16_ENGINE_ACTIVE</span>
          </div>

          <div className="p-8 space-y-10">
            {/* 1. THE HOOK */}
            <section className="nb-fade-in">
              <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--theme-accent-secondary)', color: 'var(--theme-bg)', fontWeight: 'bold' }}>
                THE HOOK
              </span>
              <p className="mt-4 nb-display" style={{ fontSize: '32px', color: 'var(--theme-text)', fontWeight: 'bold', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {explanation.hook}
              </p>
            </section>

            {/* 2. THE SCENE */}
            <section className="nb-fade-in">
              <div className="flex items-center justify-between mb-4">
                <span className="nb-mono px-2 py-1 inline-flex items-center gap-2" style={{ fontSize: '10px', background: 'var(--theme-accent)', color: 'var(--theme-bg)', fontWeight: 'bold' }}>
                  <Zap className="w-3 h-3" /> THE SCENE
                </span>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 blur opacity-25 group-hover:opacity-50 transition duration-1000" style={{ background: 'var(--theme-accent)' }}></div>
                <div className="relative p-7 border-4 border-black bg-black/60" style={{ boxShadow: '4px 4px 0 var(--theme-accent)' }}>
                  <div className="space-y-4">
                    {explanation.scene?.split(/\n|\r\n/).filter(line => line.trim().length > 5).map((para, i) => {
                      const cleanPara = para.replace(/^\d+\.\s*/, '').trim();
                      if (!cleanPara) return null;
                      
                      return (
                        <div key={i} className="flex gap-4 group">
                          <div className="nb-mono text-volt/40 group-hover:text-volt transition-colors text-[10px] font-bold pt-1">
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          <p className="nb-mono text-white/90 leading-relaxed flex-1" style={{ fontSize: '15px' }}>
                            {cleanPara}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Image Trigger */}
                  {onGenerateImage && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                      {(!imageUrl || brokenImages['main-scene']) && !loadingImage ? (
                        <div className="flex flex-col gap-2">
                          <NbButton variant="volt" size="sm" onClick={() => {
                            if (brokenImages['main-scene']) {
                              setBrokenImages(prev => ({ ...prev, ['main-scene']: false }));
                            }
                            onGenerateImage();
                          }} className="gap-2">
                            <ImageIcon className="w-4 h-4" /> {brokenImages['main-scene'] ? 'RETRY VISUALIZATION' : 'VISUALIZE THIS SCENE'}
                          </NbButton>
                          {brokenImages['main-scene'] && imageUrl && (
                            <p className="nb-mono text-[9px] text-volt/50 text-center uppercase tracking-widest">
                              Service busy. Try again in a moment.
                            </p>
                          )}
                        </div>
                      ) : loadingImage ? (
                        <div className="flex items-center gap-3 nb-mono text-volt text-xs font-bold animate-pulse">
                          <Loader2 className="w-4 h-4 animate-spin" /> PAINTING YOUR MASTERPIECE...
                        </div>
                      ) : imageUrl && !brokenImages['main-scene'] ? (
                        <div className="relative aspect-video bg-[#0a0a0a] border-4 border-black overflow-hidden group">
                          {/* Blueprint Placeholder Backing */}
                          <div className="absolute inset-0 opacity-20 pointer-events-none" 
                            style={{ 
                              backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)',
                              backgroundSize: '24px 24px'
                            }} 
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                             <div className="nb-mono text-[9px] text-white/30 animate-pulse uppercase tracking-[0.2em] mb-2">ANALYZING SCENE PROPERTIES...</div>
                             <div className="w-32 h-[1px] bg-white/10 relative overflow-hidden">
                                <motion.div animate={{ x: ['100%', '-100%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 bg-volt shadow-[0_0_10px_var(--volt)] w-1/2" />
                             </div>
                          </div>

                          {!brokenImages['main-scene'] && (
                            <img 
                              src={imageUrl + (retryCounts['main-scene'] ? `&retry=${retryCounts['main-scene']}` : '')} 
                              alt="Scene visualization" 
                              className="relative z-10 w-full h-full object-cover shadow-[10px_10px_0_black] hover:scale-[1.01] transition-transform duration-500"
                              onError={() => handleImageError('main-scene')}
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 3. THE TWIST */}
            <section className="nb-fade-in">
              <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--theme-accent-tertiary)', color: 'var(--theme-bg)', fontWeight: 'bold' }}>
                THE CONNECTION
              </span>
              <div className="mt-5 p-6 border-l-8 transform -rotate-1" style={{ borderColor: 'var(--theme-accent-tertiary)', background: 'rgba(var(--theme-accent-tertiary-rgb), 0.1)' }}>
                <p style={{ fontSize: '20px', color: 'var(--theme-text)', fontStyle: 'italic', fontWeight: 'bold', lineHeight: 1.4 }}>
                  {explanation.twist}
                </p>
              </div>
            </section>

            {/* 4. DEEP DIVE */}
            <section className="nb-fade-in">
              <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--theme-accent)', color: 'var(--theme-bg)', fontWeight: 'bold' }}>
                THE MASTERCLASS (STEP-BY-STEP)
              </span>
              <div className="mt-6 space-y-4">
                {explanation.deep_dive?.split(/\n|\r\n/).filter(line => line.trim().length > 5).map((para, i) => {
                  const cleanPara = para.replace(/^\d+\.\s*/, '').trim();
                  if (!cleanPara) return null;
                  
                  return (
                    <div 
                      key={i} 
                      className="group relative p-6 border-2 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300"
                      style={{ borderLeft: '4px solid var(--theme-accent)' }}
                    >
                      <div className="flex gap-4">
                        <div className="nb-display text-volt opacity-20 group-hover:opacity-100 transition-opacity text-2xl leading-none">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <p className="nb-mono flex-1" style={{ fontSize: '14px', color: 'var(--theme-text)', lineHeight: 1.6 }}>
                          {cleanPara}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Divider */}
            <div className="pt-8 border-t-2 border-white/5" />
          </div>
        </NbCard>

        {/* 5. CONCEPT MAPPER (Now Prominent) */}
        {explanation.mapping && explanation.mapping.length > 0 && (
          <section className="nb-fade-in">
            <NbCard variant="default" className="p-0 overflow-hidden" style={{ border: 'var(--theme-border)', background: 'var(--theme-bg)', boxShadow: 'var(--theme-shadow)' }}>
              <div className="border-b-4 border-black px-6 py-3" style={{ background: 'var(--theme-accent-secondary)' }}>
                <span className="nb-mono text-black font-bold text-[11px] tracking-thinner uppercase">
                   The Concept Bridge (Analogy Mapper)
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {explanation.mapping.map((item, id) => (
                  <div key={id} className="relative group p-4 border-2 border-white/10 hover:border-volt/50 transition-colors bg-white/[0.02]">
                    <div className="nb-mono text-volt text-[9px] font-bold mb-2 uppercase tracking-widest opacity-60">TECHNICAL TERM</div>
                    <div className="nb-display text-white text-lg mb-4">{item.concept}</div>
                    <div className="nb-mono text-[#888] text-[9px] font-bold mb-2 uppercase tracking-widest opacity-60">SCENE ELEMENT</div>
                    <div className="nb-mono text-chalk text-xs bg-black/40 p-3 border-l-2 border-volt">{item.scene_element}</div>
                  </div>
                ))}
              </div>
            </NbCard>
          </section>
        )}

        {/* Storyboard Frames */}
        {explanation.storyboard && (
          <div className="pb-12">
            <div className="flex items-center justify-between mb-6">
              <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--theme-accent-secondary)', color: 'var(--theme-bg)', fontWeight: 'bold' }}>
                THE SEQUENCE
              </span>
              {onGenerateStoryboard && (!storyboardImages || Object.keys(brokenImages).some(k => k.startsWith('storyboard-'))) && !loadingStoryboard && (
                <NbButton variant="default" size="sm" onClick={() => {
                  // Clear broken storyboard states
                  const newBroken = { ...brokenImages };
                  Object.keys(newBroken).forEach(k => {
                    if (k.startsWith('storyboard-')) delete newBroken[k];
                  });
                  setBrokenImages(newBroken);
                  onGenerateStoryboard();
                }} style={{ background: 'var(--theme-accent)', color: 'var(--theme-bg)' }}>
                  🎬 {storyboardImages ? 'RETRY STORYBOARD' : 'VISUALIZE STORYBOARD'}
                </NbButton>
              )}
              {loadingStoryboard && (
                <div className="flex-1 flex items-center gap-4 bg-black/40 border-2 border-dashed border-volt/20 p-3 overflow-hidden">
                  <div className="flex items-center gap-2 nb-mono text-[9px] text-volt whitespace-nowrap">
                    <div className="w-2 h-2 rounded-full bg-volt animate-pulse" />
                    SCENE RENDER: {storyboardImages?.length || 0} / {explanation.storyboard.length}
                  </div>
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden min-w-[100px]">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((storyboardImages?.length || 0) / explanation.storyboard.length) * 100}%` }}
                        className="h-full bg-volt shadow-[0_0_10px_var(--volt)]"
                     />
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {explanation.storyboard.map((frame, i) => (
                <NbCard key={i} variant="dark" className="p-0 border-2 border-white/5 relative aspect-square flex flex-col items-center justify-center text-center group hover:border-volt/50 transition-colors overflow-hidden">
                  {storyboardImages?.[i] && !brokenImages[`storyboard-${i}`] ? (
                    <div className="absolute inset-0 bg-ink group-hover:bg-[#111] transition-colors">
                      {/* Sub-grid blueprint */}
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                      
                      {!brokenImages[`storyboard-${i}`] && storyboardImages?.[i] && (
                        <motion.img 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          src={storyboardImages[i] + (retryCounts[`storyboard-${i}`] ? `&retry=${retryCounts[`storyboard-${i}`]}` : '')} 
                          alt={`Frame ${i+1}`}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                          onError={() => handleImageError(`storyboard-${i}`)}
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  ) : null}
                  
                  <div className="relative z-10 p-5 bg-black/40 w-full h-full flex flex-col items-center justify-center">
                    <span className="nb-display text-volt stroke-black text-4xl mb-3 group-hover:scale-110 transition-transform">{i+1}</span>
                    <p className="nb-mono text-[10px] text-chalk/50 uppercase tracking-widest">{frame}</p>
                  </div>
                </NbCard>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Panel */}
      <div className="flex flex-col gap-6">
        {/* Definition & Breakdown */}
        <NbCard variant="default" className="p-6 border-4" style={{ border: 'var(--theme-border)', background: 'var(--theme-accent)', boxShadow: 'var(--theme-shadow)' }}>
           <span className="nb-mono text-[10px] text-black/50 block mb-4 font-bold border-b border-black/10 pb-2">CORE DEFINITION</span>
           <p className="nb-mono italic text-black" style={{ fontSize: '14px', lineHeight: 1.7 }}>
             "{explanation.technical}"
           </p>
        </NbCard>

        <NbCard variant="default" className="p-6 border-4" style={{ border: 'var(--theme-border)', background: 'var(--theme-accent-tertiary)', boxShadow: 'var(--theme-shadow)' }}>
           <span className="nb-mono text-[10px] text-black/50 block mb-4 font-bold border-b border-black/10 pb-2">CRITICAL LIMITS</span>
           <p className="nb-mono text-black leading-relaxed" style={{ fontSize: '12px' }}>
             {explanation.analogy_breaks}
           </p>
        </NbCard>

        {/* Exam Points */}
        {mode === 'exam' && explanation.key_points && (
          <NbCard variant="default" className="p-6 border-4 border-black" style={{ background: 'var(--theme-accent-secondary)', boxShadow: '6px 6px 0 black' }}>
             <span className="nb-mono text-[10px] text-black/50 block mb-4 font-bold border-b border-black/10 pb-2 uppercase tracking-tighter">EXAM CRITICAL POINTS</span>
             <ul className="space-y-4">
               {explanation.key_points.map((pt, i) => (
                 <li key={i} className="flex gap-3 text-[12px] nb-mono text-black leading-tight font-bold">
                    <span className="text-white">▸</span>
                    {pt}
                 </li>
               ))}
             </ul>
          </NbCard>
        )}

        {/* Cliffhanger */}
        <NbCard variant="default" className="p-8 border-4 shadow-pop" style={{ border: 'var(--theme-border)', background: 'var(--volt)', boxShadow: 'var(--theme-shadow)' }}>
           <span className="nb-mono text-ink/40 text-[9px] font-bold block mb-4">FINAL SUMMARY</span>
           <p className="nb-display text-ink" style={{ fontSize: '24px', lineHeight: 1.2 }}>
             &ldquo;{explanation.summary}&rdquo;
           </p>
        </NbCard>
      </div>
    </motion.div>
  );
}
