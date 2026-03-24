'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import NbCard from '@/components/ui/NbCard';
import NbButton from '@/components/ui/NbButton';
import InterestLens from '@/components/learning/InterestLens';
import LevelUpModal from '@/components/gamification/LevelUpModal';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile, refreshProfile } = useAuth();

  const type = params.type as 'subtopic' | 'topic' | 'unit' | 'course';
  const referenceId = params.id as string;

  const [phase, setPhase] = useState<'interest' | 'loading' | 'quiz' | 'results'>('interest');
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [levelUpData, setLevelUpData] = useState<{ level: number; tier: string } | null>(null);

  useEffect(() => {
    if (userProfile && userProfile.interests && userProfile.interests.length > 0 && !selectedInterest) {
      setSelectedInterest(userProfile.interests[0]);
    }
  }, [userProfile]);

  const generateQuiz = async (interest: string) => {
    if (!user) return;
    setPhase('loading');

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          referenceId,
          interest,
          mode: userProfile?.preferredMode || 'casual',
        }),
      });

      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        setPhase('quiz');
      } else {
        throw new Error('No questions returned');
      }
    } catch (e) {
      console.error('Quiz generation error:', e);
      setPhase('interest');
    }
  };

  const handleInterestSelect = (interest: string) => {
    setSelectedInterest(interest);
  };

  const startQuiz = () => {
    if (selectedInterest) {
      generateQuiz(selectedInterest);
    }
  };

  const handleAnswer = (option: string) => {
    if (selectedOption !== null) return; // Already answered
    setSelectedOption(option);
    const correct = option === questions[currentQ].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
  };

  const nextQuestion = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setPhase('results');
      await finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!user) return;
    const isPerfect = score === questions.length;
    const isFailed = score < 3;
    let action = isPerfect ? 'PERFECT_QUIZ' : 'QUIZ_COMPLETE';
    
    if (isFailed) {
      if (type === 'subtopic') action = 'FAIL_SUBTOPIC_QUIZ';
      else if (type === 'topic') action = 'FAIL_TOPIC_QUIZ';
      else if (type === 'unit') action = 'FAIL_UNIT_QUIZ';
      else if (type === 'course') action = 'FAIL_COURSE_QUIZ';
    }
    
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/xp/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          metadata: { type, referenceId, score, total: questions.length },
        }),
      });

      const data = await res.json();
      await (window as any).refreshAuthProfile?.() || refreshProfile(); 
      if (data.leveledUp) {
        setLevelUpData({
          level: data.newLevel,
          tier: data.newTier,
        });
      }
    } catch (e) {
      console.error('Failed to award XP:', e);
    }
  };

  if (!user || (!userProfile && phase === 'interest')) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--app-bg)' }}>
        <div className="nb-mono" style={{ color: '#666' }}>Loading...</div>
      </div>
    );
  }

  if (phase === 'interest') {
    return (
      <div>
        <InterestLens
          userInterests={userProfile?.interests || []}
          topicTitle="Quiz Setup"
          onSelect={handleInterestSelect}
          selectedInterest={selectedInterest}
        />
        {selectedInterest && (
          <div className="fixed bottom-8 left-0 right-0 flex justify-center">
            <NbButton variant="volt" size="lg" onClick={startQuiz}>
              START QUIZ →
            </NbButton>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="relative nb-bg-grid overflow-hidden" style={{ background: 'var(--app-bg)', minHeight: '100vh' }}>
        <div className="absolute inset-0 bg-[#00FF9D]/5 pointer-events-none" />
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 relative z-10">
          <div className="absolute inset-0 bg-ion blur-[100px] opacity-20 rounded-full max-w-sm mx-auto" />
          <div className="nb-cube-scene scale-150 mb-16 relative z-10">
            <div className="nb-cube">
              <div className="nb-cube-face nb-cube-front">Q</div>
              <div className="nb-cube-face nb-cube-back">U</div>
              <div className="nb-cube-face nb-cube-top">I</div>
              <div className="nb-cube-face nb-cube-bottom">Z</div>
              <div className="nb-cube-face nb-cube-left">?</div>
              <div className="nb-cube-face nb-cube-right">!</div>
            </div>
          </div>
          <p className="nb-display tracking-widest" style={{ fontSize: '32px', color: 'var(--volt)', textShadow: '2px 2px 0 var(--plasma)' }}>
            CRAFTING YOUR SIMULATION...
          </p>
          <p className="nb-mono font-bold mt-4 tracking-widest bg-black/50 px-4 py-2 border-[2px] border-volt/20" style={{ fontSize: '11px', color: '#888' }}>
            INTEGRATING {selectedInterest?.toUpperCase()} SEQUENCES // STANDBY
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const isPerfect = score === questions.length;
    const isFailed = score < 3;
    const message = isPerfect ? 'PERFECT SCORE!' : (isFailed ? 'QUIZ FAILED' : 'QUIZ COMPLETE');
    const color = isFailed ? '#ff4444' : (isPerfect ? 'var(--volt)' : 'var(--plasma)');

    return (
      <div style={{ background: 'var(--app-bg)', minHeight: '100vh' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="nb-card text-center max-w-lg w-full p-10"
            style={{
              background: 'var(--ink)',
              border: `4px solid ${color}`,
            }}
          >
            <div className="nb-display nb-glitch mb-4" style={{ fontSize: '48px', color }}>
              {message}
            </div>
            
            <div className="nb-display my-6" style={{ fontSize: '64px', color: 'var(--chalk)' }}>
              {score} <span style={{ fontSize: '32px', color: '#666' }}>/ {questions.length}</span>
            </div>

            <p className="nb-mono mb-8" style={{ fontSize: '12px', color: '#888' }}>
              {isFailed ? "You didn't pass this time. XP has been deducted." : "XP has been awarded to your profile."}
            </p>

            <div className="flex gap-4 justify-center">
              <NbButton variant="dark" onClick={() => router.push('/dashboard')}>
                DASHBOARD
              </NbButton>
              <NbButton variant="volt" onClick={() => {
                router.back();
              }}>
                CONTINUE LEARNING →
              </NbButton>
            </div>
          </motion.div>
        </div>
        
        {levelUpData && (
          <LevelUpModal
            isOpen={!!levelUpData}
            onClose={() => setLevelUpData(null)}
            level={levelUpData.level}
            tier={levelUpData.tier}
            activeInterest={selectedInterest || undefined}
          />
        )}
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div style={{ background: 'var(--app-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* Progress */}
      <div className="px-8 py-6 flex items-center gap-6 bg-black/40" style={{ borderBottom: '4px solid var(--plasma)' }}>
        <span className="nb-mono font-bold tracking-widest text-plasma" style={{ fontSize: '12px' }}>
          QUESTION {String(currentQ + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
        </span>
        <div className="flex-1 nb-progress-track border-[2px] border-white/20 p-1" style={{ height: '24px', background: 'transparent' }}>
          <div
            className="h-full bg-plasma shadow-[0_0_10px_var(--plasma)] transition-all"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full"
          >
            <h2 className="nb-display mb-8" style={{ fontSize: '28px', color: 'var(--chalk)' }}>
              {q.question}
            </h2>

            <div className="space-y-4">
              {q.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                let bg = 'rgba(0,0,0,0.6)';
                let border = '4px solid rgba(255,255,255,0.1)';
                let color = 'var(--chalk)';
                let shadow = 'none';

                if (selectedOption !== null) {
                  if (opt === q.correctAnswer) {
                    bg = 'rgba(219, 255, 0, 0.1)';
                    border = '4px solid var(--volt)';
                    color = 'var(--volt)';
                    shadow = '0 0 15px rgba(219, 255, 0, 0.4)';
                  } else if (isSelected) {
                    bg = 'rgba(255, 0, 122, 0.1)';
                    border = '4px solid var(--plasma)';
                    color = 'var(--plasma)';
                    shadow = '0 0 15px rgba(255, 0, 122, 0.4)';
                  } else {
                     if (opt !== q.correctAnswer && !isSelected) {
                       color = '#666';
                     }
                  }
                } else if (isSelected) {
                  bg = 'var(--volt)';
                  color = 'var(--ink)';
                }

                return (
                  <div
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className="cursor-pointer transition-all hover:-translate-y-1 hover:border-white"
                    style={{ background: bg, border, color, padding: '24px', boxShadow: shadow }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="nb-display mt-1 tracking-widest" style={{ fontSize: '24px', opacity: 0.5 }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div className="nb-mono leading-relaxed font-bold" style={{ fontSize: '15px' }}>
                        {opt}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedOption !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6"
                style={{
                  background: 'var(--ink)',
                  border: `4px solid ${isCorrect ? 'var(--volt)' : 'var(--plasma)'}`,
                  boxShadow: `0 0 20px ${isCorrect ? 'rgba(219, 255, 0, 0.3)' : 'rgba(255, 0, 122, 0.3)'}`,
                }}
              >
                <div className="nb-display mb-4 tracking-widest" style={{ fontSize: '32px', color: isCorrect ? 'var(--volt)' : 'var(--plasma)' }}>
                  {isCorrect ? 'CORRECT // SYSTEM OVERRIDE SUCCESS' : 'INCORRECT // CRITICAL FAILURE'}
                </div>
                <p className="nb-mono font-bold text-white/80" style={{ fontSize: '14px', lineHeight: 1.8 }}>
                  {q.explanation}
                </p>
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={nextQuestion}
                    className="bg-white hover:bg-[#ccc] text-black nb-display text-2xl px-8 py-4 transition-colors tracking-widest shadow-[4px_4px_0_var(--volt)]"
                  >
                    {currentQ < questions.length - 1 ? 'NEXT SEQUENCE →' : 'TERMINATE SEQUENCE →'}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
