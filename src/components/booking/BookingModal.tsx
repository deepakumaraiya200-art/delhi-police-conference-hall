import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Users, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { formatTime } from '@/lib/utils';
import type { Booking, Room } from '@/types';

interface BookingModalProps {
  booking: Booking | null;
  room?: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingModal({ booking, room, open, onOpenChange }: BookingModalProps) {
  if (!booking) return null;

  const statusConfig = {
    confirmed: { label: 'Confirmed', variant: 'success' as const },
    pending: { label: 'Pending', variant: 'warning' as const },
    cancelled: { label: 'Cancelled', variant: 'destructive' as const },
    completed: { label: 'Completed', variant: 'secondary' as const },
  };

  const { label, variant } = statusConfig[booking.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{booking.title}</DialogTitle>
            <Badge variant={variant}>{label}</Badge>
          </div>
          <DialogDescription>
            {booking.description || 'No description provided.'}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
          </div>
          {room && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{room.name} ({room.tower}, Floor {room.floor})</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{booking.organizer}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{booking.participantsCount} participants</span>
          </div>
          {booking.description && (
            <div className="flex items-start gap-3 text-sm">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>{booking.description}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
