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
      className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 transition-all"
      style={{
        background: 'var(--ink)',
        borderBottom: 'var(--bd)',
      }}
    >
      {/* Logo */}
      <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 no-underline">
          <span
            className="nb-display px-4 py-1.5"
            style={{
              background: 'var(--volt)',
              color: 'var(--ink)',
              fontSize: '20px',
              letterSpacing: '0.05em',
              border: 'var(--bd)',
              boxShadow: 'var(--sh-sm)'
            }}
          >
            EDUFUSION
          </span>
      </Link>

      {/* Nav Links */}
      {user && (
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className="nb-mono no-underline transition-colors"
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: isActive ? 'var(--volt)' : '#666',
                  borderBottom: isActive ? '3px solid var(--volt)' : '3px solid transparent',
                  paddingBottom: '4px',
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
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <span
            className="nb-mono px-3 py-1"
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              background: 'var(--plasma)',
              color: '#fff',
              border: 'var(--bd)',
              boxShadow: 'var(--sh-sm)'
            }}
          >
            LV {userProfile.level || 1}
          </span>

          {/* XP */}
          <span
            className="nb-mono"
            style={{ fontSize: '11px', color: 'var(--volt)' }}
          >
            {userProfile.xp || 0} XP
          </span>

          {/* Settings/Logout */}
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="nb-mono no-underline"
              style={{ fontSize: '10px', color: '#666' }}
            >
              ⚙️
            </Link>
            <button
              onClick={signOut}
              className="nb-mono"
              style={{
                fontSize: '10px',
                color: '#666',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ↗ OUT
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
