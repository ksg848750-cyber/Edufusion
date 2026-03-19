'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import NbButton from '@/components/ui/NbButton';
import { INTEREST_EMOJIS, INTEREST_LABELS, INTEREST_TEASERS, ALL_INTERESTS } from '@/lib/utils';

const STEPS = ['interests', 'language', 'background', 'mode', 'summary'] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [interests, setInterests] = useState<string[]>([]);
  const [language, setLanguage] = useState('english');
  const [isStudent, setIsStudent] = useState(true);
  const [studyClass, setStudyClass] = useState('');
  const [profession, setProfession] = useState('');
  const [educationLevel, setEducationLevel] = useState('undergraduate');
  const [mode, setMode] = useState('casual');

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else if (interests.length < 5) {
      setInterests([...interests, interest]);
    }
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        interests,
        language,
        educationLevel: isStudent ? educationLevel : 'professional',
        studyClass: isStudent ? studyClass : '',
        profession: isStudent ? 'student' : profession,
        preferredMode: mode,
        isOnboarded: true,
      });
      await refreshProfile();
      router.push('/dashboard');
    } catch (e) {
      console.error('Onboarding save error:', e);
    } finally {
      setSaving(false);
    }
  };

  const languages = [
    { id: 'english', label: 'English' },
    { id: 'hindi', label: 'Hindi' },
    { id: 'telugu', label: 'Telugu' },
    { id: 'tamil', label: 'Tamil' },
    { id: 'kannada', label: 'Kannada' },
  ];

  const classes = ['10th', '12th', 'btech-1', 'btech-2', 'btech-3', 'btech-4', 'mtech', 'mba'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--ink)' }}>
      <div className="nb-scanline-overlay" />

      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="nb-display nb-glitch text-center mb-2" style={{ fontSize: '36px', color: 'var(--volt)' }}>
          INITIALIZING YOUR PROFILE
        </h1>
        <p className="nb-mono text-center mb-8" style={{ fontSize: '11px', color: '#666' }}>
          STEP {step + 1} OF {STEPS.length}
        </p>

        {/* Progress */}
        <div className="nb-progress-track mb-8">
          <div
            className="nb-progress-fill nb-progress-fill-volt"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1 — INTERESTS */}
          {step === 0 && (
            <motion.div key="interests" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h2 className="nb-display mb-6" style={{ fontSize: '28px', color: 'var(--chalk)' }}>
                WHAT DO YOU LOVE?
              </h2>
              <p className="nb-mono mb-4" style={{ fontSize: '12px', color: '#888' }}>
                Pick up to 5 that excite you — {interests.length} / 5 selected
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ALL_INTERESTS.map((interest) => {
                  const selected = interests.includes(interest);
                  return (
                    <div
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className="nb-card cursor-pointer text-center p-4 transition-all"
                      style={{
                        background: selected ? 'var(--volt)' : 'var(--ink)',
                        color: selected ? 'var(--ink)' : 'var(--chalk)',
                        border: 'var(--bd)',
                        boxShadow: selected ? 'var(--sh-lg)' : 'var(--sh)',
                      }}
                    >
                      <div style={{ fontSize: '32px' }}>{INTEREST_EMOJIS[interest]}</div>
                      <div className="nb-display mt-2" style={{ fontSize: '16px' }}>
                        {INTEREST_LABELS[interest]}
                      </div>
                      <div className="nb-mono mt-1" style={{ fontSize: '9px', opacity: 0.7 }}>
                        {INTEREST_TEASERS[interest]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2 — LANGUAGE */}
          {step === 1 && (
            <motion.div key="language" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h2 className="nb-display mb-6" style={{ fontSize: '28px', color: 'var(--chalk)' }}>
                YOUR LANGUAGE
              </h2>
              <div className="flex flex-wrap gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className="nb-btn"
                    style={{
                      background: language === lang.id ? 'var(--volt)' : 'var(--ink)',
                      color: language === lang.id ? 'var(--ink)' : 'var(--chalk)',
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3 — BACKGROUND */}
          {step === 2 && (
            <motion.div key="background" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h2 className="nb-display mb-6" style={{ fontSize: '28px', color: 'var(--chalk)' }}>
                YOUR BACKGROUND
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div
                  onClick={() => setIsStudent(true)}
                  className="nb-card cursor-pointer text-center p-6"
                  style={{
                    background: isStudent ? 'var(--volt)' : 'var(--ink)',
                    color: isStudent ? 'var(--ink)' : 'var(--chalk)',
                    border: 'var(--bd)',
                  }}
                >
                  <div style={{ fontSize: '36px' }}>🎓</div>
                  <div className="nb-display mt-2" style={{ fontSize: '20px' }}>STUDENT</div>
                </div>
                <div
                  onClick={() => setIsStudent(false)}
                  className="nb-card cursor-pointer text-center p-6"
                  style={{
                    background: !isStudent ? 'var(--volt)' : 'var(--ink)',
                    color: !isStudent ? 'var(--ink)' : 'var(--chalk)',
                    border: 'var(--bd)',
                  }}
                >
                  <div style={{ fontSize: '36px' }}>💼</div>
                  <div className="nb-display mt-2" style={{ fontSize: '20px' }}>PROFESSIONAL</div>
                </div>
              </div>

              {isStudent ? (
                <div>
                  <label className="nb-mono block mb-2" style={{ fontSize: '10px', color: '#888' }}>
                    EDUCATION LEVEL
                  </label>
                  <select
                    className="nb-input mb-4"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                  >
                    <option value="school">School</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                  </select>
                  <label className="nb-mono block mb-2" style={{ fontSize: '10px', color: '#888' }}>
                    CLASS / YEAR
                  </label>
                  <select className="nb-input" value={studyClass} onChange={(e) => setStudyClass(e.target.value)}>
                    <option value="">Select...</option>
                    {classes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="nb-mono block mb-2" style={{ fontSize: '10px', color: '#888' }}>
                    YOUR PROFESSION
                  </label>
                  <input
                    className="nb-input"
                    placeholder="e.g. Software Engineer, Designer..."
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4 — MODE */}
          {step === 3 && (
            <motion.div key="mode" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h2 className="nb-display mb-6" style={{ fontSize: '28px', color: 'var(--chalk)' }}>
                HOW DO YOU WANT TO LEARN?
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setMode('casual')}
                  className="nb-card cursor-pointer p-6"
                  style={{
                    background: mode === 'casual' ? 'var(--volt)' : 'var(--ink)',
                    color: mode === 'casual' ? 'var(--ink)' : 'var(--chalk)',
                    border: 'var(--bd)',
                  }}
                >
                  <div className="nb-display" style={{ fontSize: '24px' }}>CASUAL</div>
                  <p className="nb-mono mt-2" style={{ fontSize: '11px', opacity: 0.8 }}>
                    Stories, scenes, vibes. Perfect for building intuition.
                  </p>
                </div>
                <div
                  onClick={() => setMode('exam')}
                  className="nb-card cursor-pointer p-6"
                  style={{
                    background: mode === 'exam' ? 'var(--volt)' : 'var(--ink)',
                    color: mode === 'exam' ? 'var(--ink)' : 'var(--chalk)',
                    border: 'var(--bd)',
                  }}
                >
                  <div className="nb-display" style={{ fontSize: '24px' }}>EXAM</div>
                  <p className="nb-mono mt-2" style={{ fontSize: '11px', opacity: 0.8 }}>
                    Scenes + formal definitions + key points. Built for results.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5 — SUMMARY */}
          {step === 4 && (
            <motion.div key="summary" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h2 className="nb-display mb-6" style={{ fontSize: '28px', color: 'var(--chalk)' }}>
                YOUR PROFILE
              </h2>
              <div className="nb-card space-y-3 p-6" style={{ background: 'var(--ink)', border: 'var(--bd)' }}>
                <div className="flex gap-2">
                  <span className="nb-mono" style={{ fontSize: '11px', color: '#888', width: '100px' }}>INTERESTS</span>
                  <span className="nb-mono" style={{ fontSize: '11px', color: 'var(--volt)' }}>
                    {interests.map((i) => `${INTEREST_EMOJIS[i]} ${INTEREST_LABELS[i]}`).join(', ')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="nb-mono" style={{ fontSize: '11px', color: '#888', width: '100px' }}>LANGUAGE</span>
                  <span className="nb-mono" style={{ fontSize: '11px', color: 'var(--chalk)' }}>{language}</span>
                </div>
                <div className="flex gap-2">
                  <span className="nb-mono" style={{ fontSize: '11px', color: '#888', width: '100px' }}>TYPE</span>
                  <span className="nb-mono" style={{ fontSize: '11px', color: 'var(--chalk)' }}>{isStudent ? 'Student' : 'Professional'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="nb-mono" style={{ fontSize: '11px', color: '#888', width: '100px' }}>MODE</span>
                  <span className="nb-mono" style={{ fontSize: '11px', color: 'var(--chalk)' }}>{mode.toUpperCase()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <NbButton variant="dark" disabled={step === 0} onClick={() => setStep(step - 1)}>
            ← BACK
          </NbButton>

          {step < STEPS.length - 1 ? (
            <NbButton
              variant="volt"
              disabled={step === 0 && interests.length === 0}
              onClick={() => setStep(step + 1)}
            >
              NEXT →
            </NbButton>
          ) : (
            <NbButton variant="volt" onClick={save} disabled={saving}>
              {saving ? 'SAVING...' : 'ENTER EDUFUSION →'}
            </NbButton>
          )}
        </div>
      </motion.div>
    </div>
  );
}
