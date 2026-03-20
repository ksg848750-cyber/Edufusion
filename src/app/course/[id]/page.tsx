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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      <Navbar />

      {/* Course Header: Cinematic & Stat-Rich */}
      <div className="nb-page-hero" style={{ borderBottom: 'var(--bd)', paddingBottom: '4rem' }}>
        <div className="max-w-7xl mx-auto px-6">
          <NbButton variant="dark" size="sm" onClick={() => router.push('/dashboard')} className="mb-6">
            ← TERMINAL
          </NbButton>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <span className="nb-mono text-volt mb-2 block font-bold tracking-widest text-[10px]">CORE CURRICULUM OVERVIEW</span>
              <h1 className="nb-display nb-glitch" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'var(--chalk)', lineHeight: 0.9 }}>
                {courseTitle.toUpperCase()}
              </h1>
              <div className="flex items-center gap-4 mt-8">
                <div className="flex-1 max-w-sm">
                  <div className="nb-progress-track" style={{ height: '8px' }}>
                    <div className="nb-progress-fill nb-progress-fill-volt" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="nb-mono mt-2 block" style={{ fontSize: '11px', color: '#666' }}>
                    MASTERY: <span className="text-volt">{progressPct}%</span>
                  </span>
                </div>
                <div className="nb-stat-cell nb-stat-volt p-4 border-l-4 border-black">
                  <div className="nb-stat-number" style={{ fontSize: '32px' }}>{units.length}</div>
                  <div className="nb-stat-label">UNITS</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex justify-end">
              <div className="nb-cube-scene">
                <div className="nb-cube">
                  <div className="nb-cube-face nb-cube-front">E</div>
                  <div className="nb-cube-face nb-cube-back">D</div>
                  <div className="nb-cube-face nb-cube-top">U</div>
                  <div className="nb-cube-face nb-cube-bottom">F</div>
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
              <NbCard
                variant={unit.isCompleted ? 'ion' : 'default'}
                className="cursor-pointer group"
                onClick={() => toggleUnit(unit.id)}
              >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="nb-stat-number text-white/10 group-hover:text-volt/30 transition-colors" style={{ fontSize: '48px' }}>
                        {String(unit.order).padStart(2, '0')}
                      </div>
                      <div>
                        <span className="nb-mono" style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em' }}>
                          MILESTONE {unit.order}
                        </span>
                        <h2 className="nb-display" style={{ fontSize: '28px', color: 'var(--chalk)', lineHeight: 1.1 }}>
                          {unit.isCompleted ? '✓ ' : ''}{unit.title}
                        </h2>
                      </div>
                    </div>
                    <span className="nb-display" style={{ fontSize: '24px', color: isExpanded ? 'var(--volt)' : '#444' }}>
                      {isExpanded ? '⬘' : '⬙'}
                    </span>
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
                            className="nb-card p-6 group/topic"
                            style={{ 
                              background: 'rgba(255,255,255,0.02)', 
                              borderLeft: `6px solid ${topic.isCompleted ? 'var(--ion)' : 'var(--plasma)'}`,
                              transition: 'all 0.3s'
                            }}
                          >
                            <div className="flex flex-col h-full">
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="nb-display mb-1" style={{ fontSize: '18px', color: 'var(--chalk)' }}>
                                  {topic.isCompleted ? '✓ ' : ''}{topic.title}
                                </h3>
                                <NbButton
                                  variant={topic.isCompleted ? 'ion' : 'plasma'}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/learn/${courseId}/${topic.topicId}`);
                                  }}
                                  className="opacity-0 group-hover/topic:opacity-100 transition-opacity"
                                >
                                  {topic.isCompleted ? 'REVIEW' : 'START'}
                                </NbButton>
                              </div>

                              <div className="space-y-2 mt-auto">
                                {topicSubs.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="nb-mono flex items-center justify-between text-[11px] hover:bg-white/5 p-1 px-2 cursor-pointer transition-colors"
                                    style={{
                                      color: sub.isCompleted ? 'var(--ion)' : '#555',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Potentially jump to subtopic in the future
                                      router.push(`/learn/${courseId}/${topic.topicId}`);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{sub.isCompleted ? '●' : '○'}</span>
                                      <span>{sub.title.toUpperCase()}</span>
                                    </div>
                                    <span className="text-[9px] opacity-0 group-hover:opacity-100">→</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
              </NbCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
