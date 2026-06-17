import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AvailabilityBadgeProps {
  status: 'available' | 'occupied' | 'reserved';
  className?: string;
  showDot?: boolean;
}

export function AvailabilityBadge({ status, className, showDot = true }: AvailabilityBadgeProps) {
  const config = {
    available: {
      label: 'Available',
      variant: 'success' as const,
      dotColor: 'bg-emerald-500',
    },
    occupied: {
      label: 'Occupied',
      variant: 'destructive' as const,
      dotColor: 'bg-red-500',
    },
    reserved: {
      label: 'Reserved',
      variant: 'warning' as const,
      dotColor: 'bg-amber-500',
    },
  };

  const { label, variant, dotColor } = config[status];

  return (
    <Badge variant={variant} className={cn('gap-1.5', className)}>
      {showDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColor, status === 'available' && 'animate-pulse-dot')} />
      )}
      {label}
    </Badge>
  );
}
