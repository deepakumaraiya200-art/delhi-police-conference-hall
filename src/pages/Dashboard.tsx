import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatisticsCard } from '@/components/common/StatisticsCard';
import { BookingCard } from '@/components/booking/BookingCard';
import { BookingModal } from '@/components/booking/BookingModal';
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Plus,
  Calendar,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { rooms } from '@/data/rooms';
import { useUpcomingBookings, useTodaysBookings } from '@/hooks/useBookings';
import { useRooms } from '@/hooks/useRooms';
import type { Booking, Room } from '@/types';

// ── Chart mock data ──────────────────────────────────────────────────────────

const utilizationData = [
  { day: 'Mon', 'Tower I': 85, 'Tower II': 72, 'Bridge Tower': 65 },
  { day: 'Tue', 'Tower I': 78, 'Tower II': 80, 'Bridge Tower': 55 },
  { day: 'Wed', 'Tower I': 92, 'Tower II': 68, 'Bridge Tower': 78 },
  { day: 'Thu', 'Tower I': 70, 'Tower II': 88, 'Bridge Tower': 60 },
  { day: 'Fri', 'Tower I': 88, 'Tower II': 75, 'Bridge Tower': 70 },
  { day: 'Sat', 'Tower I': 45, 'Tower II': 30, 'Bridge Tower': 25 },
  { day: 'Sun', 'Tower I': 20, 'Tower II': 15, 'Bridge Tower': 10 },
];

const bookingTrendData = [
  { date: 'Jun 10', bookings: 8 },
  { date: 'Jun 11', bookings: 12 },
  { date: 'Jun 12', bookings: 10 },
  { date: 'Jun 13', bookings: 15 },
  { date: 'Jun 14', bookings: 9 },
  { date: 'Jun 15', bookings: 14 },
  { date: 'Jun 16', bookings: 11 },
];

// ── Dashboard Component ──────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: upcomingBookings, isLoading: upcomingLoading } = useUpcomingBookings();
  const { data: todaysBookings, isLoading: todaysLoading } = useTodaysBookings();
  const { data: roomsData, isLoading: roomsLoading } = useRooms();
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const isLoading = upcomingLoading || todaysLoading || roomsLoading;

  const allRooms = roomsData || rooms;
  const availableCount = allRooms.filter((r) => r.status === 'available').length;
  const activeBookings = upcomingBookings?.length ?? 0;
  const todaysMeetingsCount = todaysBookings?.length ?? 0;

  const roomMap = React.useMemo(() => {
    const map = new Map<string, Room>();
    allRooms.forEach((room) => map.set(room.id, room));
    return map;
  }, [allRooms]);

  const displayUpcoming = React.useMemo(() => {
    if (!upcomingBookings) return [];
    return upcomingBookings.slice(0, 5);
  }, [upcomingBookings]);

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Overview of your conference room bookings"
        />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Overview of your conference room bookings"
      >
        <Button onClick={() => navigate('/book')} className="gap-2">
          <Plus className="w-4 h-4" />
          Book Room
        </Button>
      </PageHeader>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="Total Rooms"
          value={14}
          description="Across all towers"
          icon={Building2}
          trend={{ value: 12, label: 'from last week' }}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatisticsCard
          title="Active Bookings"
          value={activeBookings}
          description="Confirmed & pending"
          icon={CalendarCheck}
          trend={{ value: 8, label: 'from last week' }}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatisticsCard
          title="Available Now"
          value={availableCount}
          description="Ready to book"
          icon={CheckCircle2}
          trend={{ value: 5, label: 'from yesterday' }}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatisticsCard
          title="Today's Meetings"
          value={todaysMeetingsCount}
          description="Scheduled for today"
          icon={Clock}
          trend={{ value: -3, label: 'from yesterday' }}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Utilization Bar Chart */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Room Utilization</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Occupancy rate by tower this week
                </p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                78% avg
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationData} barGap={2} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: any) => [`${value}%`, undefined]}
                  />
                  <Bar dataKey="Tower I" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Tower II" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Bridge Tower" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-sm bg-[#6366f1]" />
                Tower I
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-sm bg-[#8b5cf6]" />
                Tower II
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-sm bg-[#a78bfa]" />
                Bridge Tower
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Booking Trend Area Chart */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Weekly Booking Trend</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Number of bookings over the past 7 days
                </p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3" />
                79 total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrendData}>
                  <defs>
                    <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#bookingGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Meetings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Upcoming Meetings</h2>
              <p className="text-sm text-muted-foreground">Your next scheduled meetings</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/my-bookings')}>
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </div>

          {displayUpcoming.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming meetings"
              description="You don't have any meetings scheduled. Book a room to get started."
              actionLabel="Book a Room"
              onAction={() => navigate('/book')}
            />
          ) : (
            <div className="space-y-3">
              {displayUpcoming.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  room={roomMap.get(booking.roomId)}
                  showActions={true}
                  onView={() => handleViewBooking(booking)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">Common tasks at a glance</p>
          </div>
          <Card className="animate-fade-in">
            <CardContent className="p-4 space-y-3">
              <Button
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate('/book')}
              >
                <div className="p-1.5 rounded-lg bg-white/20">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Book a Room</div>
                  <div className="text-xs opacity-80">Reserve a conference room</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate('/calendar')}
              >
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">View Calendar</div>
                  <div className="text-xs text-muted-foreground">See all schedules</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate('/rooms')}
              >
                <div className="p-1.5 rounded-lg bg-emerald-50">
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Live Status</div>
                  <div className="text-xs text-muted-foreground">Room availability</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confirmed</span>
                <Badge variant="success">
                  {todaysBookings?.filter((b) => b.status === 'confirmed').length ?? 0}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <Badge variant="warning">
                  {todaysBookings?.filter((b) => b.status === 'pending').length ?? 0}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available Rooms</span>
                <Badge variant="secondary">{availableCount} / {allRooms.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Detail Modal */}
      <BookingModal
        booking={selectedBooking}
        room={selectedBooking ? roomMap.get(selectedBooking.roomId) : undefined}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
