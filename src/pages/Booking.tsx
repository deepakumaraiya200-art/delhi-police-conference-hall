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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarPlus,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  FileText,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Building2,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRooms } from '@/hooks/useRooms';
import { useCreateBooking } from '@/hooks/useBookings';
import { useUserStore } from '@/store/userStore';
import type { Room } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// ── Zod Schema ───────────────────────────────────────────────────────────────

const bookingSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be less than 100 characters'),
    description: z
      .string()
      .max(500, 'Description must be less than 500 characters')
      .default(''),
    organizer: z.string().min(2, 'Organizer name must be at least 2 characters'),
    participantsCount: z.coerce
      .number({ message: 'Participants count is required' })
      .min(1, 'At least 1 participant is required')
      .max(500, 'Maximum 500 participants'),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    roomId: z.string().min(1, 'Room is required'),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

type BookingFormData = z.infer<typeof bookingSchema>;

// ── Helper to format 24h time to 12h display ────────────────────────────────

function formatTimeDisplay(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRoomId = searchParams.get('room') || '';
  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const createBookingMutation = useCreateBooking();
  const currentUser = useUserStore((state) => state.currentUser);

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<BookingFormData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      organizer: currentUser?.name || '',
      participantsCount: undefined as unknown as number,
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '',
      endTime: '',
      roomId: preselectedRoomId,
    },
    mode: 'onChange',
  });

  // Watch form values for the summary card
  const watchedValues = watch();

  // Get selected room details
  const selectedRoom = React.useMemo(() => {
    if (!rooms || !watchedValues.roomId) return undefined;
    return rooms.find((r) => r.id === watchedValues.roomId);
  }, [rooms, watchedValues.roomId]);

  // Set preselected room once rooms load
  React.useEffect(() => {
    if (preselectedRoomId && rooms) {
      setValue('roomId', preselectedRoomId);
    }
  }, [preselectedRoomId, rooms, setValue]);

  const onFormSubmit = (data: BookingFormData) => {
    setPendingData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmBooking = async () => {
    if (!pendingData || !currentUser) return;
    setShowConfirmDialog(false);

    try {
      await createBookingMutation.mutateAsync({
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

      toast.success('Booking confirmed successfully!', {
        description: `${pendingData.title} has been booked for ${format(new Date(pendingData.date), 'MMM d, yyyy')}.`,
      });

      navigate('/my-bookings');
    } catch {
      toast.error('Failed to create booking', {
        description: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  const todayString = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6">
      {/* Back & Header */}
      <Button variant="ghost" size="sm" className="gap-2 w-fit" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>


      <form onSubmit={handleSubmit(onFormSubmit as any)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meeting Details */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl font-bold items-center  flex items-center gap-2">
                  Meeting Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Meeting Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Quarterly Budget Review"
                    {...register('title')}
                    className={cn(errors.title && 'border-destructive focus-visible:ring-destructive')}
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the meeting agenda..."
                    rows={3}
                    {...register('description')}
                    className={cn(errors.description && 'border-destructive')}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Organizer */}
                  <div className="space-y-2">
                    <Label htmlFor="organizer" className="text-sm font-medium">
                      Chaired by <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="organizer"
                      placeholder="Your name"
                      {...register('organizer')}
                      className={cn(errors.organizer && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {errors.organizer && (
                      <p className="text-xs text-destructive">{errors.organizer.message}</p>
                    )}
                  </div>

                  {/* Participants Count */}
                  <div className="space-y-2">
                    <Label htmlFor="participantsCount" className="text-sm font-medium">
                      Participants <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="participantsCount"
                      type="number"
                      min={1}
                      max={500}
                      placeholder="Number of attendees"
                      {...register('participantsCount', { valueAsNumber: true })}
                      className={cn(errors.participantsCount && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {errors.participantsCount && (
                      <p className="text-xs text-destructive">{errors.participantsCount.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    min={todayString}
                    {...register('date')}
                    className={cn(errors.date && 'border-destructive focus-visible:ring-destructive')}
                  />
                  {errors.date && (
                    <p className="text-xs text-destructive">{errors.date.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Time */}
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-sm font-medium">
                      Start Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      {...register('startTime')}
                      className={cn(errors.startTime && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {errors.startTime && (
                      <p className="text-xs text-destructive">{errors.startTime.message}</p>
                    )}
                  </div>

                  {/* End Time */}
                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-sm font-medium">
                      End Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      {...register('endTime')}
                      className={cn(errors.endTime && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {errors.endTime && (
                      <p className="text-xs text-destructive">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Selection */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Select Room
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Conference Room <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="roomId"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          className={cn(
                            'w-full',
                            errors.roomId && 'border-destructive focus:ring-destructive'
                          )}
                        >
                          <SelectValue placeholder={roomsLoading ? 'Loading rooms...' : 'Select a room'} />
                        </SelectTrigger>
                        <SelectContent>
                          {(rooms || []).map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              <div className="flex items-center gap-2">
                                <span>{room.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({room.tower}, {room.capacity.min}-{room.capacity.max} pax)
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.roomId && (
                    <p className="text-xs text-destructive">{errors.roomId.message}</p>
                  )}
                </div>

                {/* Selected room info card */}
                {selectedRoom && (
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{selectedRoom.name}</h4>
                      <Badge
                        variant={
                          selectedRoom.status === 'available'
                            ? 'success'
                            : selectedRoom.status === 'occupied'
                            ? 'destructive'
                            : 'warning'
                        }
                        className="text-[10px]"
                      >
                        {selectedRoom.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedRoom.tower} • {selectedRoom.floor}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {selectedRoom.capacity.min}-{selectedRoom.capacity.max} people
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {selectedRoom.managedBy}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRoom.amenities.slice(0, 5).map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-[10px] font-normal">
                          {amenity}
                        </Badge>
                      ))}
                      {selectedRoom.amenities.length > 5 && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          +{selectedRoom.amenities.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button (Mobile) */}
            <div className="lg:hidden">
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <Card className="animate-fade-in sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meeting Title */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Meeting Title</p>
                  <p className="text-sm font-medium">
                    {watchedValues.title || (
                      <span className="text-muted-foreground italic">Not specified</span>
                    )}
                  </p>
                </div>

                <Separator />

                {/* Room */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Room
                  </p>
                  <p className="text-sm font-medium">
                    {selectedRoom ? (
                      <>
                        {selectedRoom.name}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({selectedRoom.tower})
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground italic">Not selected</span>
                    )}
                  </p>
                </div>

                <Separator />

                {/* Date */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date
                  </p>
                  <p className="text-sm font-medium">
                    {watchedValues.date ? (
                      format(new Date(watchedValues.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')
                    ) : (
                      <span className="text-muted-foreground italic">Not selected</span>
                    )}
                  </p>
                </div>

                <Separator />

                {/* Time */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time
                  </p>
                  <p className="text-sm font-medium">
                    {watchedValues.startTime && watchedValues.endTime ? (
                      `${formatTimeDisplay(watchedValues.startTime)} – ${formatTimeDisplay(watchedValues.endTime)}`
                    ) : (
                      <span className="text-muted-foreground italic">Not specified</span>
                    )}
                  </p>
                </div>

                <Separator />

                {/* Organizer */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" /> Organizer
                  </p>
                  <p className="text-sm font-medium">
                    {watchedValues.organizer || (
                      <span className="text-muted-foreground italic">Not specified</span>
                    )}
                  </p>
                </div>

                <Separator />

                {/* Participants */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> Participants
                  </p>
                  <p className="text-sm font-medium">
                    {watchedValues.participantsCount ? (
                      `${watchedValues.participantsCount} attendee${watchedValues.participantsCount > 1 ? 's' : ''}`
                    ) : (
                      <span className="text-muted-foreground italic">Not specified</span>
                    )}
                  </p>
                </div>

                {watchedValues.description && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Description
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {watchedValues.description}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                {/* Capacity Warning */}
                {selectedRoom &&
                  watchedValues.participantsCount > 0 &&
                  watchedValues.participantsCount > selectedRoom.capacity.max && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-200">
                      ⚠️ Participant count ({watchedValues.participantsCount}) exceeds room capacity
                      ({selectedRoom.capacity.max}). Consider choosing a larger room.
                    </div>
                  )}

                {/* Submit Button (Desktop) */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 hidden lg:flex"
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Booking"
        description={
          pendingData
            ? `You are about to book "${pendingData.title}" at ${
                selectedRoom?.name || 'selected room'
              } on ${format(new Date(pendingData.date + 'T00:00:00'), 'MMMM d, yyyy')} from ${formatTimeDisplay(
                pendingData.startTime
              )} to ${formatTimeDisplay(pendingData.endTime)}. Would you like to proceed?`
            : 'Are you sure you want to create this booking?'
        }
        confirmLabel="Book Now"
        cancelLabel="Go Back"
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}
