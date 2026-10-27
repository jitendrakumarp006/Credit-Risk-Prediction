import React from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

export function SortableHeader({
  field,
  label,
  currentSortField,
  currentSortOrder,
  onSort,
  className = ''
}) {
  const isActive = currentSortField === field;

  return (
    <th
      onClick={() => onSort(field)}
      className={`px-4 py-3.5 text-left text-xs font-semibold text-fintech-muted uppercase tracking-wider cursor-pointer hover:text-fintech-text select-none group ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className="text-slate-400 group-hover:text-fintech-text">
          {isActive ? (
            currentSortOrder === 'asc' ? (
              <ChevronUp className="w-3.5 h-3.5 text-fintech-primary" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-fintech-primary" />
            )
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
          )}
        </span>
      </div>
    </th>
  );
}
