'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import TickerBar from '@/components/layout/TickerBar';
import NbCard from '@/components/ui/NbCard';
import NbButton from '@/components/ui/NbButton';
import { getXPForNextLevel } from '@/lib/xp';
import Tesseract from 'tesseract.js';

interface CourseData {
  courseId: string;
  title: string;
  totalUnits: number;
  progressPercentage?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [generating, setGenerating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [subject, setSubject] = useState('');
  const [syllabusText, setSyllabusText] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [inputMode, setInputMode] = useState<'subject' | 'syllabus' | 'image'>('subject');
  const [genError, setGenError] = useState('');

  useEffect(() => {
    if (!user) return;
    if (userProfile && !userProfile.isOnboarded) {
      router.push('/onboarding');
      return;
    }
    fetchCourses();
  }, [user, userProfile, router]);

  const fetchCourses = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses((data.history || []).map((h: Record<string, unknown>) => ({
          courseId: h.courseId as string,
          title: (h.courseTitle as string) || 'Untitled',
          totalUnits: (h.totalUnits as number) || 0,
          progressPercentage: h.progressPercentage as number,
        })));
      }
    } catch (e) {
      console.error('Fetch courses error:', e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanProgress(0);
    setGenError('');

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.floor(m.progress * 100));
          }
        },
      });
      
      setSyllabusText(prev => prev ? prev + '\n' + text : text);
      setInputMode('syllabus'); // Switch to editor to review text
    } catch (err) {
      console.error('OCR Error:', err);
      setGenError('Failed to scan image. Please try again or paste manually.');
    } finally {
      setScanning(false);
    }
  };

  const generateCourse = async () => {
    const hasSubject = subject.trim() !== '';
    const hasSyllabus = syllabusText.trim() !== '';

    if (!hasSubject && !hasSyllabus) return;
    if (!user || generating) return;

    setGenerating(true);
    setGenError('');

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: subject.trim() || undefined,
          syllabusText: hasSyllabus ? syllabusText.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGenError(data.error || 'Failed to generate course');
        return;
      }
      if (data.courseId) {
        router.push(`/course/${data.courseId}`);
      }
    } catch (e) {
      console.error('Generate course error:', e);
      setGenError('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const xpForNext = getXPForNextLevel(userProfile?.level || 1);
  const xpProgress = userProfile ? ((userProfile.xp || 0) / Math.max(xpForNext, 1)) * 100 : 0;

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--ink)' }}>
        <div className="nb-mono" style={{ color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      <Navbar />
      <TickerBar />


      {/* Hero */}
      <div className="nb-page-hero" style={{ paddingBottom: '3rem' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <h1 className="nb-display" style={{ color: 'var(--volt)', fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 0.9 }}>
                UNDERSTAND ANYTHING <br />
                THROUGH WHAT YOU LOVE
              </h1>
              <div className="nb-subtitle mt-4">
                 WELCOME BACK, <span style={{ color: 'var(--volt)' }}>{userProfile.name?.toUpperCase() || 'LEARNER'}</span> — YOUR TERMINAL IS READY.
              </div>
            </div>

            {/* Quick Actions at Top */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instant Explain Box */}
              <NbCard variant="solar" className="p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
                <div className="nb-mono mb-2" style={{ fontSize: '10px', color: 'var(--solar)' }}>INSTANT EXPLAIN</div>
                <input 
                  type="text" 
                  className="nb-input w-full mb-2" 
                  placeholder="Ask anything..." 
                  style={{ fontSize: '12px', padding: '0.5rem' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      router.push(`/explain?concept=${encodeURIComponent(e.currentTarget.value)}`);
                    }
                  }}
                />
                <div className="nb-mono text-[9px] color-[#555]">ENTER TO SEARCH</div>
              </NbCard>

              {/* Quick Generate Box */}
              <NbCard variant="volt" className="p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
                <div className="nb-mono mb-2" style={{ fontSize: '10px', color: 'var(--volt)' }}>NEW COURSE</div>
                <input 
                  type="text" 
                  className="nb-input w-full mb-2" 
                  placeholder="Subject name..." 
                  style={{ fontSize: '12px', padding: '0.5rem' }}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateCourse()}
                />
                <div className="flex gap-2">
                  <NbButton variant="volt" size="sm" className="flex-1" onClick={generateCourse} disabled={generating}>
                    {generating ? '...' : 'GENERATE'}
                  </NbButton>
                  <label className="nb-btn nb-btn-dark py-1 cursor-pointer" style={{ fontSize: '10px' }}>
                    📸
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </NbCard>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Row: Vibrant & Rounded */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NbCard variant="volt" className="flex flex-col items-center p-6 text-center">
            <div className="nb-stat-label">LEVEL</div>
            <div className="nb-stat-number">{userProfile.level || 1}</div>
            <div className="nb-progress-track mt-2 w-full">
              <div className="nb-progress-fill nb-progress-fill-volt" style={{ width: `${Math.min(xpProgress, 100)}%` }} />
            </div>
            <div className="nb-mono mt-1" style={{ fontSize: '10px' }}>{userProfile.xp || 0}/{xpForNext} XP</div>
          </NbCard>

          <NbCard variant="plasma" className="flex flex-col items-center p-6 text-center">
            <div className="nb-stat-label">STREAK</div>
            <div className="nb-stat-number">{userProfile.streakDays || 0}</div>
            <div className="nb-mono mt-1" style={{ fontSize: '10px' }}>DAYS 🔥</div>
          </NbCard>

          <NbCard variant="ion" className="flex flex-col items-center p-6 text-center">
            <div className="nb-stat-label">TIER</div>
            <div className="nb-stat-number" style={{ fontSize: '28px' }}>{userProfile.tier || 'Bronze'}</div>
          </NbCard>

          <NbCard variant="solar" className="flex flex-col items-center p-6 text-center">
            <div className="nb-stat-label">COURSES</div>
            <div className="nb-stat-number">{courses.length}</div>
          </NbCard>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* My Courses */}
        <div className="nb-section-label" style={{ color: 'var(--volt)' }}>
          <span>MY COURSES</span>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {courses.map((course) => (
              <div
                key={course.courseId}
                className="nb-card cursor-pointer group"
                style={{ 
                  borderTop: 'var(--bd)',
                  borderTopColor: 'var(--ion)', 
                  background: 'var(--ink)',
                  padding: '2rem'
                }}
                onClick={() => router.push(`/course/${course.courseId}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="nb-display" style={{ fontSize: '28px', color: 'var(--chalk)', lineHeight: 1.1 }}>
                    {course.title}
                  </h3>
                  <span className="text-2xl group-hover:rotate-12 transition-transform">📚</span>
                </div>
                
                <div className="nb-progress-track mt-6" style={{ height: '10px', borderRadius: '5px' }}>
                  <div
                    className="nb-progress-fill nb-progress-fill-ion"
                    style={{ width: `${course.progressPercentage || 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="nb-mono" style={{ fontSize: '11px', color: '#666' }}>
                    {course.progressPercentage || 0}% MASTERED
                  </div>
                  <NbButton variant="ion" size="sm">
                    CONTINUE →
                  </NbButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-8">
            <p className="nb-mono" style={{ fontSize: '12px', color: '#666' }}>
              No courses yet. Generate your first course below!
            </p>
          </div>
        )}

        {/* Generate New Course: Joyful CTA */}
        <div className="nb-section-label" style={{ color: 'var(--plasma)' }}>
          <span>DISCOVER NEW WORLDS</span>
        </div>

        <NbCard variant="volt" className="mb-12 p-12 text-center" style={{ background: 'var(--ink)' }}>
          {!showGenerator ? (
            <div className="text-center">
              <NbButton variant="volt" size="lg" onClick={() => setShowGenerator(true)}>
                + START NEW COURSE
              </NbButton>
            </div>
          ) : (
            <div>
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  className="nb-mono px-4 py-2 transition-all"
                  style={{
                    fontSize: '11px',
                    border: 'var(--bd)',
                    background: inputMode === 'subject' ? 'var(--volt)' : 'transparent',
                    color: inputMode === 'subject' ? 'var(--ink)' : '#888',
                    cursor: 'pointer',
                  }}
                  onClick={() => setInputMode('subject')}
                >
                  TYPE SUBJECT
                </button>
                <button
                  className="nb-mono px-4 py-2 transition-all"
                  style={{
                    fontSize: '11px',
                    border: 'var(--bd)',
                    background: inputMode === 'syllabus' ? 'var(--volt)' : 'transparent',
                    color: inputMode === 'syllabus' ? 'var(--ink)' : '#888',
                    cursor: 'pointer',
                  }}
                  onClick={() => setInputMode('syllabus')}
                >
                  PASTE SYLLABUS
                </button>
                <button
                  className="nb-mono px-4 py-2 transition-all"
                  style={{
                    fontSize: '11px',
                    border: 'var(--bd)',
                    background: inputMode === 'image' ? 'var(--volt)' : 'transparent',
                    color: inputMode === 'image' ? 'var(--ink)' : '#888',
                    cursor: 'pointer',
                  }}
                  onClick={() => setInputMode('image')}
                >
                  UPLOAD IMAGE
                </button>
              </div>

              {inputMode === 'subject' ? (
                <input
                  className="nb-input mb-4"
                  placeholder="What do you want to master? (e.g. Operating Systems, Machine Learning...)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') generateCourse();
                  }}
                />
              ) : inputMode === 'syllabus' ? (
                <textarea
                  className="nb-input mb-4"
                  rows={8}
                  placeholder="Paste your syllabus text here... (copy from PDF or type out unit/topic names)"
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  style={{ resize: 'vertical', minHeight: '120px' }}
                />
              ) : (
                <div className="mb-4 border-[3px] border-black border-dashed p-8 text-center bg-[var(--chalk)]">
                  {scanning ? (
                    <div className="flex flex-col items-center">
                      <div className="nb-cube-scene mb-4" style={{ width: '40px', height: '40px' }}>
                        <div className="nb-cube" style={{ width: '40px', height: '40px' }}>
                          <div className="nb-cube-face nb-cube-front">S</div>
                          <div className="nb-cube-face nb-cube-back">C</div>
                        </div>
                      </div>
                      <p className="nb-mono font-bold">SCANNING SYLLABUS... {scanProgress}%</p>
                      <div className="nb-progress-track mt-4 w-full max-w-[200px]">
                        <div className="nb-progress-fill nb-progress-fill-ion" style={{ width: `${scanProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="syllabus-image"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <label 
                        htmlFor="syllabus-image"
                        className="cursor-pointer nb-mono font-bold text-black bg-[var(--volt)] border-[3px] border-black px-6 py-3 shadow-[var(--sh-sm)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all inline-block"
                      >
                         SELECT SYLLABUS IMAGE (OCR)
                      </label>
                      <p className="mt-4 nb-mono text-[10px] text-[#666]">
                        WE'LL SCAN THE TEXT AUTOMATICALLY
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Subject name when using syllabus or image */}
              {(inputMode === 'syllabus' || inputMode === 'image') && !scanning && (
                <input
                  className="nb-input mb-4"
                  placeholder="Course name (e.g. Operating Systems, Data Structures...)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              )}

              {genError && (
                <div className="nb-mono mb-3" style={{ fontSize: '11px', color: '#f87171' }}>
                  ⚠ {genError}
                </div>
              )}

              <div className="flex gap-3">
                <NbButton
                  variant="volt"
                  onClick={generateCourse}
                  disabled={generating || scanning || (!subject.trim() && !syllabusText.trim())}
                >
                  {generating ? 'GENERATING...' : 'GENERATE COURSE →'}
                </NbButton>
                <NbButton variant="dark" onClick={() => {
                  setShowGenerator(false);
                  setGenError('');
                  setSyllabusText('');
                }}>
                  CANCEL
                </NbButton>
              </div>

              {(generating || scanning) && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="nb-cube-scene" style={{ width: '30px', height: '30px' }}>
                    <div className="nb-cube" style={{ width: '30px', height: '30px' }}>
                      <div className="nb-cube-face nb-cube-front" style={{ fontSize: '10px' }}>E</div>
                      <div className="nb-cube-face nb-cube-back" style={{ fontSize: '10px' }}>D</div>
                    </div>
                  </div>
                  <span className="nb-mono" style={{ fontSize: '11px', color: '#888' }}>
                    {scanning ? 'Engines scanning content...' : 'AI is building your curriculum... this may take 10-20 seconds'}
                  </span>
                </div>
              )}
            </div>
          )}
        </NbCard>
      </div>
    </div>
  );
}
