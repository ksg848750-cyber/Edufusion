'use client';

import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import NbCard from '@/components/ui/NbCard';
import { INTEREST_EMOJIS, INTEREST_LABELS } from '@/lib/utils';
import { getXPForNextLevel } from '@/lib/xp';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--ink)' }}>
        <div className="nb-mono" style={{ color: '#666' }}>Loading...</div>
      </div>
    );
  }

  const xpNext = getXPForNextLevel(userProfile.level || 1);

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      <Navbar />

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="nb-display mb-8" style={{ fontSize: '36px', color: 'var(--volt)' }}>
          {userProfile.name?.toUpperCase() || 'PROFILE'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Card */}
          <NbCard variant="volt">
            <div className="nb-mono mb-3" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              STATS
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="nb-mono" style={{ fontSize: '12px', color: '#888' }}>Level</span>
                <span className="nb-display" style={{ fontSize: '24px', color: 'var(--volt)' }}>{userProfile.level || 1}</span>
              </div>
              <div className="nb-progress-track">
                <div className="nb-progress-fill nb-progress-fill-volt" style={{ width: `${Math.min(((userProfile.xp || 0) / Math.max(xpNext, 1)) * 100, 100)}%` }} />
              </div>
              <div className="flex justify-between">
                <span className="nb-mono" style={{ fontSize: '12px', color: '#888' }}>XP</span>
                <span className="nb-mono" style={{ fontSize: '14px', color: 'var(--chalk)' }}>{userProfile.xp || 0} / {xpNext}</span>
              </div>
              <div className="flex justify-between">
                <span className="nb-mono" style={{ fontSize: '12px', color: '#888' }}>Tier</span>
                <span className={`nb-tier nb-tier-${(userProfile.tier || 'bronze').toLowerCase()}`}>{userProfile.tier || 'Bronze'}</span>
              </div>
              <div className="flex justify-between">
                <span className="nb-mono" style={{ fontSize: '12px', color: '#888' }}>Streak</span>
                <span className="nb-mono" style={{ fontSize: '14px', color: 'var(--plasma)' }}>{userProfile.streakDays || 0} days 🔥</span>
              </div>
            </div>
          </NbCard>

          {/* Interests Card */}
          <NbCard variant="default">
            <div className="nb-mono mb-3" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              YOUR INTERESTS
            </div>
            <div className="flex flex-wrap gap-2">
              {(userProfile.interests || []).map((interest: string) => (
                <span key={interest} className="nb-mono px-3 py-1" style={{ fontSize: '12px', background: 'var(--volt)', color: 'var(--ink)', border: 'var(--bd)' }}>
                  {INTEREST_EMOJIS[interest]} {INTEREST_LABELS[interest]}
                </span>
              ))}
            </div>
          </NbCard>

          {/* Badges Card */}
          <NbCard variant="nova" className="md:col-span-2">
            <div className="nb-mono mb-3" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              BADGES
            </div>
            {(userProfile.badges || []).length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {(userProfile.badges as { id: string; name: string; icon: string }[]).map((badge) => (
                  <div key={badge.id} className="text-center">
                    <div style={{ fontSize: '32px' }}>{badge.icon}</div>
                    <div className="nb-mono" style={{ fontSize: '10px', color: 'var(--chalk)' }}>{badge.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="nb-mono" style={{ fontSize: '12px', color: '#666' }}>
                No badges yet. Keep learning to unlock them!
              </p>
            )}
          </NbCard>
        </div>
      </div>
    </div>
  );
}
