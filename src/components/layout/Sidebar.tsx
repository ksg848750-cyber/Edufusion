'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpen, Trophy, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const links = [
    { href: '/dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { href: '/courses', label: 'LIBRARY', icon: BookOpen },
    { href: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
    { href: '/settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-76px)] border-r-4 border-bd bg-ink sticky top-[76px] p-6 space-y-8">
      <div className="nb-mono text-xs text-chalk/50 mb-4 tracking-widest">
        SYSTEM / NAV
      </div>

      <nav className="flex-1 space-y-4">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 p-3 nb-mono text-sm transition-all',
                isActive
                  ? 'bg-volt text-carbon font-bold shadow-[4px_4px_0px_#fff]'
                  : 'hover:bg-chalk/10 hover:-translate-y-1 hover:shadow-[4px_4px_0px_var(--volt)]'
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-carbon" : "text-volt")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t-2 border-bd border-dashed">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 p-3 w-full text-left nb-mono text-sm text-plasma hover:bg-plasma/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          DISCONNECT
        </button>
      </div>
    </aside>
  );
}
