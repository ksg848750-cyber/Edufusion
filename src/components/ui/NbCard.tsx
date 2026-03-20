'use client';

import { cn } from '@/lib/utils';
import { type ReactNode, forwardRef } from 'react';

type NbCardVariant = 'default' | 'volt' | 'plasma' | 'ion' | 'solar' | 'nova' | 'ink' | 'dark';

interface NbCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: NbCardVariant;
  hover?: boolean;
}

const NbCard = forwardRef<HTMLDivElement, NbCardProps>(
  ({ children, variant = 'default', className, onClick, hover = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'nb-card',
          variant === 'volt' && 'nb-card-volt bg-nb-volt',
          variant === 'plasma' && 'nb-card-plasma bg-nb-plasma',
          variant === 'ion' && 'nb-card-ion bg-nb-ion',
          variant === 'solar' && 'nb-card-solar bg-nb-solar',
          variant === 'nova' && 'nb-card-nova bg-nb-nova',
          variant === 'ink' && 'bg-[var(--ink)] text-[var(--chalk)]',
          variant === 'dark' && 'bg-black text-white border-2 border-white/10',
          !hover && 'hover:transform-none hover:shadow-[var(--sh)]',
          onClick && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NbCard.displayName = 'NbCard';
export default NbCard;
