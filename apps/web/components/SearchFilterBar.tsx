'use client';

import { Search } from 'lucide-react';

export function SearchFilterBar({ search, onSearchChange, onSearch, filterStatus, onFilterChange, placeholder = 'Buscar...' }: {
  search: string;
  onSearchChange: (v: string) => void;
  onSearch?: () => void;
  filterStatus?: string;
  onFilterChange?: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
          className="w-full rounded-lg border border-white/[0.08] bg-[#0d1117] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      {filterStatus !== undefined && onFilterChange && (
        <select 
          value={filterStatus} 
          onChange={(e) => onFilterChange(e.target.value)} 
          className="rounded-lg border border-white/[0.08] bg-[#0d1117] px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/50 sm:w-36"
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      )}
      {onSearch && (
        <button 
          onClick={onSearch} 
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:from-blue-600 hover:to-cyan-600"
        >
          <Search className="h-4 w-4" /> Buscar
        </button>
      )}
    </div>
  );
}
