import React from 'react';
import { Card } from '../common/Card';

export function KpiCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trendLabel,
  color = 'violet',
  badgeText
}) {
  const colorStyles = {
    violet: {
      bg: 'bg-violet-50',
      text: 'text-fintech-primary',
      border: 'border-violet-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-fintech-accent',
      border: 'border-blue-100'
    }
  };

  const style = colorStyles[color] || colorStyles.violet;

  return (
    <Card className="hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-fintech-muted uppercase tracking-wider">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-fintech-text tracking-tight">
              {value}
            </span>
            {subvalue && (
              <span className="text-xs font-medium text-fintech-muted">
                {subvalue}
              </span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-xl ${style.bg} ${style.text} border ${style.border}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-fintech-borderLight flex items-center justify-between text-xs">
        {trendLabel && (
          <span className="text-fintech-muted">
            {trendLabel}
          </span>
        )}
        {badgeText && (
          <span className="font-medium px-2 py-0.5 rounded-md bg-slate-100 text-fintech-text text-[11px]">
            {badgeText}
          </span>
        )}
      </div>
    </Card>
  );
}
