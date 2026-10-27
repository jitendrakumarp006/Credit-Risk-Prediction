import React from 'react';
import { SearchX } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = SearchX,
  title = 'No records found',
  description = 'Try adjusting your search filters or check your spelling.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-dashed border-fintech-border ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-violet-50 text-fintech-primary flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-fintech-text">{title}</h4>
      <p className="text-sm text-fintech-muted max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
