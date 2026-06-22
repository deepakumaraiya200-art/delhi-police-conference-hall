import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RoomStatus } from '@/types';

interface AvailabilityBadgeProps {
  status: RoomStatus;
  className?: string;
  showDot?: boolean;
}

const CONFIG: Record<RoomStatus, { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' }> = {
  available:         { label: 'Available',         variant: 'success' },
  occupied:          { label: 'Occupied',           variant: 'destructive' },
  reserved:          { label: 'Reserved',           variant: 'warning' },
  under_maintenance: { label: 'Under Maintenance',  variant: 'secondary' },
};

export function AvailabilityBadge({ status, className }: AvailabilityBadgeProps) {
  const { label, variant } = CONFIG[status] ?? { label: status, variant: 'secondary' as const };

  return (
    <Badge variant={variant} className={cn('opacity-80', className)}>
      {label}
    </Badge>
  );
}
