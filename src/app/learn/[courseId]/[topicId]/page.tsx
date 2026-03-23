'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import InterestLens from '@/components/learning/InterestLens';
import UnifiedExplainer from '@/components/learning/UnifiedExplainer';
import SceneSwitcher from '@/components/learning/SceneSwitcher';
import VoicePlayer from '@/components/ai/VoicePlayer';
import MentorDrawer from '@/components/ai/MentorDrawer';
import LevelUpModal from '@/components/gamification/LevelUpModal';
import NbButton from '@/components/ui/NbButton';
import NbCard from '@/components/ui/NbCard';
import Navbar from '@/components/layout/Navbar';
import TickerBar from '@/components/layout/TickerBar';
import ThemeFlare from '@/components/learning/ThemeFlare';
import { INTEREST_EMOJIS, INTEREST_LABELS } from '@/lib/utils';
import type { Explanation } from '@/types/explanation';

interface SubtopicData {
  subtopicId: string;
  title: string;
  order: number;
  isCompleted: boolean;
}

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const courseId = params.courseId as string;
  const topicId = params.topicId as string;

  // State
  const [phase, setPhase] = useState<'interest' | 'lesson'>('interest');
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [activeInterest, setActiveInterest] = useState<string>('');
  const [topicTitle, setTopicTitle] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [subtopics, setSubtopics] = useState<SubtopicData[]>([]);
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ level: number; tier: string } | null>(null);
  const [showInterestPicker, setShowInterestPicker] = useState(false);
  const [storyboardImages, setStoryboardImages] = useState<string[] | null>(null);
  const [loadingStoryboard, setLoadingStoryboard] = useState(false);
  const [sessionSeed] = useState(() => Math.floor(Math.random() * 999999));

  // Sync theme to document for global variables
  useEffect(() => {
    if (activeInterest) {
      document.documentElement.setAttribute('data-theme', activeInterest);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [activeInterest]);

  // Fetch topic data
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCourseTitle(data.course?.title || '');
          // Find the topic
          const allTopics = data.topics || [];
          const topic = allTopics.find((t: Record<string, unknown>) => t.topicId === topicId || t.id === topicId);
          if (topic) {
            setTopicTitle(topic.title || '');
          }
          // Get subtopics
          const topicSubtopics = (data.subtopics || [])
            .filter((s: Record<string, unknown>) => s.topicId === topicId)
            .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (a.order as number) - (b.order as number));
          setSubtopics(topicSubtopics.map((s: Record<string, unknown>) => ({
            subtopicId: (s.subtopicId || s.id) as string,
            title: s.title as string,
            order: s.order as number,
            isCompleted: s.isCompleted as boolean,
          })));
        }
      } catch (e) {
        console.error('Failed to fetch topic data:', e);
      }
    }
    fetchData();
  }, [user, courseId, topicId]);

  const currentSubtopic = subtopics[currentSubtopicIndex];

  // Generate explanation
  const generateExplanation = useCallback(async (interest: string, specificity?: string) => {
    if (!user || !currentSubtopic) return;
    setLoading(true);
    setImageUrl('');

    try {
      const token = await user.getIdToken();
      console.log('Fetching explanation for subtopic:', currentSubtopic.subtopicId);
      const res = await fetch(`/api/generate-subtopic-explanation?t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subtopicId: currentSubtopic.subtopicId,
          subtopicTitle: currentSubtopic.title,
          topicTitle,
          courseTitle,
          interest,
          mode: userProfile?.preferredMode || 'casual',
          language: userProfile?.language || 'english',
          specificity,
          subtopicIndex: currentSubtopicIndex,
        }),
      });

      const data = await res.json();
      console.log('Received explanation response:', data._cached ? 'FROM CACHE' : 'GENERATED FRESH');
      if (data.explanation) {
        setExplanation(data.explanation);
      }
    } catch (e) {
      console.error('Failed to generate explanation:', e);
    } finally {
      setLoading(false);
    }
  }, [user, currentSubtopic, topicTitle, courseTitle, userProfile]);

  // Handle interest selection from InterestLens
  const handleInterestSelect = (interest: string) => {
    setSelectedInterest(interest);
  };

  // Auto-generate on subtopic change
  useEffect(() => {
    if (phase === 'lesson' && activeInterest && !explanation && !loading) {
      generateExplanation(activeInterest);
    }
  }, [currentSubtopicIndex, activeInterest, phase, explanation, loading, generateExplanation]);

  const startLearning = () => {
    if (!selectedInterest) return;
    setActiveInterest(selectedInterest);
    setPhase('lesson');
  };

  // Scene Switcher handlers
  const handleDifferentScene = () => {
    generateExplanation(activeInterest);
  };

  const handleCustomScene = (specificity: string) => {
    generateExplanation(activeInterest, specificity);
  };

  const handleSwitchInterest = (newInterest: string) => {
    setActiveInterest(newInterest);
    setShowInterestPicker(false);
    setExplanation(null);
    setImageUrl('');
  };

  // Generate scene image
  const handleGenerateImage = async () => {
    if (!explanation || !user) return;
    setLoadingImage(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/scene-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sceneDescription: explanation.suggested_scene_image_prompt || (Array.isArray(explanation.scene) ? explanation.scene.join(" ") : explanation.scene),
          concept: currentSubtopic?.title || '',
          interest: activeInterest,
          sceneSource: explanation.scene_source,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      }
    } catch (e) {
      console.error('Failed to generate image:', e);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleGenerateStoryboard = async () => {
    console.log("--- START STORYBOARD GENERATION ---");
    if (!user || !explanation || !explanation.storyboard) {
      console.log("MISSING DATA:", { user: !!user, hasExpl: !!explanation, hasStory: !!explanation?.storyboard });
      return;
    }
    console.log("Frames to generate:", explanation.storyboard.length);
    setLoadingStoryboard(true);
    try {
      const token = await user.getIdToken();
      // Generate images one-by-one to respect Pollinations IP rate limits (max 1 concurrent)
      const urls: string[] = [];
      for (let i = 0; i < explanation.storyboard.length; i++) {
        const frame = explanation.storyboard[i];
        try {
          const res = await fetch("/api/scene-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              sceneDescription: frame,
              concept: currentSubtopic?.title || '',
              interest: activeInterest,
              sceneSource: explanation.scene_source
            }),
          });
          const data = await res.json();
          if (data.imageUrl) {
            // Force the same seed for all frames to maintain likeness
            const syncedUrl = data.imageUrl.replace(/seed=\d+/, `seed=${sessionSeed}`);
            urls.push(syncedUrl);
            setStoryboardImages([...urls]);
          }
          // LONGER DELAY (2.5s) to avoid "Too Many Requests" for the user's IP
          await new Promise(r => setTimeout(r, 2500));
        } catch (e) {
          console.error(`Frame ${i} failed:`, e);
        }
      }
    } catch (err) {
      console.error("Storyboard generation failed", err);
    } finally {
      setLoadingStoryboard(false);
    }
  };

  // Mark subtopic complete and navigate
  const handleNextSubtopic = async () => {
    if (!user || !currentSubtopic) return;

    // Update progress
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          subtopicId: currentSubtopic.subtopicId,
          topicId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await (window as any).refreshAuthProfile?.() || refreshProfile(); 
      }

      if (data.leveledUp) {
        setLevelUpData({
          level: data.newLevel || (userProfile?.level || 1) + 1,
          tier: data.newTier || userProfile?.tier || 'Bronze',
        });
      }
    } catch {
      // Non-critical
    }

    // Move to next subtopic
    if (currentSubtopicIndex < subtopics.length - 1) {
      setExplanation(null);
      setImageUrl('');
      setStoryboardImages(null);
      setCurrentSubtopicIndex(prev => prev + 1);
    } else {
      // Topic complete — go back to course
      router.push(`/course/${courseId}`);
    }
  };

  const handlePrevSubtopic = () => {
    if (currentSubtopicIndex > 0) {
      setExplanation(null);
      setImageUrl('');
      setStoryboardImages(null);
      setCurrentSubtopicIndex(prev => prev - 1);
    }
  };

  // Build readable text for voice
  const voiceText = explanation
    ? `${explanation.hook}. ${Array.isArray(explanation.scene) ? explanation.scene.join(". ") : explanation.scene}. ${explanation.twist}. ${Array.isArray(explanation.deep_dive) ? explanation.deep_dive.join(". ") : explanation.deep_dive}`
    : '';

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--ink)' }}>
        <div className="nb-mono" style={{ color: '#666' }}>Loading...</div>
      </div>
    );
  }

  // INTEREST LENS SCREEN
  if (phase === 'interest' || showInterestPicker) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>
        <Navbar />
        <InterestLens
          userInterests={userProfile.interests || []}
          topicTitle={topicTitle || 'Topic'}
          onSelect={handleInterestSelect}
          selectedInterest={selectedInterest}
        />
        {selectedInterest && !showInterestPicker && (
          <div className="fixed bottom-12 left-0 right-0 flex justify-center z-50">
            <NbButton variant="volt" size="lg" onClick={startLearning} className="px-12 py-6 text-xl">
              START LEARNING →
            </NbButton>
          </div>
        )}
        {showInterestPicker && selectedInterest && (
          <div className="fixed bottom-12 left-0 right-0 flex justify-center gap-4 z-50">
            <NbButton variant="dark" onClick={() => setShowInterestPicker(false)}>
              CANCEL
            </NbButton>
            <NbButton
              variant="volt"
              onClick={() => {
                if (selectedInterest) handleSwitchInterest(selectedInterest);
              }}
            >
              SWITCH TO {INTEREST_LABELS[selectedInterest]?.toUpperCase()}
            </NbButton>
          </div>
        )}
      </div>
    );
  }

  // LESSON VIEW
  return (
    <div className="relative overflow-hidden nb-bg-grid transition-all duration-700" style={{ minHeight: '100vh', backgroundColor: 'var(--theme-bg)' }} data-theme={activeInterest}>
      <ThemeFlare interest={activeInterest} />
      <Navbar />
      <TickerBar />

      <ThemeFlare interest={activeInterest} />

      <div className="nb-bg-grid fixed inset-0 z-0" style={{ backgroundColor: 'var(--theme-bg)' }} />
      <div className="relative z-10 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="nb-mono flex items-center gap-2" style={{ fontSize: '11px', color: 'var(--theme-accent)', fontWeight: 'bold' }}>
            {courseTitle.toUpperCase()} <span className="text-white/20">/</span> {topicTitle.toUpperCase()}
          </div>
          <h2 className="nb-display mt-1 nb-glitch" style={{ fontSize: '42px', color: 'var(--theme-text)', letterSpacing: '0.05em' }}>{currentSubtopic?.title}</h2>
        </div>

        {/* Active Interest Pill */}
        <button
          onClick={() => {
            setShowInterestPicker(true);
            setSelectedInterest(null);
          }}
          className="nb-mono px-6 py-3 transition-all hover:scale-105 active:scale-95"
          style={{
            fontSize: '13px',
            fontWeight: 'bold',
            border: 'var(--bd)',
            boxShadow: 'var(--sh-sm)',
            background: 'var(--theme-accent)',
            color: 'var(--theme-bg)',
            borderRadius: '0',
            cursor: 'pointer',
          }}
        >
          EXPLORING THROUGH: <span className="ml-2">{INTEREST_EMOJIS[activeInterest]} {INTEREST_LABELS[activeInterest]?.toUpperCase()} ▼</span>
        </button>
      </div>

      <div className="relative z-10 px-8 pb-32 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content: High Contrast Card */}
          <div className="flex-1">
            <NbCard hover={false} className="p-0 overflow-hidden" variant="default" style={{ border: 'var(--theme-border)', background: 'var(--theme-bg)' }}>
              {/* Progress Tracker (Vibrant) */}
              <div className="px-8 py-5 bg-black/40 border-b-4 border-black flex items-center gap-4">
                  <div className="flex-1 nb-progress-track" style={{ height: '12px', background: 'rgba(255,255,255,0.1)' }}>
                    <div className="nb-progress-fill" style={{ width: `${((currentSubtopicIndex + 1) / Math.max(subtopics.length, 1)) * 100}%`, background: 'var(--theme-accent)', boxShadow: '0 0 15px var(--theme-accent)' }} />
                  </div>
                 <span className="nb-mono text-chalk" style={{ fontSize: '11px', fontWeight: 'bold' }}>{currentSubtopicIndex + 1} OF {subtopics.length}</span>
              </div>

              <div className="p-8">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="nb-cube-scene mb-6">
                      <div className="nb-cube">
                        <div className="nb-cube-face nb-cube-front">E</div>
                        <div className="nb-cube-face nb-cube-back">D</div>
                        <div className="nb-cube-face nb-cube-top">U</div>
                        <div className="nb-cube-face nb-cube-bottom">F</div>
                      </div>
                    </div>
                    <p className="nb-mono" style={{ fontSize: '14px', color: '#888' }}>
                      Crafting your {INTEREST_LABELS[activeInterest]} masterclass...
                    </p>
                  </div>
                ) : explanation ? (
                  <div>
                    <UnifiedExplainer
                      explanation={explanation}
                      interest={activeInterest}
                      mode={(userProfile?.preferredMode as 'casual' | 'exam') || 'casual'}
                      onGenerateImage={handleGenerateImage}
                      onGenerateStoryboard={handleGenerateStoryboard}
                      imageUrl={imageUrl}
                      storyboardImages={storyboardImages || undefined}
                      loadingImage={loadingImage}
                      loadingStoryboard={loadingStoryboard}
                      isCourseMode={true}
                    />

                    {/* Scene Switcher: Now inside the card for continuity */}
                    <div className="mt-12 pt-8 border-t border-black/5">
                      <SceneSwitcher
                        currentInterest={activeInterest}
                        userInterests={userProfile.interests || []}
                        onDifferentScene={handleDifferentScene}
                        onCustomScene={handleCustomScene}
                        onSwitchInterest={handleSwitchInterest}
                        loading={loading}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </NbCard>
          </div>

          {/* Right Panel: Floating Sidebar */}
          <div className="w-full lg:w-[320px] space-y-6">
            <NbCard className="p-6" variant="nova" style={{ border: 'var(--bd)', boxShadow: 'var(--sh-lg)' }}>
              <div className="space-y-6">
                {/* Voice Player */}
                {explanation && (
                  <div>
                     <div className="nb-mono mb-3" style={{ fontSize: '9px', color: 'var(--ink)', fontWeight: 'bold', opacity: 0.6, letterSpacing: '0.1em' }}>AUDIO GUIDE</div>
                    <VoicePlayer
                      text={voiceText}
                      language={userProfile.language || 'english'}
                    />
                  </div>
                )}

                {/* Mentor Button */}
                <NbButton
                  variant="nova"
                  className="w-full py-4 text-sm"
                  onClick={() => setMentorOpen(true)}
                  style={{ borderRadius: '0' }}
                >
                  💬 AI MENTOR HELP
                </NbButton>

                {/* Subtopic List */}
                <div className="mt-8">
                   <div className="nb-mono mb-4" style={{ fontSize: '9px', color: 'var(--ink)', fontWeight: 'bold', opacity: 0.6, letterSpacing: '0.1em' }}>
                    CURRICULUM
                  </div>
                  <div className="space-y-3">
                    {subtopics.map((s, i) => (
                      <div
                        key={s.subtopicId}
                        className="nb-mono py-4 px-4 transition-all cursor-pointer border-4 group"
                        style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          borderColor: i === currentSubtopicIndex ? 'var(--theme-accent)' : 'black',
                          color: i === currentSubtopicIndex ? 'var(--theme-bg)' : s.isCompleted ? 'var(--theme-accent)' : 'var(--theme-text)',
                          background: i === currentSubtopicIndex ? 'var(--theme-accent)' : 'rgba(0,0,0,0.4)',
                          transform: i === currentSubtopicIndex ? 'rotate(-1deg)' : 'none',
                        }}
                        onClick={() => {
                          setCurrentSubtopicIndex(i);
                          setExplanation(null);
                          setImageUrl('');
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{String(i + 1).padStart(2, '0')}. {s.title.toUpperCase()}</span>
                          {s.isCompleted && <span className="text-ion">✓</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </NbCard>
          </div>
        </div>
      </div>

      {/* Bottom Navigation: Floating Pill */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-[650px] px-6">
        <div className="bg-black border-[5px] border-black p-4 flex items-center justify-between shadow-[12px_12px_0_rgba(0,0,0,1)]">
          <NbButton
            variant="dark"
            disabled={currentSubtopicIndex === 0}
            onClick={handlePrevSubtopic}
            style={{ borderRadius: '0', fontSize: '14px', border: '3px solid var(--theme-text)', color: 'var(--theme-text)' }}
          >
            PREV
          </NbButton>

          <div className="flex flex-col items-center">
            <span className="nb-mono text-volt text-[10px] font-bold">CHAPTER PROGRESS</span>
            <span className="nb-mono font-bold text-white" style={{ fontSize: '16px' }}>
              {currentSubtopicIndex + 1} <span className="text-white/30">/</span> {subtopics.length}
            </span>
          </div>

          {currentSubtopicIndex < subtopics.length - 1 ? (
            <NbButton variant="default" onClick={handleNextSubtopic} style={{ borderRadius: '0', padding: '1rem 3rem', fontSize: '18px', background: 'var(--theme-accent)', color: 'var(--theme-bg)' }}>
              NEXT STEP →
            </NbButton>
          ) : (
            <div className="flex gap-3">
              <NbButton 
                variant="dark" 
                onClick={handleNextSubtopic}
                style={{ borderRadius: '0', fontSize: '12px', padding: '0.5rem 1rem' }}
              >
                FINISH ✓
              </NbButton>
              <NbButton 
                variant="volt" 
                onClick={async () => {
                  await handleNextSubtopic();
                  router.push(`/quiz/topic/${topicId}`);
                }}
                style={{ borderRadius: '0', padding: '1rem 2rem', fontSize: '16px' }}
              >
                TOPIC QUIZ 🏆
              </NbButton>
            </div>
          )}
        </div>
      </div>

      {/* Mentor Drawer */}
      <MentorDrawer
        courseId={courseId}
        topicId={topicId}
        subtopicId={currentSubtopic?.subtopicId || ''}
        activeInterest={activeInterest}
        isOpen={mentorOpen}
        onClose={() => setMentorOpen(false)}
      />

      {/* Level Up Modal */}
      {levelUpData && (
        <LevelUpModal
          isOpen={!!levelUpData}
          onClose={() => setLevelUpData(null)}
          level={levelUpData.level}
          tier={levelUpData.tier}
          activeInterest={activeInterest}
        />
      )}
    </div>
  );
}
