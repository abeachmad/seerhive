import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
        variant === 'default' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        variant === 'success' && 'bg-green-500/20 text-green-400 border border-green-500/30',
        variant === 'danger' && 'bg-red-500/20 text-red-400 border border-red-500/30',
        variant === 'warning' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        className
      )}
      {...props}
    />
  );
}

export { Badge };