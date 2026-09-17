import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' | 'success' | 'warning';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-5 items-center rounded-full px-2 text-xs font-medium transition',
        variant === 'default' && 'bg-primary text-primary-foreground',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground',
        variant === 'destructive' && 'bg-destructive/10 text-destructive',
        variant === 'outline' && 'border-border text-foreground',
        variant === 'ghost' && 'hover:bg-muted',
        variant === 'link' && 'text-primary underline-offset-4 hover:underline',
        variant === 'success' && 'bg-success-muted text-success',
        variant === 'warning' && 'bg-warning-muted text-warning',
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge };
