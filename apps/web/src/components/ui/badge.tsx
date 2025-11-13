import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'danger';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variant === 'default' && 'bg-primary/10 text-primary',
        variant === 'success' && 'bg-green-100 text-green-800',
        variant === 'danger' && 'bg-red-100 text-red-800',
        className
      )}
      {...props}
    />
  );
}

export { Badge };