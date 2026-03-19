'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import NbCard from '@/components/ui/NbCard';
import NbButton from '@/components/ui/NbButton';
import { INTEREST_EMOJIS, INTEREST_LABELS, ALL_INTERESTS } from '@/lib/utils';

export default function SettingsPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [interests, setInterests] = useState<string[]>(userProfile?.interests || []);
  const [language, setLanguage] = useState(userProfile?.language || 'english');
  const [mode, setMode] = useState(userProfile?.preferredMode || 'casual');

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
        preferredMode: mode,
      });
      await refreshProfile();
      router.refresh();
    } catch (e) {
      console.error('Settings save error:', e);
    } finally {
      setSaving(false);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--ink)' }}>
        <div className="nb-mono" style={{ color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      <Navbar />

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="nb-display mb-8" style={{ fontSize: '36px', color: 'var(--volt)' }}>
          SETTINGS
        </h1>

        <div className="space-y-8">
          {/* Interests */}
          <NbCard variant="default">
            <div className="nb-mono mb-3" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              YOUR INTERESTS ({interests.length}/5)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ALL_INTERESTS.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <div
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className="nb-card cursor-pointer text-center p-3 transition-all"
                    style={{
                      background: selected ? 'var(--volt)' : 'var(--ink)',
                      color: selected ? 'var(--ink)' : 'var(--chalk)',
                      border: 'var(--bd)',
                    }}
                  >
                    <div style={{ fontSize: '24px' }}>{INTEREST_EMOJIS[interest]}</div>
                    <div className="nb-mono mt-1" style={{ fontSize: '11px' }}>{INTEREST_LABELS[interest]}</div>
                  </div>
                );
              })}
            </div>
          </NbCard>

          {/* Language */}
          <NbCard variant="default">
            <div className="nb-mono mb-3" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              LANGUAGE
            </div>
            <div className="flex gap-2 flex-wrap">
              {['english', 'hindi', 'telugu', 'tamil', 'kannada'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as 'english' | 'hindi' | 'telugu' | 'tamil' | 'kannada')}
                  className="nb-btn"
                  style={{
                    background: language === lang ? 'var(--volt)' : 'var(--ink)',
                    color: language === lang ? 'var(--ink)' : 'var(--chalk)',
                  }}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
          </NbCard>

          {/* Mode */}
          <NbCard variant="default">
            <div className="nb-mono mb-3" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              LEARNING MODE
            </div>
            <div className="flex gap-3">
              <NbButton variant={mode === 'casual' ? 'volt' : 'dark'} onClick={() => setMode('casual')}>
                CASUAL
              </NbButton>
              <NbButton variant={mode === 'exam' ? 'volt' : 'dark'} onClick={() => setMode('exam')}>
                EXAM
              </NbButton>
            </div>
          </NbCard>

          <NbButton variant="volt" size="lg" onClick={save} disabled={saving}>
            {saving ? 'SAVING...' : 'SAVE SETTINGS →'}
          </NbButton>
        </div>
      </div>
    </div>
  );
}
