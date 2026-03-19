'use client';

import { cn } from '@/lib/utils';
import { type ReactNode, forwardRef } from 'react';

type NbCardVariant = 'default' | 'volt' | 'plasma' | 'ion' | 'solar' | 'nova' | 'ink';

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
          variant === 'volt' && 'nb-card-volt',
          variant === 'plasma' && 'nb-card-plasma',
          variant === 'ion' && 'nb-card-ion',
          variant === 'solar' && 'nb-card-solar',
          variant === 'nova' && 'nb-card-nova',
          variant === 'ink' && 'bg-[var(--ink)] text-[var(--chalk)]',
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
