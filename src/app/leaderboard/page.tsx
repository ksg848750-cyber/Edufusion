'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import NbCard from '@/components/ui/NbCard';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  tier: string;
  weeklyXP: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const token = await user!.getIdToken();
      const res = await fetch('/api/leaderboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setUserRank(data.userRank || -1);
      }
    } catch (e) {
      console.error('Leaderboard error:', e);
    } finally {
      setLoading(false);
    }
  };

  const tierColors: Record<string, string> = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#A855F7',
    Diamond: '#00FFD1',
  };

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      <Navbar />

      <div className="nb-page-hero" style={{ background: 'var(--ink)' }}>
        <h1 style={{ color: 'var(--volt)' }}>LEADERBOARD</h1>
        <div className="nb-subtitle">
          {userRank > 0 ? `YOUR RANK: #${userRank}` : 'START LEARNING TO RANK UP'}
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <p className="nb-mono" style={{ fontSize: '12px', color: '#888' }}>Loading leaderboard...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="nb-mono" style={{ fontSize: '14px', color: '#666' }}>
              No entries yet. Be the first to earn XP!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const isUser = entry.userId === user?.uid;
              return (
                <motion.div key={entry.userId || i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <NbCard
                    variant={isUser ? 'volt' : 'default'}
                    className={`flex items-center gap-4 ${isUser ? 'ring-2 ring-[var(--volt)]' : ''}`}
                  >
                    {/* Rank */}
                    <div className="nb-display" style={{ fontSize: '28px', color: i < 3 ? 'var(--volt)' : '#666', minWidth: '40px' }}>
                      {entry.rank || i + 1}
                    </div>

                    {/* Name & Tier */}
                    <div className="flex-1">
                      <div className="nb-display" style={{ fontSize: '16px', color: 'var(--chalk)' }}>
                        {entry.name || 'Anonymous'}
                      </div>
                      <span
                        className="nb-mono px-2 py-0.5"
                        style={{
                          fontSize: '9px',
                          background: tierColors[entry.tier] || '#666',
                          color: '#fff',
                        }}
                      >
                        {entry.tier || 'Bronze'}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="nb-display" style={{ fontSize: '20px', color: 'var(--volt)' }}>
                        {entry.weeklyXP || 0}
                      </div>
                      <div className="nb-mono" style={{ fontSize: '9px', color: '#888' }}>
                        WEEKLY XP
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="nb-mono" style={{ fontSize: '14px', color: 'var(--chalk)' }}>
                        LV {entry.level || 1}
                      </div>
                      <div className="nb-mono" style={{ fontSize: '9px', color: '#888' }}>
                        {entry.xp || 0} XP
                      </div>
                    </div>
                  </NbCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
