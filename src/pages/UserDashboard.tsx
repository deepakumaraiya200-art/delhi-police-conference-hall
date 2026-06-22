import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatisticsCard } from '@/components/common/StatisticsCard';
import { BookingCard } from '@/components/booking/BookingCard';
import { BookingModal } from '@/components/booking/BookingModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CalendarCheck, CheckCircle2, Plus, ArrowRight, Building2,
  Shield, ShieldCheck, Star, Crown, BadgeCheck, User as UserIcon,
} from 'lucide-react';
import { rooms as allRoomsData } from '@/data/rooms';
import { useUserBookings } from '@/hooks/useBookings';
import { useUserStore } from '@/store/userStore';
import type { Booking, Room, OfficerRank } from '@/types';
import { getRankLabel, isOfficerRank } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// ─── Rank-specific banner config ────────────────────────────────────────────

type RankBannerConfig = {
  gradient: string;
  accentColor: string;
  textAccent: string;
  borderAccent: string;
  icon: React.ComponentType<{ className?: string }>;
  subtitle: string;
};

const RANK_BANNER: Record<OfficerRank, RankBannerConfig> = {
  cp: {
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 40%, #78350f 100%)',
    accentColor: 'bg-amber-300/20 border-amber-300/40',
    textAccent: 'text-amber-300',
    borderAccent: 'border-amber-300/20',
    icon: Crown,
    subtitle: 'Commissioner of Police · Highest Command',
  },
  special_cp: {
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 40%, #312e81 100%)',
    accentColor: 'bg-violet-300/20 border-violet-300/40',
    textAccent: 'text-violet-300',
    borderAccent: 'border-violet-300/20',
    icon: Star,
    subtitle: 'Special Commissioner of Police',
  },
  joint_cp: {
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #1e40af 100%)',
    accentColor: 'bg-blue-300/20 border-blue-300/40',
    textAccent: 'text-blue-300',
    borderAccent: 'border-blue-300/20',
    icon: ShieldCheck,
    subtitle: 'Joint Commissioner of Police',
  },
  additional_cp: {
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 40%, #075985 100%)',
    accentColor: 'bg-sky-300/20 border-sky-300/40',
    textAccent: 'text-sky-300',
    borderAccent: 'border-sky-300/20',
    icon: Shield,
    subtitle: 'Addl. Commissioner of Police',
  },
  dcp: {
    gradient: 'linear-gradient(135deg, #134e4a 0%, #0d9488 40%, #0f766e 100%)',
    accentColor: 'bg-teal-300/20 border-teal-300/40',
    textAccent: 'text-teal-300',
    borderAccent: 'border-teal-300/20',
    icon: BadgeCheck,
    subtitle: 'Deputy Commissioner of Police',
  },
  acp: {
    gradient: 'linear-gradient(135deg, #312e81 0%, #4338ca 40%, #3730a3 100%)',
    accentColor: 'bg-indigo-300/20 border-indigo-300/40',
    textAccent: 'text-indigo-300',
    borderAccent: 'border-indigo-300/20',
    icon: BadgeCheck,
    subtitle: 'Assistant Commissioner of Police',
  },
  si: {
    gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #1e293b 100%)',
    accentColor: 'bg-slate-300/20 border-slate-300/40',
    textAccent: 'text-slate-300',
    borderAccent: 'border-slate-300/20',
    icon: Shield,
    subtitle: 'Sub-Inspector · Delhi Police',
  },
  user: {
    gradient: 'linear-gradient(135deg, #27272a 0%, #3f3f46 40%, #18181b 100%)',
    accentColor: 'bg-zinc-300/20 border-zinc-300/40',
    textAccent: 'text-zinc-300',
    borderAccent: 'border-zinc-300/20',
    icon: UserIcon,
    subtitle: 'Police Officer · Delhi Police',
  },
};

function OfficerHeroBanner({ name, role }: { name: string; role: OfficerRank }) {
  const cfg = RANK_BANNER[role];
  const Icon = cfg.icon;
  const rankLabel = getRankLabel(role);

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6" style={{ background: cfg.gradient }}>
      {/* Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`rankGrid-${role}`} x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
              <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" fill="none" stroke="#ffffff" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#rankGrid-${role})`} />
        </svg>
      </div>
      <div className={cn('absolute -right-14 -top-14 w-60 h-60 rounded-full border-4', cfg.borderAccent)} />
      <div className={cn('absolute -right-6 -top-6 w-44 h-44 rounded-full border-2', cfg.borderAccent)} />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full border border-white/10" />

      <div className="relative z-10 px-6 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-xl backdrop-blur-sm', cfg.accentColor)}>
            <Icon className={cn('w-7 h-7', cfg.textAccent)} />
          </div>
          <div>
            <p className={cn('text-xs font-semibold tracking-widest uppercase mb-0.5', cfg.textAccent)}>
              {rankLabel}
            </p>
            <h2 className="text-white text-xl font-bold leading-tight">Welcome, {name}</h2>
            <p className="text-white/60 text-sm mt-0.5">{cfg.subtitle}</p>
          </div>
        </div>
        <div className="shrink-0">
          <div className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border bg-white/10',
            cfg.borderAccent
          )}>
            <Icon className={cn('w-4 h-4', cfg.textAccent)} />
            <span className={cn('text-sm font-bold', cfg.textAccent)}>
              {rankLabel.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { data: myBookings, isLoading } = useUserBookings(currentUser?.id ?? '');
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const roomMap = useMemo(() => {
    const map = new Map<string, Room>();
    allRoomsData.forEach((r) => map.set(r.id, r));
    return map;
  }, []);

  const { upcoming, completed, cancelled } = useMemo(() => {
    if (!myBookings) return { upcoming: [], completed: [], cancelled: [] };
    const upcoming = myBookings
      .filter((b) => (b.status === 'confirmed' || b.status === 'reserved' || b.status === 'ongoing') && (b.date > todayStr || (b.date === todayStr && b.startTime > currentTime)))
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    const completed = myBookings
      .filter((b) => b.status === 'completed' || (b.date < todayStr && (b.status === 'confirmed' || b.status === 'reserved')))
      .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));
    const cancelled = myBookings
      .filter((b) => b.status === 'cancelled')
      .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));
    return { upcoming, completed, cancelled };
  }, [myBookings, todayStr, currentTime]);

  const officerRole = isOfficerRank(currentUser?.role ?? 'user')
    ? (currentUser!.role as OfficerRank)
    : 'user';

  return (
    <div className="space-y-6">
      <OfficerHeroBanner name={currentUser?.name ?? 'Officer'} role={officerRole} />

      <PageHeader
        title={`Welcome, ${currentUser?.name}`}
        description={getRankLabel(currentUser?.role ?? 'user')}
      >
        <Button onClick={() => navigate('/book')} className="gap-2 border border-neutral-500/20 text-[#535bad]">
          <Plus className="w-4 h-4" /> Book a Hall
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatisticsCard
          title="Upcoming Meetings"
          value={upcoming.length}
          description="Confirmed & pending"
          icon={CalendarCheck}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatisticsCard
          title="Completed Meetings"
          value={completed.length}
          description="Past meetings"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatisticsCard
          title="Cancelled"
          value={cancelled.length}
          description="Cancelled bookings"
          icon={Building2}
          iconColor="text-red-500"
          iconBg="bg-red-50"
        />
      </div>

      {/* Upcoming meetings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">My Upcoming Meetings</h2>
            <p className="text-sm text-neutral-400">Your scheduled conference hall bookings</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/my-bookings')}>
            View All <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        {isLoading ? (
          <div className="text-sm text-neutral-400 p-4">Loading your bookings...</div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No upcoming bookings"
            description="You haven't booked any hall yet. Book one of the 14 available halls."
            actionLabel="Book a Hall"
            onAction={() => navigate('/book')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.slice(0, 6).map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                room={roomMap.get(b.roomId)}
                showActions={true}
                onView={() => { setSelectedBooking(b); setModalOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Available Halls Right Now</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {allRoomsData.filter((r) => r.status === 'available').slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-neutral-700">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                    {r.name}
                  </span>
                  <span className="text-xs text-neutral-400">{r.tower}</span>
                </div>
              ))}
              {allRoomsData.filter((r) => r.status === 'available').length > 4 && (
                <Button variant="ghost" size="sm" className="w-full mt-1 text-xs" onClick={() => navigate('/rooms')}>
                  View All Available Halls <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">My Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Upcoming</span>
              <Badge variant="secondary">{upcoming.length}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <Badge variant="success">{completed.length}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cancelled</span>
              <Badge variant="destructive">{cancelled.length}</Badge>
            </div>
          </CardContent>
        </Card>
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
