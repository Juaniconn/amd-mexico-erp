import * as React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand';
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-card border border-border',
  success: 'bg-success-muted/30 border border-success/30',
  warning: 'bg-warning-muted/30 border border-warning/30',
  danger: 'bg-danger-muted/30 border border-danger/30',
  brand: 'bg-brand-muted/20 border border-brand/30',
};

export function StatCard({ title, value, icon, trend, trendLabel, variant = 'default', className }: StatCardProps) {
  return (
    <div className={cn('card-premium p-5', variantStyles[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="section-title">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {trend !== undefined && (
            <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', trend >= 0 ? 'text-success' : 'text-danger')}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend >= 0 ? '+' : ''}{trend}% {trendLabel || 'vs mes anterior'}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-brand/10 p-2 text-brand shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
}

export function StatGrid({ children, cols = 4 }: StatGridProps) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[cols];

  return <div className={cn('gap-4', colClass)}>{children}</div>;
}
