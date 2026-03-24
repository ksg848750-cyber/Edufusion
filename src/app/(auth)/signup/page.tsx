'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import NbButton from '@/components/ui/NbButton';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createUserProfile = async (uid: string, displayName: string, userEmail: string) => {
    await setDoc(doc(db, 'users', uid), {
      name: displayName,
      email: userEmail,
      interests: [],
      language: 'english',
      educationLevel: '',
      studyClass: '',
      profession: '',
      preferredMode: 'casual',
      xp: 0,
      level: 1,
      tier: 'Bronze',
      avatarStage: 0,
      streakDays: 0,
      badges: [],
      isOnboarded: false,
      createdAt: new Date(),
    });
  };

  const handleSignup = async () => {
    if (!name || !email || !password) return;
    setLoading(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await createUserProfile(cred.user.uid, name, email);
      router.push('/onboarding');
    } catch (e: unknown) {
      setError((e as Error).message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      // Check if user profile exists; if not create one
      const { doc: getDocRef, getDoc } = await import('firebase/firestore');
      const userDoc = await getDoc(getDocRef(db, 'users', cred.user.uid));
      if (!userDoc.exists()) {
        await createUserProfile(cred.user.uid, cred.user.displayName || '', cred.user.email || '');
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (e: unknown) {
      setError((e as Error).message || 'Google signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--app-bg)' }}>
      <div className="nb-scanline-overlay" />
      <div className="nb-card w-full max-w-md p-8" style={{ border: 'var(--bd)', background: 'var(--ink)' }}>
        <h1 className="nb-display nb-glitch text-center mb-2" style={{ fontSize: '32px', color: 'var(--volt)' }}>
          SIGN UP
        </h1>
        <p className="nb-mono text-center mb-8" style={{ fontSize: '11px', color: '#666' }}>
          JOIN THE REVOLUTION
        </p>

        {error && (
          <div className="nb-mono mb-4 p-2" style={{ fontSize: '11px', color: '#ff4444', background: 'rgba(255,0,0,0.1)', border: '2px solid #ff4444' }}>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input className="nb-input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="nb-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="nb-input" type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSignup(); }} />

          <NbButton variant="volt" className="w-full" onClick={handleSignup} disabled={loading}>
            {loading ? 'CREATING...' : 'CREATE ACCOUNT →'}
          </NbButton>

          <div className="nb-mono text-center" style={{ fontSize: '10px', color: '#666' }}>OR</div>

          <NbButton variant="dark" className="w-full" onClick={handleGoogle}>
            SIGN UP WITH GOOGLE
          </NbButton>
        </div>

        <p className="nb-mono text-center mt-6" style={{ fontSize: '11px', color: '#888' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--volt)' }}>LOGIN →</Link>
        </p>
      </div>
    </div>
  );
}
