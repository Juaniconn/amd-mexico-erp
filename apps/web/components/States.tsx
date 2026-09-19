import * as React from 'react';
import { cn } from '@/lib/utils';
import { Inbox, AlertCircle, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        <span>{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 underline underline-offset-2 hover:no-underline"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
