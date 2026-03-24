'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import NbCard from '@/components/ui/NbCard';
import NbButton from '@/components/ui/NbButton';

interface UnitData {
  id: string;
  title: string;
  order: number;
  isCompleted: boolean;
}

interface TopicData {
  id: string;
  topicId: string;
  unitId: string;
  title: string;
  order: number;
  isCompleted: boolean;
}

interface SubtopicData {
  id: string;
  subtopicId: string;
  topicId: string;
  title: string;
  order: number;
  isCompleted: boolean;
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.id as string;

  const [courseTitle, setCourseTitle] = useState('');
  const [units, setUnits] = useState<UnitData[]>([]);
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [subtopics, setSubtopics] = useState<SubtopicData[]>([]);
  const [progress, setProgress] = useState<Record<string, unknown> | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchCourse();
  }, [user, courseId]);

  const fetchCourse = async () => {
    try {
      const token = await user!.getIdToken();
      const res = await fetch(`/api/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCourseTitle(data.course?.title || '');
        setUnits((data.units || []).map((u: Record<string, unknown>) => ({
          id: u.id as string,
          title: u.title as string,
          order: u.order as number,
          isCompleted: u.isCompleted as boolean,
        })));
        setTopics((data.topics || []).map((t: Record<string, unknown>) => ({
          ...t,
          id: t.id as string,
          topicId: (t.topicId || t.id) as string,
          unitId: t.unitId as string,
          title: t.title as string,
          order: t.order as number,
          isCompleted: t.isCompleted as boolean,
        })));
        setSubtopics((data.subtopics || []).map((s: Record<string, unknown>) => ({
          ...s,
          id: s.id as string,
          subtopicId: (s.subtopicId || s.id) as string,
          topicId: s.topicId as string,
          title: s.title as string,
          order: s.order as number,
          isCompleted: s.isCompleted as boolean,
        })));
        setProgress(data.progress);
        // Expand first unit by default
        if (data.units && data.units.length > 0) {
          setExpandedUnits(new Set([(data.units[0] as Record<string, unknown>).id as string]));
        }
      }
    } catch (e) {
      console.error('Fetch course error:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  const getUnitTopics = (unitId: string) => topics.filter((t) => t.unitId === unitId).sort((a, b) => a.order - b.order);
  const getTopicSubtopics = (topicId: string) => subtopics.filter((s) => s.topicId === topicId).sort((a, b) => a.order - b.order);

  const progressPct = (progress as Record<string, unknown>)?.progressPercentage as number || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--ink)' }}>
        <div className="nb-cube-scene">
          <div className="nb-cube">
            <div className="nb-cube-face nb-cube-front">E</div>
            <div className="nb-cube-face nb-cube-back">D</div>
            <div className="nb-cube-face nb-cube-top">U</div>
            <div className="nb-cube-face nb-cube-bottom">F</div>
            <div className="nb-cube-face nb-cube-left">U</div>
            <div className="nb-cube-face nb-cube-right">!</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--app-bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* Course Header: Cinematic & Stat-Rich */}
      <div className="relative overflow-hidden" style={{ borderBottom: '4px solid var(--plasma)', paddingBottom: '4rem', paddingTop: '4rem', background: 'var(--app-bg)' }}>
        <div className="absolute inset-0 bg-[#FF007A]/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <button 
            onClick={() => router.push('/dashboard')} 
            className="mb-8 nb-mono font-bold text-[11px] text-white/50 hover:text-white transition-colors uppercase tracking-widest"
          >
            ← RETURN TO TERMINAL
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <span className="nb-mono text-plasma mb-4 block font-bold tracking-widest text-[12px] uppercase">
                 CORE CURRICULUM OVERVIEW
              </span>
              <h1 className="nb-display leading-[0.85] tracking-tighter" style={{ fontSize: 'clamp(4rem, 8vw, 100px)', color: 'var(--chalk)', textShadow: '4px 4px 0 var(--plasma)' }}>
                {courseTitle.toUpperCase()}
              </h1>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mt-12 bg-black/40 p-6 border-[2px] border-white/10 relative">
                {/* Glow behind stats */}
                <div className="absolute inset-0 bg-plasma/5 blur-xl -z-10" />

                <div className="flex-1 w-full max-w-sm">
                  <div className="nb-progress-track border-[2px] border-white/20 p-1" style={{ height: 'auto', background: 'transparent' }}>
                    <div className="h-2 bg-plasma shadow-[0_0_10px_var(--plasma)] transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="nb-mono mt-3 block font-bold tracking-widest" style={{ fontSize: '11px', color: '#888' }}>
                    MASTERY <span className="text-plasma ml-2">{progressPct}%</span>
                  </span>
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                  <div className="p-4 border-[2px] border-plasma/50 bg-black/50 text-center flex-1 sm:flex-none">
                    <div className="nb-display text-white" style={{ fontSize: '32px', lineHeight: 1 }}>{units.length}</div>
                    <div className="nb-mono text-plasma font-bold mt-1 tracking-widest" style={{ fontSize: '9px' }}>UNITS</div>
                  </div>
                  <button 
                    onClick={() => router.push(`/quiz/course/${courseId}`)}
                    className="flex-1 sm:flex-none bg-plasma hover:bg-[#ff1a8c] text-white nb-display text-2xl px-6 flex items-center justify-center transition-colors shadow-[4px_4px_0_white]"
                  >
                    EXAM 🎓
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex justify-end relative">
               <div className="absolute inset-0 bg-ion blur-[80px] opacity-20 rounded-full" />
              <div className="nb-cube-scene scale-125 relative z-10">
                <div className="nb-cube">
                  <div className="nb-cube-face nb-cube-front">C</div>
                  <div className="nb-cube-face nb-cube-back">O</div>
                  <div className="nb-cube-face nb-cube-top">R</div>
                  <div className="nb-cube-face nb-cube-bottom">E</div>
                  <div className="nb-cube-face nb-cube-left">A</div>
                  <div className="nb-cube-face nb-cube-right">I</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Units Accordion */}
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {units.map((unit, uIndex) => {
          const isExpanded = expandedUnits.has(unit.id);
          const unitTopics = getUnitTopics(unit.id);

          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: uIndex * 0.1 }}
            >
              <div
                className="cursor-pointer group relative p-6 bg-[var(--ink)] transition-transform hover:-translate-y-1"
                onClick={() => toggleUnit(unit.id)}
                style={{ 
                   border: `4px solid ${unit.isCompleted ? 'var(--ion)' : 'white'}`,
                   boxShadow: `0 0 15px ${unit.isCompleted ? 'rgba(0, 245, 255, 0.3)' : 'transparent'}`,
                }}
              >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="nb-display text-white/20 group-hover:text-plasma/60 transition-colors" style={{ fontSize: '56px', lineHeight: 0.8 }}>
                        {String(unit.order).padStart(2, '0')}
                      </div>
                      <div>
                        <span className="nb-mono" style={{ fontSize: '11px', color: '#888', letterSpacing: '0.15em', fontWeight: 'bold' }}>
                          MILESTONE {unit.order}
                        </span>
                        <h2 className="nb-display mt-1 tracking-wide" style={{ fontSize: '32px', color: 'var(--chalk)', lineHeight: 1 }}>
                          {unit.isCompleted ? '✓ ' : ''}{unit.title}
                        </h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/quiz/unit/${unit.id}`);
                        }}
                        className="bg-plasma hover:bg-[#ff1a8c] text-white nb-mono text-[10px] font-bold px-4 py-2 uppercase tracking-widest transition-colors shadow-[2px_2px_0_white]"
                      >
                        UNIT QUIZ ⚡
                      </button>
                      <span className="nb-display" style={{ fontSize: '32px', color: isExpanded ? 'var(--plasma)' : '#666' }}>
                        {isExpanded ? '⬘' : '⬙'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {unitTopics.map((topic) => {
                        const topicSubs = getTopicSubtopics(topic.topicId);
                        return (
                          <div
                            key={topic.id}
                            className="p-6 group/topic relative overflow-hidden"
                            style={{ 
                              background: 'rgba(255,255,255,0.03)', 
                              border: `2px solid ${topic.isCompleted ? 'var(--ion)' : 'rgba(255,255,255,0.1)'}`,
                              borderLeft: `8px solid ${topic.isCompleted ? 'var(--ion)' : 'var(--plasma)'}`,
                              transition: 'all 0.3s'
                            }}
                          >
                            <div className="flex flex-col h-full relative z-10">
                              <div className="flex justify-between items-start mb-6">
                                <h3 className="nb-display leading-tight tracking-wide" style={{ fontSize: '22px', color: 'var(--chalk)' }}>
                                  {topic.isCompleted ? '✓ ' : ''}{topic.title}
                                </h3>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/learn/${courseId}/${topic.topicId}`);
                                  }}
                                  className="bg-transparent hover:bg-white text-white hover:text-black border-2 border-white nb-mono text-[10px] font-bold px-3 py-1 uppercase tracking-widest opacity-0 group-hover/topic:opacity-100 transition-all"
                                >
                                  {topic.isCompleted ? 'REVIEW' : 'START'}
                                </button>
                              </div>

                              <div className="space-y-3 mt-auto border-t-[1px] border-white/10 pt-4">
                                {topicSubs.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="nb-mono flex items-center justify-between text-[11px] hover:text-white p-1 cursor-pointer transition-colors"
                                    style={{
                                      color: sub.isCompleted ? 'var(--ion)' : '#888',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/learn/${courseId}/${topic.topicId}`);
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className={sub.isCompleted ? 'text-ion' : 'text-[#444]'}>{sub.isCompleted ? '■' : '□'}</span>
                                      <span className="uppercase tracking-widest">{sub.title}</span>
                                    </div>
                                    <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
