import React from 'react';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types';

interface CalendarEventCardProps {
  booking: Booking;
  onClick?: () => void;
}

export function CalendarEventCard({ booking, onClick }: CalendarEventCardProps) {
  const statusColors = {
    confirmed: 'bg-primary text-white',
    pending: 'bg-amber-500 text-white',
    cancelled: 'bg-gray-400 text-white line-through',
    completed: 'bg-emerald-600 text-white',
  };

  return (
    <div
      className={cn(
        'px-2 py-1 rounded text-xs font-medium cursor-pointer truncate',
        statusColors[booking.status]
      )}
      onClick={onClick}
    >
      {booking.title}
    </div>
  );
}
