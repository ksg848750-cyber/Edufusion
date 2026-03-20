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
      className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 transition-all border-b-4 border-black"
      style={{
        background: 'var(--theme-bg)',
      }}
    >
      {/* Logo */}
      <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 no-underline">
          <span
            className="nb-display px-4 py-1.5"
            style={{
              background: 'var(--theme-accent)',
              color: 'var(--theme-bg)',
              fontSize: '22px',
              fontWeight: 900,
              letterSpacing: '0.05em',
              border: '4px solid black',
              boxShadow: '4px 4px 0 black'
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
                className="nb-mono no-underline transition-all hover:scale-110"
                  style={{
                    fontSize: '14px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: isActive ? 'var(--theme-accent)' : 'var(--theme-text)',
                    borderBottom: isActive ? '5px solid var(--theme-accent)' : '5px solid transparent',
                    padding: '6px 10px',
                    background: isActive ? 'rgba(var(--theme-accent-rgb), 0.15)' : 'transparent',
                  }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Right side */}
      {user && userProfile && (
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
             <span className="nb-mono text-[9px] font-bold opacity-80" style={{ color: 'var(--theme-accent)' }}>TOTAL XP</span>
             <span className="nb-display" style={{ fontSize: '24px', lineHeight: 1, color: 'var(--theme-accent)' }}>{userProfile.xp || 0}</span>
          </div>

          <Link href="/profile" className="flex items-center gap-3 no-underline group">
            <div
              className="nb-mono px-5 py-2.5 transition-all group-hover:-rotate-2"
              style={{
                fontSize: '16px',
                fontWeight: '900',
                background: 'var(--theme-accent-secondary)',
                color: 'var(--theme-bg)',
                border: '4px solid black',
                boxShadow: '4px 4px 0 black'
              }}
            >
              LV {userProfile.level || 1}
            </div>
          </Link>

          <button
            onClick={signOut}
            className="nb-mono px-4 py-2 border-4 transition-all"
            style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--theme-text)', background: 'none', cursor: 'pointer', borderColor: 'rgba(var(--theme-text-rgb), 0.2)' }}
          >
           EXIT
          </button>
        </div>
      )}
    </nav>
  );
}
