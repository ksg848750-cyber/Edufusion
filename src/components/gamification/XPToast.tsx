'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface XPToast {
  id: string;
  amount: number;
  message: string;
  type: 'xp' | 'badge';
}

interface XPToastContextType {
  showToast: (amount: number, message: string, type?: 'xp' | 'badge') => void;
}

const XPToastContext = createContext<XPToastContextType | undefined>(undefined);

export function XPToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<XPToast[]>([]);

  const showToast = useCallback((amount: number, message: string, type: 'xp' | 'badge' = 'xp') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, amount, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <XPToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="nb-card px-4 py-3 flex items-center gap-4 nb-fade-in pointer-events-auto"
            style={{
              background: 'var(--ink)',
              borderTop: `4px solid ${toast.type === 'badge' ? 'var(--plasma)' : 'var(--volt)'}`,
              minWidth: '250px',
              borderRadius: '0'
            }}
          >
            <div
              className="nb-display"
              style={{
                fontSize: '24px',
                color: toast.type === 'badge' ? 'var(--plasma)' : 'var(--volt)'
              }}
            >
              +{toast.amount} {toast.type === 'xp' ? 'XP' : ''}
            </div>
            <div className="nb-mono" style={{ fontSize: '12px', color: 'var(--chalk)' }}>
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </XPToastContext.Provider>
  );
}

export function useXPToast() {
  const context = useContext(XPToastContext);
  if (context === undefined) {
    throw new Error('useXPToast must be used within an XPToastProvider');
  }
  return context;
}
