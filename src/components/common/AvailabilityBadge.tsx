import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AvailabilityBadgeProps {
  status: ' Available' | 'occupied' | 'reserved';
  className?: string;
  showDot?: boolean;
}

export function AvailabilityBadge({ status, className, showDot = true }: AvailabilityBadgeProps) {
  const config = {
    available: {
      label: 'Available',
      variant: 'success' as const,
      dotColor: '#258533',
    },
    occupied: {
      label: 'Occupied',
      variant: 'destructive' as const,
      dotColor: '#852526',
    },
    reserved: {
      label: 'Reserved',
      variant: 'warning' as const,
      dotColor: 'bg-amber-500',
    },
  };

  const { label, variant, dotColor } = config[status];

  return (
    <Badge variant={variant} className={cn('gap-1.5  opacity-50', className)}>
      {label}
    </Badge>
  );
}
