import React from 'react';

export function Card({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  footer,
  padding = 'default',
  hoverable = false,
  ...props
}) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    default: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div
      className={`bg-white rounded-xl border border-fintech-border shadow-card ${
        hoverable ? 'hover:shadow-card-hover transition-shadow duration-200' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-fintech-border flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-fintech-text">{title}</h3>}
            {subtitle && <p className="text-xs text-fintech-muted mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className={paddingStyles[padding]}>{children}</div>

      {footer && (
        <div className="px-5 py-3 sm:px-6 border-t border-fintech-border bg-slate-50/60 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
}
