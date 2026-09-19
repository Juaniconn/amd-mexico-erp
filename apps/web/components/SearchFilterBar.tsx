import * as React from 'react';
import { cn } from '@/lib/utils';
import { Search, Filter } from 'lucide-react';

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  placeholder = 'Buscar...',
  children,
  className,
}: SearchFilterBarProps) {
  return (
    <div className={cn('card-premium p-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-base pl-9"
          />
        </div>
        {children && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
