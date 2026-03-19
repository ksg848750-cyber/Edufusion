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
  const { user, userProfile } = useAuth();

  const type = params.type as 'topic' | 'unit' | 'course';
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
    
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/xp/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: isPerfect ? 'PERFECT_QUIZ' : 'QUIZ_COMPLETE',
          metadata: { type, referenceId, score, total: questions.length },
        }),
      });

      const data = await res.json();
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
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--ink)' }}>
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
      <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="nb-cube-scene mb-8">
            <div className="nb-cube">
              <div className="nb-cube-face nb-cube-front">Q</div>
              <div className="nb-cube-face nb-cube-back">U</div>
              <div className="nb-cube-face nb-cube-top">I</div>
              <div className="nb-cube-face nb-cube-bottom">Z</div>
            </div>
          </div>
          <p className="nb-display" style={{ fontSize: '24px', color: 'var(--volt)' }}>
            CRAFTING YOUR QUIZ...
          </p>
          <p className="nb-mono mt-2" style={{ fontSize: '11px', color: '#888' }}>
            Integrating {selectedInterest} themes...
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const isPerfect = score === questions.length;
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="nb-card text-center max-w-lg w-full p-10"
            style={{
              background: 'var(--ink)',
              border: `4px solid ${isPerfect ? 'var(--volt)' : 'var(--plasma)'}`,
            }}
          >
            <div className="nb-display nb-glitch mb-4" style={{ fontSize: '48px', color: isPerfect ? 'var(--volt)' : 'var(--plasma)' }}>
              {isPerfect ? 'PERFECT SCORE!' : 'QUIZ COMPLETE'}
            </div>
            
            <div className="nb-display my-6" style={{ fontSize: '64px', color: 'var(--chalk)' }}>
              {score} <span style={{ fontSize: '32px', color: '#666' }}>/ {questions.length}</span>
            </div>

            <p className="nb-mono mb-8" style={{ fontSize: '12px', color: '#888' }}>
              XP has been awarded to your profile.
            </p>

            <div className="flex gap-4 justify-center">
              <NbButton variant="dark" onClick={() => router.push('/dashboard')}>
                DASHBOARD
              </NbButton>
              <NbButton variant="volt" onClick={() => {
                const parts = referenceId.split('_'); // not totally robust, better redirect to course
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
    <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* Progress */}
      <div className="px-6 py-4 flex items-center gap-4" style={{ borderBottom: '2px solid #222' }}>
        <span className="nb-mono" style={{ fontSize: '10px', color: '#888' }}>
          QUESTION {currentQ + 1} OF {questions.length}
        </span>
        <div className="flex-1 nb-progress-track">
          <div
            className="nb-progress-fill nb-progress-fill-volt"
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

            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                let bg = 'var(--ink)';
                let border = 'var(--bd)';
                let color = 'var(--chalk)';

                if (selectedOption !== null) {
                  if (opt === q.correctAnswer) {
                    bg = 'rgba(212, 255, 0, 0.1)';
                    border = '2px solid var(--volt)';
                    color = 'var(--volt)';
                  } else if (isSelected) {
                    bg = 'rgba(255, 68, 68, 0.1)';
                    border = '2px solid #ff4444';
                    color = '#ff4444';
                  } else {
                    color = '#666';
                  }
                } else if (isSelected) {
                  bg = 'var(--volt)';
                  color = 'var(--ink)';
                }

                return (
                  <div
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className="nb-card cursor-pointer transition-all"
                    style={{ background: bg, border, color, padding: '16px' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="nb-mono mt-1" style={{ fontSize: '10px', opacity: 0.7 }}>
                        {String.fromCharCode(65 + i)}.
                      </div>
                      <div style={{ fontSize: '16px', lineHeight: 1.5 }}>
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
                className="mt-6 nb-card"
                style={{
                  background: 'var(--ink)',
                  borderTop: `4px solid ${isCorrect ? 'var(--volt)' : '#ff4444'}`,
                }}
              >
                <div className="nb-display mb-2" style={{ fontSize: '18px', color: isCorrect ? 'var(--volt)' : '#ff4444' }}>
                  {isCorrect ? 'CORRECT!' : 'INCORRECT'}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--chalk)', lineHeight: 1.6 }}>
                  {q.explanation}
                </p>
                <div className="mt-4 flex justify-end">
                  <NbButton variant="volt" onClick={nextQuestion}>
                    {currentQ < questions.length - 1 ? 'NEXT QUESTION →' : 'FINISH QUIZ →'}
                  </NbButton>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
