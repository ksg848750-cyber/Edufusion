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
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--app-bg)' }}>
        <div className="nb-mono" style={{ color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{ background: 'var(--app-bg)', minHeight: '100vh' }}>
      <Navbar />
      <TickerBar />


      {/* Brand Header */}
      <div className="pt-12 px-8 max-w-[1400px] mx-auto flex items-center justify-between">
         <h1 className="nb-display text-white tracking-tight" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', textShadow: '4px 4px 0 var(--plasma)' }}>
           EDUFUSION
         </h1>
      </div>

      {/* 3-Column Dashboard Hero (Matching Mockup exactly) */}
      <div className="p-8 pb-16 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Column 1: STATS */}
        <div className="p-8 relative min-h-[400px] flex flex-col" style={{ background: 'var(--ink)' }}>
           <div className="absolute inset-0 border-[4px] border-[#00FF9D] pointer-events-none z-10" />
           <div className="absolute inset-2 border-[2px] border-white pointer-events-none z-10" />
           <h2 className="nb-display text-white text-4xl mb-8 tracking-wide relative z-20">YOUR STATS</h2>
           
           <div className="border-[2px] border-white/20 p-6 mb-6 relative z-20 bg-black/40">
              <div className="flex justify-between items-end mb-3">
                 <span className="nb-display text-white text-3xl">LEVEL {userProfile.level || 1}</span>
                 <span className="nb-display text-white text-2xl">{Math.round(xpProgress)}%</span>
              </div>
              <div className="h-4 bg-black border-[2px] border-white p-[2px]">
                 <div className="h-full bg-white transition-all shadow-[0_0_10px_white]" style={{ width: `${Math.min(xpProgress, 100)}%` }} />
              </div>
           </div>

           <div className="border-[2px] border-white/20 p-6 flex justify-between items-center relative z-20 bg-black/40">
              <div>
                <div className="nb-display text-white/70 text-xl">STREAK</div>
                <div className="nb-display text-white text-4xl">{userProfile.streakDays || 0} DAYS</div>
              </div>
              <span className="text-5xl" style={{ filter: 'drop-shadow(0 0 10px white)' }}>⚡</span>
           </div>
        </div>

        {/* Column 2: CURRENT QUEST */}
        <div className="p-8 relative min-h-[400px] flex flex-col items-center justify-between" style={{ background: 'var(--ink)' }}>
           <div className="absolute inset-0 border-[4px] border-[#00FF9D] pointer-events-none z-10" />
           <div className="absolute inset-2 border-[2px] border-white pointer-events-none z-10" />
           <h2 className="nb-display text-white text-4xl tracking-wide w-full text-left relative z-20">CURRENT QUEST</h2>
           
           <div className="flex-1 flex items-center justify-center my-8 relative z-20 w-full">
              <div className="absolute inset-0 bg-[#00F5FF] blur-[80px] opacity-40 rounded-full" />
              <div className="text-[120px] relative z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 30px #00F5FF)' }}>💎</div>
           </div>

           <div className="nb-display text-white text-3xl uppercase text-left w-full leading-none relative z-20">
             {courses[0]?.title || "CRYSTAL CODEX: UNLOCKING THE FUTURE OF AI"}
           </div>
        </div>

        {/* Column 3: NEXT LESSON */}
        <div className="p-8 relative min-h-[400px] flex flex-col justify-between" style={{ background: 'var(--ink)' }}>
           <div className="absolute inset-0 border-[4px] border-[#00FF9D] pointer-events-none z-10" />
           <div className="absolute inset-2 border-[2px] border-white pointer-events-none z-10" />
           <h2 className="nb-display text-white text-4xl tracking-wide relative z-20">NEXT LESSON</h2>
           
           <div className="flex-1 flex flex-col justify-center relative z-20">
             <button 
               className="w-full bg-[#DBFF00] text-black nb-display text-5xl py-8 hover:-translate-y-2 hover:translate-x-2 transition-transform shadow-[-8px_8px_0_#00FF9D]"
               onClick={() => router.push(courses[0] ? `/course/${courses[0].courseId}` : '/')}
             >
               START LESSON
             </button>
           </div>

           <div className="nb-mono text-white/80 text-sm mt-8 border-t-[2px] border-white/20 pt-6 relative z-20 uppercase tracking-widest">
              {(courses[0]?.title || "ADVANCED NEURAL NETWORKS")}.<br/>
              Estimated time: 45 mins.
           </div>
        </div>

      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* My Courses */}
        <div className="nb-section-label" style={{ color: 'var(--volt)' }}>
          <span>MY COURSES</span>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 relative z-10">
            {courses.map((course) => (
              <div
                key={course.courseId}
                className="cursor-pointer group relative p-8 transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,245,255,0.4)]"
                style={{ 
                  border: '4px solid var(--ion)',
                  background: 'var(--ink)',
                  boxShadow: '0 0 15px rgba(0, 245, 255, 0.15)'
                }}
                onClick={() => router.push(`/course/${course.courseId}`)}
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="nb-display tracking-widest" style={{ fontSize: '32px', color: 'var(--chalk)', lineHeight: 1.1 }}>
                    {course.title.toUpperCase()}
                  </h3>
                  <span className="text-4xl group-hover:rotate-12 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_white]">💎</span>
                </div>
                
                <div className="nb-progress-track border-[2px] border-white/20 p-1" style={{ height: '16px', borderRadius: '0', background: 'transparent' }}>
                  <div
                    className="h-full bg-ion shadow-[0_0_10px_var(--ion)] transition-all"
                    style={{ width: `${course.progressPercentage || 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-6">
                  <div className="nb-mono font-bold tracking-widest" style={{ fontSize: '11px', color: '#888' }}>
                    <span className="text-ion">{course.progressPercentage || 0}%</span> MASTERED
                  </div>
                  <button className="bg-ion hover:bg-[#00d0d9] text-black nb-mono font-bold px-4 py-2 text-[10px] uppercase tracking-widest shadow-[2px_2px_0_white] transition-colors">
                    CONTINUE →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-16 border-[4px] border-white/10 bg-black/40">
            <p className="nb-mono font-bold tracking-widest" style={{ fontSize: '14px', color: '#666' }}>
              NO ACTIVE QUESTS. GENERATE YOUR FIRST MODULE BELOW.
            </p>
          </div>
        )}

        {/* Generate New Course: Joyful CTA */}
        <div className="nb-section-label" style={{ color: 'var(--plasma)' }}>
          <span>DISCOVER NEW WORLDS</span>
        </div>

        <div className="mb-16 p-12 text-center relative overflow-hidden transition-all" style={{ border: '4px solid var(--volt)', background: 'var(--ink)', boxShadow: '0 0 20px rgba(219,255,0,0.15)' }}>
          <div className="absolute inset-0 bg-volt/5 pointer-events-none" />
          <div className="relative z-10">
          {!showGenerator ? (
            <div className="text-center">
              <button 
                onClick={() => setShowGenerator(true)}
                className="bg-volt text-black nb-display text-4xl px-12 py-6 hover:-translate-y-2 transition-transform shadow-[6px_6px_0_var(--plasma)]"
              >
                + START NEW COURSE
              </button>
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
                      <div className="nb-cube-scene mb-4" style={{ transform: 'scale(0.77)' }}>
                        <div className="nb-cube">
                          <div className="nb-cube-face nb-cube-front">S</div>
                          <div className="nb-cube-face nb-cube-back">C</div>
                          <div className="nb-cube-face nb-cube-top">A</div>
                          <div className="nb-cube-face nb-cube-bottom">N</div>
                          <div className="nb-cube-face nb-cube-left">N</div>
                          <div className="nb-cube-face nb-cube-right">!</div>
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
                  <div className="nb-cube-scene" style={{ transform: 'scale(0.58)' }}>
                    <div className="nb-cube">
                      <div className="nb-cube-face nb-cube-front">E</div>
                      <div className="nb-cube-face nb-cube-back">D</div>
                      <div className="nb-cube-face nb-cube-top">U</div>
                      <div className="nb-cube-face nb-cube-bottom">F</div>
                      <div className="nb-cube-face nb-cube-left">U</div>
                      <div className="nb-cube-face nb-cube-right">!</div>
                    </div>
                  </div>
                  <span className="nb-mono" style={{ fontSize: '11px', color: '#888' }}>
                    {scanning ? 'Engines scanning content...' : 'AI is building your curriculum... this may take 10-20 seconds'}
                  </span>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
