import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Eye, Pencil, XCircle } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { format } from 'date-fns';
import type { Booking, Room } from '@/types';

interface BookingCardProps {
  booking: Booking;
  room?: Room;
  onView?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

export function BookingCard({ booking, room, onView, onEdit, onCancel, showActions = true }: BookingCardProps) {
  const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'default'; color: string }> = {
    confirmed: { label: 'Confirmed', variant: 'success',    color: 'border border-neutral-500/30' },
    ongoing:   { label: 'Ongoing',   variant: 'default',    color: 'border-l-blue-500' },
    reserved:  { label: 'Reserved',  variant: 'warning',    color: 'border-l-amber-500' },
    cancelled: { label: 'Cancelled', variant: 'destructive', color: 'border-l-red-500' },
    completed: { label: 'Completed', variant: 'secondary',  color: 'border-l-gray-400' },
  };

  const { label, variant, color } = statusConfig[booking.status] ?? { label: booking.status, variant: 'default' as const, color: '' };

  return (
    <Card className={cn('animate-fade-in border-l-4 transition-all duration-200 h-full', color)}>
      <CardContent className="py-4 px-4">
        <div className="flex flex-col gap-3 h-full">
          {/* Title + Badge */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-sm leading-snug">{booking.title}</h4>
            <Badge variant={variant} className="shrink-0">{label}</Badge>
          </div>
          {/* Info */}
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 shrink-0" />
                {format(new Date(booking.date), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 shrink-0" />
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </span>
              {room && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {room.name}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="w-3 h-3 shrink-0" />
                Booked by {booking.organizer}
              </span>
          </div>
          {/* Actions */}
          {showActions && booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <div className="flex items-center gap-1 mt-auto pt-2">
              {onView && (
                <button onClick={onView} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-neutral-500/30 hover:bg-neutral-50 transition">
                  <Eye className="w-3.5 h-3.5" /> See Details
                </button>
              )}
              {onEdit && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
              {onCancel && booking.status === 'confirmed' && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onCancel}>
                  <XCircle className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
