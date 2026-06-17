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
  const statusConfig = {
    confirmed: { label: 'Confirmed', variant: 'success' as const, color: 'border-l-emerald-500' },
    pending: { label: 'Pending', variant: 'warning' as const, color: 'border-l-amber-500' },
    cancelled: { label: 'Cancelled', variant: 'destructive' as const, color: 'border-l-red-500' },
    completed: { label: 'Completed', variant: 'secondary' as const, color: 'border-l-gray-400' },
  };

  const { label, variant, color } = statusConfig[booking.status];

  return (
    <Card className={cn('animate-fade-in border-l-4 hover:shadow-md transition-all duration-200', color)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm truncate">{booking.title}</h4>
              <Badge variant={variant} className="shrink-0">{label}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(booking.date), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </span>
              {room && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {room.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {booking.participantsCount} participants
              </span>
            </div>
          </div>
          {showActions && booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <div className="flex items-center gap-1">
              {onView && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onView}>
                  <Eye className="w-3.5 h-3.5" />
                </Button>
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
