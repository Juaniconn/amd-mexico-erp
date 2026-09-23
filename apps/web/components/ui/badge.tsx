import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'destructive' | 'secondary';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div ref={ref} className={cn(
      'inline-flex h-5 items-center rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium leading-none',
      variant === 'default' && 'bg-[#635bff]/15 text-[#9b96ff]',
      variant === 'outline' && 'border border-[rgba(255,255,255,0.08)] text-foreground',
      variant === 'success' && 'bg-emerald-500/12 text-emerald-400',
      variant === 'warning' && 'bg-amber-500/12 text-amber-400',
      variant === 'destructive' && 'bg-red-500/12 text-red-400',
      variant === 'secondary' && 'bg-[rgba(255,255,255,0.05)] text-muted-foreground',
      className
    )} {...props} />
  )
);
Badge.displayName = 'Badge';
export { Badge };
