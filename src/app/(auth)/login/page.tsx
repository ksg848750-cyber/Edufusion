'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import NbButton from '@/components/ui/NbButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (e: unknown) {
      setError((e as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push('/dashboard');
    } catch (e: unknown) {
      setError((e as Error).message || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--ink)' }}>
      <div className="nb-scanline-overlay" />
      <div className="nb-card w-full max-w-md p-8" style={{ border: 'var(--bd)', background: 'var(--ink)' }}>
        <h1 className="nb-display nb-glitch text-center mb-2" style={{ fontSize: '32px', color: 'var(--volt)' }}>
          LOGIN
        </h1>
        <p className="nb-mono text-center mb-8" style={{ fontSize: '11px', color: '#666' }}>
          WELCOME BACK, LEARNER
        </p>

        {error && (
          <div className="nb-mono mb-4 p-2" style={{ fontSize: '11px', color: '#ff4444', background: 'rgba(255,0,0,0.1)', border: '2px solid #ff4444' }}>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input className="nb-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="nb-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }} />

          <NbButton variant="volt" className="w-full" onClick={handleLogin} disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN →'}
          </NbButton>

          <div className="nb-mono text-center" style={{ fontSize: '10px', color: '#666' }}>OR</div>

          <NbButton variant="dark" className="w-full" onClick={handleGoogle}>
            SIGN IN WITH GOOGLE
          </NbButton>
        </div>

        <p className="nb-mono text-center mt-6" style={{ fontSize: '11px', color: '#888' }}>
          No account? <Link href="/signup" style={{ color: 'var(--volt)' }}>SIGN UP →</Link>
        </p>
      </div>
    </div>
  );
}
