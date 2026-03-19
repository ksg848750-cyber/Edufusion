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

      {/* Course Header */}
      <div className="p-6" style={{ borderBottom: 'var(--bd)' }}>
        <NbButton variant="dark" size="sm" onClick={() => router.push('/dashboard')}>
          ← BACK
        </NbButton>
        <h1 className="nb-display mt-4" style={{ fontSize: '32px', color: 'var(--chalk)' }}>
          {courseTitle}
        </h1>
        <div className="nb-progress-track mt-3" style={{ maxWidth: '400px' }}>
          <div className="nb-progress-fill nb-progress-fill-volt" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="nb-mono" style={{ fontSize: '11px', color: '#888' }}>
          {progressPct}% COMPLETE
        </span>
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
                className="cursor-pointer"
                onClick={() => toggleUnit(unit.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="nb-mono" style={{ fontSize: '10px', color: '#888' }}>
                      UNIT {unit.order}
                    </span>
                    <h2 className="nb-display" style={{ fontSize: '22px', color: 'var(--chalk)' }}>
                      {unit.isCompleted ? '✓ ' : ''}{unit.title}
                    </h2>
                  </div>
                  <span className="nb-display" style={{ fontSize: '20px', color: '#666' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4 space-y-3"
                  >
                    {unitTopics.map((topic) => {
                      const topicSubs = getTopicSubtopics(topic.topicId);
                      return (
                        <div
                          key={topic.id}
                          className="nb-card"
                          style={{ background: 'var(--ink)', borderLeft: `4px solid ${topic.isCompleted ? 'var(--ion)' : 'var(--plasma)'}` }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="nb-display" style={{ fontSize: '16px', color: 'var(--chalk)' }}>
                                {topic.isCompleted ? '✓ ' : ''}{topic.title}
                              </h3>
                              <span className="nb-mono" style={{ fontSize: '10px', color: '#888' }}>
                                {topicSubs.filter((s) => s.isCompleted).length}/{topicSubs.length} subtopics
                              </span>
                            </div>
                            <NbButton
                              variant={topic.isCompleted ? 'ion' : 'plasma'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/learn/${courseId}/${topic.topicId}`);
                              }}
                            >
                              {topic.isCompleted ? 'REVIEW →' : 'LEARN →'}
                            </NbButton>
                          </div>

                          {/* Subtopic list */}
                          <div className="mt-2 space-y-1">
                            {topicSubs.map((sub) => (
                              <div
                                key={sub.id}
                                className="nb-mono flex items-center gap-2 pl-2"
                                style={{
                                  fontSize: '11px',
                                  color: sub.isCompleted ? 'var(--ion)' : '#666',
                                }}
                              >
                                <span>{sub.isCompleted ? '✓' : '○'}</span>
                                <span>{sub.title}</span>
                              </div>
                            ))}
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
