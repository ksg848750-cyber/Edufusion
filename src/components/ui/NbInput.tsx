import React from 'react';
import { cn } from '@/lib/utils';

interface NbInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const NbInput = React.forwardRef<HTMLInputElement, NbInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="nb-mono text-xs uppercase tracking-wider text-chalk/80">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn('nb-input w-full', className)}
          {...props}
        />
        {error && (
          <span className="text-plasma text-xs font-mono">{error}</span>
        )}
      </div>
    );
  }
);

NbInput.displayName = 'NbInput';

interface NbTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const NbTextarea = React.forwardRef<HTMLTextAreaElement, NbTextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="nb-mono text-xs uppercase tracking-wider text-chalk/80">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn('nb-input w-full resize-none min-h-[120px]', className)}
          {...props}
        />
        {error && (
          <span className="text-plasma text-xs font-mono">{error}</span>
        )}
      </div>
    );
  }
);

NbTextarea.displayName = 'NbTextarea';
