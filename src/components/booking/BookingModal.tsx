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
import { Calendar, Clock, MapPin, Users, User, FileText, XCircle, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { formatTime } from '@/lib/utils';
import type { Booking, Room } from '@/types';
import { cn } from '@/lib/utils';

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

          {/* Override info */}
          {booking.overriddenBy && (
            <div className="flex items-start gap-3 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-sm">
              <ShieldAlert className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-800 text-xs">Booking overridden</p>
                <p className="text-orange-700 text-xs mt-0.5">This booking was cancelled by a senior officer (ID: {booking.overriddenBy}).</p>
              </div>
            </div>
          )}

          {/* Cancel reason */}
          {booking.status === 'cancelled' && booking.cancelReason && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm">
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 text-xs">Cancellation reason</p>
                <p className="text-red-700 text-xs mt-0.5">{booking.cancelReason}</p>
              </div>
            </div>
          )}

          {/* MOM section */}
          {booking.status === 'completed' && (
            <>
              <Separator />
              <div className={cn(
                'rounded-lg border px-3 py-2.5 space-y-1',
                booking.mom ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
              )}>
                <div className="flex items-center gap-2">
                  <FileText className={cn('w-4 h-4', booking.mom ? 'text-emerald-600' : 'text-amber-600')} />
                  <p className={cn('text-xs font-semibold', booking.mom ? 'text-emerald-800' : 'text-amber-800')}>
                    {booking.mom ? 'Minutes of Meeting' : 'Minutes of Meeting not submitted'}
                  </p>
                </div>
                {booking.mom && (
                  <p className="text-xs text-emerald-700 leading-relaxed whitespace-pre-wrap pl-6">{booking.mom}</p>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
