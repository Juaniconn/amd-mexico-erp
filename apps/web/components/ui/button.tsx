'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
          variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
          variant === 'destructive' && 'bg-red-500/10 text-red-400 hover:bg-red-500/15',
          variant === 'outline' && 'border-border bg-transparent text-foreground hover:bg-muted',
          variant === 'secondary' && 'bg-muted text-foreground hover:bg-muted/80',
          variant === 'ghost' && 'hover:bg-muted text-muted-foreground hover:text-foreground',
          variant === 'link' && 'text-[#635bff] underline-offset-4 hover:underline',
          size === 'default' && 'min-h-10 h-10 px-3.5 sm:min-h-8 sm:h-8',
          size === 'sm' && 'min-h-10 h-10 px-3 text-sm sm:min-h-8 sm:h-8 sm:px-2.5 sm:text-xs',
          size === 'lg' && 'min-h-11 h-11 px-5',
          size === 'icon' && 'min-h-10 min-w-10 h-10 w-10 sm:min-h-8 sm:min-w-8 sm:h-8 sm:w-8',
          size === 'icon-sm' && 'min-h-10 min-w-10 h-10 w-10 sm:min-h-8 sm:min-w-8 sm:h-8 sm:w-8',
          size === 'icon-lg' && 'min-h-11 min-w-11 h-11 w-11',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export { Button };
