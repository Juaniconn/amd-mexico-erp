import * as React from 'react';
import { cn } from '@/lib/utils';
import { Inbox, AlertCircle, Loader2, WifiOff, RefreshCw } from 'lucide-react';

interface EmptyStateProps { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; }
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-gray-600">{icon || <Inbox className="h-5 w-5" />}</div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      {description && <p className="mt-1 text-xs text-gray-600 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface LoadingStateProps { message?: string; rows?: number; }
export function LoadingState({ message = 'Cargando...', rows = 5 }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12" role="status">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
      </div>
      <p className="mt-3 text-xs text-gray-500">{message}</p>
      <div className="mt-5 w-full max-w-sm space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-3 rounded-md bg-white/[0.04]" style={{ width: `${70 + Math.random() * 30}%`, animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    </div>
  );
}

interface ErrorStateProps { message: string; onRetry?: () => void; }
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-snug">{message}</p>
        {onRetry && <button onClick={onRetry} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-red-300 underline underline-offset-2 hover:no-underline"><RefreshCw className="h-3 w-3" />Reintentar</button>}
      </div>
    </div>
  );
}

export function OfflineState({ onReconnect }: { onReconnect?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
        <WifiOff className="h-5 w-5 text-gray-600" />
      </div>
      <p className="mt-3 text-sm font-medium text-gray-400">Sin conexión</p>
      <p className="mt-1 text-xs text-gray-600">Los datos pueden estar desactualizados</p>
      {onReconnect && <button onClick={onReconnect} className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition">Reintentar conexión</button>}
    </div>
  );
}
