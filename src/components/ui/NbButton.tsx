'use client';

import { cn } from '@/lib/utils';
import { type ReactNode, type ButtonHTMLAttributes, forwardRef } from 'react';

type NbButtonVariant = 'volt' | 'plasma' | 'ion' | 'solar' | 'nova' | 'dark' | 'chalk';

interface NbButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: NbButtonVariant;
  size?: 'sm' | 'md' | 'lg';
}

const NbButton = forwardRef<HTMLButtonElement, NbButtonProps>(
  ({ children, variant = 'volt', size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'nb-btn',
          `nb-btn-${variant}`,
          size === 'sm' && 'text-xs px-3 py-1.5',
          size === 'lg' && 'text-lg px-8 py-3',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NbButton.displayName = 'NbButton';
export default NbButton;
