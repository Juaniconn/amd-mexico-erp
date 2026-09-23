'use client';
import { X } from 'lucide-react';

export function FormModal({ title, onClose, onSubmit, children }: { title: string; onClose: () => void; onSubmit: (e: React.FormEvent) => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center">
      <div className="my-auto w-full max-w-lg max-h-[min(90vh,calc(100dvh-2rem))] overflow-y-auto rounded-md border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">{children}</form>
      </div>
    </div>
  );
}
