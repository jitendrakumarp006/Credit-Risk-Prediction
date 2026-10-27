import React from 'react';

export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  const variants = {
    default: 'bg-fintech-borderLight text-fintech-text border border-fintech-border',
    lowRisk: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    highRisk: 'bg-rose-50 text-rose-700 border border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    primary: 'bg-violet-50 text-fintech-primary border border-violet-200',
    blue: 'bg-blue-50 text-fintech-accent border border-blue-200',
    demo: 'bg-purple-50 text-purple-700 border border-purple-200',
    outline: 'border border-fintech-border text-fintech-muted bg-white'
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}

export function RiskBadge({ risk, label, size = 'md' }) {
  const isHigh = risk === 1 || label === 'High Risk';
  return (
    <Badge variant={isHigh ? 'highRisk' : 'lowRisk'} size={size}>
      <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-rose-500' : 'bg-emerald-500'}`} />
      {label || (isHigh ? 'High Risk' : 'Low Risk')}
    </Badge>
  );
}
