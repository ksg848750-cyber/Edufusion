'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import InterestLens from '@/components/learning/InterestLens';
import SceneExplainer from '@/components/learning/SceneExplainer';
import SceneSwitcher from '@/components/learning/SceneSwitcher';
import VoicePlayer from '@/components/ai/VoicePlayer';
import MentorDrawer from '@/components/ai/MentorDrawer';
import LevelUpModal from '@/components/gamification/LevelUpModal';
import NbButton from '@/components/ui/NbButton';
import NbCard from '@/components/ui/NbCard';
import Navbar from '@/components/layout/Navbar';
import TickerBar from '@/components/layout/TickerBar';
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
      const res = await fetch('/api/generate-subtopic-explanation', {
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
        }),
      });

      const data = await res.json();
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

  const startLearning = () => {
    if (!selectedInterest) return;
    setActiveInterest(selectedInterest);
    setPhase('lesson');
    generateExplanation(selectedInterest);
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
    generateExplanation(newInterest);
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
          sceneDescription: explanation.suggested_scene_image_prompt || explanation.scene,
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
      setCurrentSubtopicIndex(currentSubtopicIndex + 1);
      setExplanation(null);
      setImageUrl('');
      // Re-generate with same interest
      setTimeout(() => {
        generateExplanation(activeInterest);
      }, 100);
    } else {
      // Topic complete — go back to course
      router.push(`/course/${courseId}`);
    }
  };

  const handlePrevSubtopic = () => {
    if (currentSubtopicIndex > 0) {
      setCurrentSubtopicIndex(currentSubtopicIndex - 1);
      setExplanation(null);
      setImageUrl('');
      setTimeout(() => {
        generateExplanation(activeInterest);
      }, 100);
    }
  };

  // Build readable text for voice
  const voiceText = explanation
    ? `${explanation.hook}. ${explanation.scene}. ${explanation.twist}. ${explanation.deep_dive}`
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
    <div className="relative overflow-hidden" style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      <Navbar />
      <TickerBar />


      {/* Top Bar: Minimal & Clean */}
      <div className="relative z-10 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="nb-mono flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--chalk)', opacity: 0.6 }}>
            {courseTitle} <span className="opacity-40">/</span> {topicTitle}
          </div>
          <h2 className="nb-display mt-1" style={{ fontSize: '36px', color: 'var(--chalk)' }}>{currentSubtopic?.title}</h2>
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
            background: 'var(--volt)',
            color: 'var(--ink)',
            borderRadius: '0',
            cursor: 'pointer',
          }}
        >
          EXPLORING THROUGH: <span className="ml-2">{INTEREST_EMOJIS[activeInterest]} {INTEREST_LABELS[activeInterest]?.toUpperCase()} ▼</span>
        </button>
      </div>

      <div className="relative z-10 px-8 pb-32 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content: Floating White Card */}
          <div className="flex-1">
            <NbCard hover={false} className="p-0 overflow-hidden" style={{ border: 'var(--bd)', background: 'var(--ink)' }}>
              {/* Progress Tracker (Inside) */}
              <div className="px-8 py-4 bg-black/20 border-bottom border-black/10 flex items-center gap-4">
                 <span className="nb-mono" style={{ fontSize: '9px', fontWeight: 'bold' }}>PROGRESS</span>
                 <div className="flex-1 nb-progress-track" style={{ height: '8px' }}>
                    <div className="nb-progress-fill nb-progress-fill-plasma" style={{ width: `${((currentSubtopicIndex + 1) / Math.max(subtopics.length, 1)) * 100}%` }} />
                 </div>
                 <span className="nb-mono" style={{ fontSize: '9px' }}>{currentSubtopicIndex + 1}/{subtopics.length}</span>
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
                    <SceneExplainer
                      explanation={explanation}
                      interest={activeInterest}
                      mode={userProfile.preferredMode || 'casual'}
                      onGenerateImage={handleGenerateImage}
                      imageUrl={imageUrl}
                      loadingImage={loadingImage}
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
            <NbCard className="p-6" style={{ border: 'var(--bd)', background: 'var(--ink)' }}>
              <div className="space-y-6">
                {/* Voice Player */}
                {explanation && (
                  <div>
                    <div className="nb-mono mb-3" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.1em' }}>AUDIO GUIDE</div>
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
                  <div className="nb-mono mb-4" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.1em' }}>
                    CURRICULUM
                  </div>
                  <div className="space-y-2">
                    {subtopics.map((s, i) => (
                      <div
                        key={s.subtopicId}
                        className="nb-mono py-3 px-4 transition-all cursor-pointer border-2"
                        style={{
                          fontSize: '12px',
                          borderColor: i === currentSubtopicIndex ? 'var(--volt)' : 'transparent',
                          color: i === currentSubtopicIndex ? 'var(--ink)' : s.isCompleted ? 'var(--ion)' : '#999',
                          background: i === currentSubtopicIndex ? 'var(--volt)' : s.isCompleted ? 'transparent' : 'transparent',
                        }}
                        onClick={() => {
                          setCurrentSubtopicIndex(i);
                          setExplanation(null);
                          setImageUrl('');
                          setTimeout(() => generateExplanation(activeInterest), 100);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{i + 1}. {s.title}</span>
                          {s.isCompleted && <span className="text-ion text-xs">✓</span>}
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
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-[600px] px-4">
        <div className="bg-black/80 backdrop-blur-md border-[4px] border-black p-4 flex items-center justify-between shadow-2xl">
          <NbButton
            variant="dark"
            disabled={currentSubtopicIndex === 0}
            onClick={handlePrevSubtopic}
            style={{ borderRadius: '0', fontSize: '12px' }}
          >
            ←
          </NbButton>

          <div className="flex flex-col items-center">
            <span className="nb-mono text-[10px] font-bold opacity-40">CHAPTER PROGRESS</span>
            <span className="nb-mono font-bold" style={{ fontSize: '14px' }}>
              {currentSubtopicIndex + 1} <span className="opacity-30">/</span> {subtopics.length}
            </span>
          </div>

          {currentSubtopicIndex < subtopics.length - 1 ? (
            <NbButton variant="volt" onClick={handleNextSubtopic} style={{ borderRadius: '0', padding: '0.75rem 2rem' }}>
              NEXT →
            </NbButton>
          ) : (
            <NbButton variant="ion" onClick={handleNextSubtopic} style={{ borderRadius: '0', padding: '0.75rem 2rem' }}>
              FINISH ✓
            </NbButton>
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
