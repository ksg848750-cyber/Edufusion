'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, userProfile, signOut } = useAuth();
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'DASHBOARD' },
    { href: '/explain', label: 'EXPLAIN' },
    { href: '/leaderboard', label: 'LEADERBOARD' },
    { href: '/profile', label: 'PROFILE' },
  ];

  return (
    <nav
      className="flex items-center justify-between px-8 py-5 sticky top-0 z-50 transition-all border-b-[4px] border-white/5 backdrop-blur-md"
      style={{
        background: 'rgba(10, 10, 10, 0.85)',
      }}
    >
      {/* Logo */}
      <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 no-underline group">
          <span
            className="nb-display px-2 py-1 transition-transform group-hover:scale-105"
            style={{
              color: 'white',
              fontSize: '32px',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textShadow: '3px 3px 0 var(--plasma)'
            }}
          >
            EDUFUSION
          </span>
      </Link>

      {/* Nav Links */}
      {user && (
        <div className="hidden md:flex items-center gap-10">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className="nb-mono no-underline transition-all hover:text-white"
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: isActive ? 'var(--volt)' : 'rgba(255,255,255,0.6)',
                    borderBottom: isActive ? '3px solid var(--volt)' : '3px solid transparent',
                    padding: '8px 4px',
                    textShadow: isActive ? '0 0 10px rgba(219,255,0,0.3)' : 'none',
                  }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Right side: Authenticated */}
      {user && userProfile && (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-8">
          <div className="hidden sm:flex flex-col items-end">
             <span className="nb-mono text-[10px] font-bold tracking-widest text-volt/70">TOTAL XP</span>
             <span className="nb-display text-[26px] leading-[0.8] text-volt drop-shadow-[0_0_8px_rgba(219,255,0,0.4)]">{userProfile.xp || 0}</span>
          </div>

          <Link href="/profile" className="flex items-center gap-3 no-underline group">
            <div
              className="nb-mono px-4 py-2 transition-transform group-hover:-rotate-3 shadow-[4px_4px_0_var(--plasma)]"
              style={{
                fontSize: '14px',
                fontWeight: '900',
                background: 'var(--ink)',
                color: 'white',
                border: '4px solid var(--plasma)',
              }}
            >
              LV {userProfile.level || 1}
            </div>
          </Link>

          <button
            onClick={signOut}
            className="nb-mono px-4 sm:px-6 py-2 border-[2px] border-white/20 text-white/50 hover:text-white hover:border-white transition-all uppercase tracking-widest text-[11px] font-bold"
          >
           LOGOUT
          </button>
        </div>
      )}

      {/* Right side: Unauthenticated */}
      {!user && (
        <div className="flex items-center gap-6">
          <Link href="/login" className="nb-mono text-[11px] font-bold tracking-widest text-white/50 hover:text-white transition-all uppercase">
            LOGIN
          </Link>
          <Link href="/signup" className="nb-mono px-6 py-2 border-[2px] border-volt text-volt hover:bg-volt hover:text-ink transition-all uppercase tracking-widest text-[11px] font-bold shadow-[2px_2px_0_var(--plasma)]">
            SIGN UP
          </Link>
        </div>
      )}
    </nav>
  );
}
