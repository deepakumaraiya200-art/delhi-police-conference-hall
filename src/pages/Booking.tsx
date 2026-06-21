import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  CalendarPlus, Calendar, Clock, MapPin, Users, User, FileText, ArrowLeft,
  Loader2, CheckCircle2, Building2, Send, AlertTriangle, ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRooms } from '@/hooks/useRooms';
import { useCreateBooking } from '@/hooks/useBookings';
import { useUserStore } from '@/store/userStore';
import { useNotificationStore } from '@/store/notificationStore';
import { users } from '@/data/users';
import { checkBufferConflict, findOverrideCandidates } from '@/services/bookingService';
import type { Room } from '@/types';
import { getRankLabel } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const bookingSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').default(''),
    organizer: z.string().min(2, 'Organizer name must be at least 2 characters'),
    participantsCount: z.coerce
      .number({ message: 'Participants count is required' })
      .min(1, 'At least 1 participant required')
      .max(500, 'Maximum 500 participants'),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    roomId: z.string().min(1, 'Room is required'),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

type BookingFormData = z.infer<typeof bookingSchema>;

function formatTimeDisplay(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const s = h >= 12 ? 'PM' : 'AM';
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dh}:${String(m).padStart(2, '0')} ${s}`;
}

export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRoomId = searchParams.get('room') || '';
  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const createBookingMutation = useCreateBooking();
  const currentUser = useUserStore((state) => state.currentUser);
  const { addNotification } = useNotificationStore();

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<BookingFormData | null>(null);
  const [bufferError, setBufferError] = React.useState<string | null>(null);
  const [overrideCandidates, setOverrideCandidates] = React.useState<ReturnType<typeof findOverrideCandidates>>([]);

  const {
    register, handleSubmit, watch, control, formState: { errors }, setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      organizer: currentUser?.name || '',
      participantsCount: undefined as any,
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '',
      endTime: '',
      roomId: preselectedRoomId,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  const selectedRoom = React.useMemo(() => {
    if (!rooms || !watchedValues.roomId) return undefined;
    return rooms.find((r) => r.id === watchedValues.roomId);
  }, [rooms, watchedValues.roomId]);

  React.useEffect(() => {
    if (preselectedRoomId && rooms) setValue('roomId', preselectedRoomId);
  }, [preselectedRoomId, rooms, setValue]);

  // Live buffer/override check whenever key fields change
  React.useEffect(() => {
    const { roomId, date, startTime, endTime } = watchedValues;
    if (!roomId || !date || !startTime || !endTime || endTime <= startTime) {
      setBufferError(null);
      setOverrideCandidates([]);
      return;
    }

    const conflict = checkBufferConflict(roomId, date, startTime, endTime);
    if (conflict) {
      if (conflict.type === 'overlap') {
        setBufferError(`This hall is already booked from ${formatTimeDisplay(conflict.booking.startTime)} to ${formatTimeDisplay(conflict.booking.endTime)}.`);
      } else {
        setBufferError(`A 30-minute buffer is required between meetings. Another meeting ends at ${formatTimeDisplay(conflict.booking.endTime)} or starts at ${formatTimeDisplay(conflict.booking.startTime)}.`);
      }
      setOverrideCandidates([]);
      return;
    }

    setBufferError(null);

    if (currentUser) {
      const candidates = findOverrideCandidates(roomId, date, startTime, endTime, currentUser.id);
      setOverrideCandidates(candidates);
    }
  }, [watchedValues.roomId, watchedValues.date, watchedValues.startTime, watchedValues.endTime, currentUser]);

  const onFormSubmit = (data: BookingFormData) => {
    if (bufferError) return;
    setPendingData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmBooking = async () => {
    if (!pendingData || !currentUser) return;
    setShowConfirmDialog(false);

    try {
      const { booking, cancelledBookings } = await createBookingMutation.mutateAsync({
        roomId: pendingData.roomId,
        userId: currentUser.id,
        title: pendingData.title,
        description: pendingData.description || '',
        organizer: pendingData.organizer,
        participantsCount: pendingData.participantsCount,
        date: pendingData.date,
        startTime: pendingData.startTime,
        endTime: pendingData.endTime,
        status: 'confirmed',
      });

      // Add notifications for overridden bookings
      cancelledBookings.forEach((cb) => {
        const juniorUser = users.find((u) => u.id === cb.userId);
        const notifMsg = `Your booking "${cb.title}" for ${selectedRoom?.name ?? 'a hall'} on ${pendingData.date} has been overridden by ${getRankLabel(currentUser.role)} ${currentUser.name}.`;

        addNotification({
          id: `notif-override-${Date.now()}-${cb.id}`,
          type: 'booking_overridden',
          message: notifMsg,
          timestamp: new Date().toISOString(),
          read: false,
          userId: cb.userId,
        });

        // Admin notification
        addNotification({
          id: `notif-admin-${Date.now()}-${cb.id}`,
          type: 'booking_overridden',
          message: `[Override] ${getRankLabel(currentUser.role)} ${currentUser.name} has overridden "${cb.title}" (booked by ${juniorUser?.name ?? 'officer'}) in ${selectedRoom?.name ?? 'a hall'} on ${pendingData.date}.`,
          timestamp: new Date().toISOString(),
          read: false,
          userId: 'u-admin',
        });
      });

      const overrideCount = cancelledBookings.length;
      if (overrideCount > 0) {
        toast.success(`Booking confirmed. ${overrideCount} conflicting booking${overrideCount > 1 ? 's were' : ' was'} cancelled.`, {
          description: `"${pendingData.title}" booked for ${format(new Date(pendingData.date), 'MMM d, yyyy')}.`,
        });
      } else {
        toast.success('Booking confirmed!', {
          description: `"${pendingData.title}" booked for ${format(new Date(pendingData.date), 'MMM d, yyyy')}.`,
        });
      }

      navigate('/my-bookings');
    } catch {
      toast.error('Failed to create booking. Please try again.');
    }
  };

  const todayString = format(new Date(), 'yyyy-MM-dd');
  const allowableOverrides = overrideCandidates.filter((c) => c.allowed);
  const blockedOverrides = overrideCandidates.filter((c) => !c.allowed);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-2 w-fit" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <form onSubmit={handleSubmit(onFormSubmit as any)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meeting Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title <span className="text-destructive">*</span></Label>
                  <Input id="title" placeholder="e.g., Quarterly Budget Review" {...register('title')} className={cn(errors.title && 'border-destructive')} />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Brief meeting agenda..." rows={3} {...register('description')} />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizer">Chaired by <span className="text-destructive">*</span></Label>
                    <Input id="organizer" placeholder="Your name" {...register('organizer')} className={cn(errors.organizer && 'border-destructive')} />
                    {errors.organizer && <p className="text-xs text-destructive">{errors.organizer.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="participantsCount">Participants <span className="text-destructive">*</span></Label>
                    <Input id="participantsCount" type="number" min={1} max={500} placeholder="Number of attendees" {...register('participantsCount', { valueAsNumber: true })} className={cn(errors.participantsCount && 'border-destructive')} />
                    {errors.participantsCount && <p className="text-xs text-destructive">{errors.participantsCount.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                  <Input id="date" type="date" min={todayString} {...register('date')} className={cn(errors.date && 'border-destructive')} />
                  {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time <span className="text-destructive">*</span></Label>
                    <Input id="startTime" type="time" {...register('startTime')} className={cn(errors.startTime && 'border-destructive')} />
                    {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time <span className="text-destructive">*</span></Label>
                    <Input id="endTime" type="time" {...register('endTime')} className={cn(errors.endTime && 'border-destructive')} />
                    {errors.endTime && <p className="text-xs text-destructive">{errors.endTime.message}</p>}
                  </div>
                </div>

                {/* 30-min buffer info */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  A 30-minute buffer is required between consecutive meetings in the same hall.
                </div>

                {/* Buffer error */}
                {bufferError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{bufferError}</span>
                  </div>
                )}

                {/* Override candidates */}
                {allowableOverrides.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                      <ShieldAlert className="w-4 h-4" />
                      Senior Override — your rank supersedes {allowableOverrides.length} existing booking{allowableOverrides.length > 1 ? 's' : ''}
                    </div>
                    {allowableOverrides.map((c) => {
                      const juniorUser = users.find((u) => u.id === c.juniorUserId);
                      return (
                        <div key={c.booking.id} className="text-xs text-amber-700 pl-6">
                          · "{c.booking.title}" by {juniorUser?.name ?? 'officer'} ({getRankLabel(juniorUser?.role ?? 'user')}) will be auto-cancelled.
                        </div>
                      );
                    })}
                  </div>
                )}

                {blockedOverrides.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                      <AlertTriangle className="w-4 h-4" />
                      Override not allowed — within 30-minute meeting window
                    </div>
                    {blockedOverrides.map((c) => (
                      <div key={c.booking.id} className="text-xs text-red-700 pl-6">
                        · {c.reason}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Room Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Select Hall
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Conference Hall <span className="text-destructive">*</span></Label>
                  <Controller
                    name="roomId"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={cn('w-full', errors.roomId && 'border-destructive')}>
                          <SelectValue placeholder={roomsLoading ? 'Loading halls...' : 'Select a hall'} />
                        </SelectTrigger>
                        <SelectContent>
                          {(rooms || []).map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              <span>{room.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">({room.tower}, {room.capacity.min}–{room.capacity.max} pax)</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.roomId && <p className="text-xs text-destructive">{errors.roomId.message}</p>}
                </div>

                {selectedRoom && (
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{selectedRoom.name}</h4>
                      <Badge variant={selectedRoom.status === 'available' ? 'success' : selectedRoom.status === 'occupied' ? 'destructive' : 'warning'} className="text-[10px]">
                        {selectedRoom.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedRoom.tower} · {selectedRoom.floor}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{selectedRoom.capacity.min}–{selectedRoom.capacity.max} people</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{selectedRoom.managedBy}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedRoom.amenities.slice(0, 5).map((a) => (
                        <Badge key={a} variant="outline" className="text-[10px] font-normal">{a}</Badge>
                      ))}
                      {selectedRoom.amenities.length > 5 && (
                        <Badge variant="outline" className="text-[10px] font-normal">+{selectedRoom.amenities.length - 5} more</Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile submit */}
            <div className="lg:hidden">
              <Button type="submit" size="lg" className="w-full gap-2" disabled={createBookingMutation.isPending || !!bufferError || blockedOverrides.length > 0}>
                {createBookingMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : <><Send className="w-4 h-4" />Confirm Booking</>}
              </Button>
            </div>
          </div>

          {/* Right — Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Meeting Title</p>
                  <p className="text-sm font-medium">{watchedValues.title || <span className="text-muted-foreground italic">Not specified</span>}</p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Room</p>
                  <p className="text-sm font-medium">{selectedRoom ? <>{selectedRoom.name} <span className="text-xs text-muted-foreground">({selectedRoom.tower})</span></> : <span className="text-muted-foreground italic">Not selected</span>}</p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</p>
                  <p className="text-sm font-medium">
                    {watchedValues.date ? format(new Date(watchedValues.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy') : <span className="text-muted-foreground italic">Not selected</span>}
                  </p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Time</p>
                  <p className="text-sm font-medium">
                    {watchedValues.startTime && watchedValues.endTime
                      ? `${formatTimeDisplay(watchedValues.startTime)} – ${formatTimeDisplay(watchedValues.endTime)}`
                      : <span className="text-muted-foreground italic">Not specified</span>}
                  </p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Participants</p>
                  <p className="text-sm font-medium">
                    {watchedValues.participantsCount ? `${watchedValues.participantsCount} attendees` : <span className="text-muted-foreground italic">Not specified</span>}
                  </p>
                </div>

                {selectedRoom && watchedValues.participantsCount > 0 && watchedValues.participantsCount > selectedRoom.capacity.max && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    ⚠️ Participant count exceeds room capacity ({selectedRoom.capacity.max}).
                  </div>
                )}

                {bufferError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    ⚠️ {bufferError}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 hidden lg:flex"
                  disabled={createBookingMutation.isPending || !!bufferError || blockedOverrides.length > 0}
                >
                  {createBookingMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : <><Send className="w-4 h-4" />Confirm Booking</>}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={allowableOverrides.length > 0 ? 'Confirm Booking & Override' : 'Confirm Booking'}
        description={
          pendingData
            ? allowableOverrides.length > 0
              ? `You are booking "${pendingData.title}" at ${selectedRoom?.name ?? 'selected hall'} on ${format(new Date(pendingData.date + 'T00:00:00'), 'MMMM d, yyyy')} from ${formatTimeDisplay(pendingData.startTime)} to ${formatTimeDisplay(pendingData.endTime)}. This will auto-cancel ${allowableOverrides.length} junior officer booking(s). Proceed?`
              : `Confirm booking "${pendingData.title}" at ${selectedRoom?.name ?? 'selected hall'} on ${format(new Date(pendingData.date + 'T00:00:00'), 'MMMM d, yyyy')} from ${formatTimeDisplay(pendingData.startTime)} to ${formatTimeDisplay(pendingData.endTime)}?`
            : 'Are you sure?'
        }
        confirmLabel="Book Now"
        cancelLabel="Go Back"
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}
