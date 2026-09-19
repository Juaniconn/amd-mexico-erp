import * as React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function FormModal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: FormModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className={`card-premium w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-6 animate-fade-up relative`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
