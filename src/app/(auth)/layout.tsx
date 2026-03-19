import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,255,0,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 nb-bg-grid opacity-30" />
        <div className="nb-scanline-overlay" />
      </div>
      
      <div className="z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
