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
import { Calendar, Clock, MapPin, Users, User, FileText, XCircle, ShieldAlert, Radio } from 'lucide-react';
import { format } from 'date-fns';
import { formatTime } from '@/lib/utils';
import type { Booking, Room } from '@/types';

interface BookingModalProps {
  booking: Booking | null;
  room?: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'default' }> = {
  confirmed: { label: 'Confirmed', variant: 'success' },
  ongoing:   { label: 'Ongoing',   variant: 'default' },
  reserved:  { label: 'Reserved',  variant: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'secondary' },
};

export function BookingModal({ booking, room, open, onOpenChange }: BookingModalProps) {
  if (!booking) return null;

  const { label, variant } = STATUS_CONFIG[booking.status] ?? { label: booking.status, variant: 'default' as const };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle>{booking.title}</DialogTitle>
            <Badge variant={variant}>{label}</Badge>
            {booking.status === 'ongoing' && (
              <span className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                <Radio className="w-3 h-3 animate-pulse" /> Live
              </span>
            )}
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
            <span>{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
          </div>
          {room && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{room.name} ({room.tower}, {room.floor})</span>
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
                <p className="font-semibold text-orange-800 text-xs">Booking overridden by senior officer</p>
                <p className="text-orange-700 text-xs mt-0.5">This booking was cancelled by a higher-ranked officer.</p>
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

          {/* Completed info */}
          {booking.status === 'completed' && (
            <div className="flex items-start gap-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm">
              <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-slate-600 text-xs">Meeting marked as completed by room caretaker.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
