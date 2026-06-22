import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatisticsCard } from '@/components/common/StatisticsCard';
import { BookingCard } from '@/components/booking/BookingCard';
import { BookingModal } from '@/components/booking/BookingModal';
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2, CalendarCheck, CheckCircle2, Clock, ArrowRight,
  TrendingUp, Activity, ShieldCheck, Plus, BookOpen, Star,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { rooms } from '@/data/rooms';
import { users } from '@/data/users';
import { useUpcomingBookings, useTodaysBookings, useBookings } from '@/hooks/useBookings';
import { useRooms } from '@/hooks/useRooms';
import { useUserStore } from '@/store/userStore';
import type { Booking, Room } from '@/types';

const utilizationData = [
  { day: 'Mon', 'Tower I': 85, 'Tower II': 72, 'Bridge': 65 },
  { day: 'Tue', 'Tower I': 78, 'Tower II': 80, 'Bridge': 55 },
  { day: 'Wed', 'Tower I': 92, 'Tower II': 68, 'Bridge': 78 },
  { day: 'Thu', 'Tower I': 70, 'Tower II': 88, 'Bridge': 60 },
  { day: 'Fri', 'Tower I': 88, 'Tower II': 75, 'Bridge': 70 },
  { day: 'Sat', 'Tower I': 45, 'Tower II': 30, 'Bridge': 25 },
  { day: 'Sun', 'Tower I': 20, 'Tower II': 15, 'Bridge': 10 },
];

const bookingTrendData = [
  { date: 'Day -6', bookings: 8 },
  { date: 'Day -5', bookings: 12 },
  { date: 'Day -4', bookings: 10 },
  { date: 'Day -3', bookings: 15 },
  { date: 'Day -2', bookings: 9 },
  { date: 'Yesterday', bookings: 14 },
  { date: 'Today', bookings: 11 },
];

function AdminHeroBanner({ name }: { name: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-6"
      style={{ background: 'linear-gradient(135deg, #0f2344 0%, #1a3a6b 50%, #0f2344 100%)' }}>
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="adminGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="#c9a84c" />
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#adminGrid)" />
        </svg>
      </div>
      {/* Gold ring decoration */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border-4 border-[#c9a84c]/20" />
      <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full border-2 border-[#c9a84c]/10" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full border border-white/10" />

      <div className="relative z-10 px-6 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#c9a84c]/20 border border-[#c9a84c]/40 backdrop-blur-sm">
            <Star className="w-7 h-7 text-[#c9a84c]" fill="currentColor" />
          </div>
          <div>
            <p className="text-[#c9a84c] text-xs font-semibold tracking-widest uppercase mb-0.5">Delhi Police · PHQ</p>
            <h2 className="text-white text-xl font-bold leading-tight">Welcome, {name}</h2>
            <p className="text-blue-200/70 text-sm mt-0.5">System Administrator · Full Command Access</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 min-w-[70px]">
            <span className="text-[#c9a84c] font-bold text-lg leading-none">14</span>
            <span className="text-white/60 text-[10px] mt-0.5">Halls</span>
          </div>
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 min-w-[70px]">
            <span className="text-emerald-300 font-bold text-lg leading-none">3</span>
            <span className="text-white/60 text-[10px] mt-0.5">Towers</span>
          </div>
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 min-w-[70px]">
            <span className="text-sky-300 font-bold text-lg leading-none">2</span>
            <span className="text-white/60 text-[10px] mt-0.5">Caretakers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { data: upcomingBookings, isLoading: upcomingLoading } = useUpcomingBookings();
  const { data: todaysBookings, isLoading: todaysLoading } = useTodaysBookings();
  const { data: allBookings } = useBookings();
  const { data: roomsData } = useRooms();
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const allRooms = roomsData || rooms;
  const availableCount = allRooms.filter((r) => r.status === 'available').length;
  const activeBookings = upcomingBookings?.length ?? 0;
  const todaysMeetingsCount = todaysBookings?.length ?? 0;

  const roomMap = React.useMemo(() => {
    const map = new Map<string, Room>();
    allRooms.forEach((r) => map.set(r.id, r));
    return map;
  }, [allRooms]);

  const displayUpcoming = React.useMemo(() => {
    if (!upcomingBookings) return [];
    return upcomingBookings.slice(0, 6);
  }, [upcomingBookings]);

  const caretakers = users.filter((u) => u.role === 'caretaker');

  if (upcomingLoading || todaysLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin Dashboard" description="Full system overview" />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeroBanner name={currentUser?.name ?? 'Admin'} />

      <PageHeader title="Admin Dashboard" description="Complete overview of all conference hall activity">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => navigate('/book')} size="sm" className="gap-2 bg-[#535bad] hover:bg-[#464fa0] text-white">
            <Plus className="w-4 h-4" /> Book a Hall
          </Button>
          <Button onClick={() => navigate('/admin/bookings')} size="sm" variant="outline" className="gap-2 border-neutral-300 text-[#535bad]">
            <BookOpen className="w-4 h-4" /> Manage Bookings
          </Button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="Total Halls"
          value={14}
          description="Across all towers"
          icon={Building2}
          trend={{ value: 0, label: 'rooms total' }}
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
          trend={{ value: 5, label: 'rooms free' }}
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

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Room Utilization by Tower</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Occupancy rate this week</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" /> 78% avg
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationData} barGap={2} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: any) => [`${v}%`, undefined]} />
                  <Bar dataKey="Tower I" fill="#535bad" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Tower II" fill="#6b72c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Bridge" fill="#8b91d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Weekly Booking Trend</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Bookings over past 7 days</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Activity className="w-3 h-3" /> 79 total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrendData}>
                  <defs>
                    <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#535bad" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#535bad" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="bookings" stroke="#535bad" strokeWidth={2} fill="url(#bookingGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming + Caretaker Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Upcoming Meetings (All Officers)</h2>
              <p className="text-sm text-neutral-400">System-wide scheduled meetings</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/admin/bookings')}>
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayUpcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                room={roomMap.get(booking.roomId)}
                showActions={false}
                onView={() => { setSelectedBooking(booking); setModalOpen(true); }}
              />
            ))}
          </div>
        </div>

        {/* Caretaker Status + Today's Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Caretaker Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {caretakers.map((ct) => {
                const assignedRooms = (ct.assignedRooms ?? []).map((rid) => allRooms.find((r) => r.id === rid)).filter(Boolean) as Room[];
                const available = assignedRooms.filter((r) => r.status === 'available').length;
                const occupied = assignedRooms.filter((r) => r.status === 'occupied').length;
                const reserved = assignedRooms.filter((r) => r.status === 'reserved').length;
                return (
                  <div key={ct.id} className="rounded-lg border border-neutral-100 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <img src={ct.avatar} className="w-7 h-7 rounded-full" alt={ct.name} />
                      <div>
                        <p className="text-xs font-semibold text-neutral-800">{ct.name}</p>
                        <p className="text-[10px] text-neutral-400">{assignedRooms.length} rooms assigned</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">{available} free</span>
                      <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full">{occupied} occupied</span>
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">{reserved} reserved</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confirmed</span>
                <Badge variant="success">{todaysBookings?.filter((b) => b.status === 'confirmed').length ?? 0}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reserved</span>
                <Badge variant="warning">{todaysBookings?.filter((b) => b.status === 'reserved').length ?? 0}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available Halls</span>
                <Badge variant="secondary">{availableCount} / 14</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BookingModal
        booking={selectedBooking}
        room={selectedBooking ? roomMap.get(selectedBooking.roomId) : undefined}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
