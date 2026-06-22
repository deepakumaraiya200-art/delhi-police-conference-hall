import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, MapPin, Clock, Layers } from 'lucide-react';
import { rooms as initialRooms } from '@/data/rooms';
import { cn } from '@/lib/utils';
import type { Room, RoomStatus } from '@/types';

interface LiveRoom extends Room {
  lastUpdated: Date;
  flash: boolean;
}

const statusConfig: Record<RoomStatus, { bg: string; text: string; dot: string; label: string; cardBg: string; ring: string }> = {
  available: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    label: 'Available',
    cardBg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    ring: 'ring-emerald-500/20',
  },
  occupied: {
    bg: 'bg-red-500',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    label: 'Occupied',
    cardBg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    ring: 'ring-red-500/20',
  },
  reserved: {
    bg: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    label: 'Reserved',
    cardBg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    ring: 'ring-amber-500/20',
  },
  under_maintenance: {
    bg: 'bg-slate-500',
    text: 'text-slate-700 dark:text-slate-400',
    dot: 'bg-slate-500',
    label: 'Maintenance',
    cardBg: 'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800',
    ring: 'ring-slate-500/20',
  },
};

const statuses: RoomStatus[] = ['available', 'occupied', 'reserved'];

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function LiveAvailabilityPage() {
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>(() =>
    initialRooms.map((room) => ({
      ...room,
      lastUpdated: new Date(),
      flash: false,
    }))
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerRandomStatusChange = useCallback(() => {
    setLiveRooms((prev) => {
      const roomIndex = Math.floor(Math.random() * prev.length);
      const room = prev[roomIndex];
      const otherStatuses = statuses.filter((s) => s !== room.status);
      const newStatus = otherStatuses[Math.floor(Math.random() * otherStatuses.length)];

      const updated = [...prev];
      updated[roomIndex] = {
        ...room,
        status: newStatus,
        lastUpdated: new Date(),
        flash: true,
      };
      return updated;
    });

    // Clear flash after 800ms
    setTimeout(() => {
      setLiveRooms((prev) =>
        prev.map((r) => (r.flash ? { ...r, flash: false } : r))
      );
    }, 800);
  }, []);

  useEffect(() => {
    const getRandomInterval = () => Math.floor(Math.random() * 3000) + 5000; // 5-8 seconds

    const scheduleNext = () => {
      intervalRef.current = setTimeout(() => {
        triggerRandomStatusChange();
        scheduleNext();
      }, getRandomInterval());
    };

    scheduleNext();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [triggerRandomStatusChange]);

  const counts = {
    available: liveRooms.filter((r) => r.status === 'available').length,
    occupied: liveRooms.filter((r) => r.status === 'occupied').length,
    reserved: liveRooms.filter((r) => r.status === 'reserved').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Availability"
        description=""
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          Live Updates
        </div>
      </PageHeader>

      {/* Legend + Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Card className="flex-1 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Legend */}
              <div className="flex items-center gap-5">
                {(Object.entries(statusConfig) as [RoomStatus, typeof statusConfig.available][]).map(
                  ([status, config]) => (
                    <div key={status} className="flex items-center gap-2">
                      <span className={cn('w-3 h-3 rounded-full', config.bg)} />
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                  )
                )}
              </div>

              {/* Counts */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {counts.available}
                  </span>
                  <span className="text-xs text-muted-foreground">Available</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                    {counts.occupied}
                  </span>
                  <span className="text-xs text-muted-foreground">Occupied</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    {counts.reserved}
                  </span>
                  <span className="text-xs text-muted-foreground">Reserved</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {liveRooms.map((room) => {
          const config = statusConfig[room.status];
          return (
            <Card
              key={room.id}
              className={cn(
                'relative overflow-hidden transition-all duration-500 border-2',
                config.cardBg,
                room.flash && 'ring-4 scale-[1.02]',
                room.flash && config.ring,
                !room.flash && 'hover:shadow-md hover:scale-[1.01]'
              )}
            >
              <CardContent className="p-4 space-y-3">
                {/* Status indicator */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{room.name}</h3>
                    {room.roomNumber && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Room {room.roomNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {room.status === 'available' && (
                      <span className="relative flex h-3 w-3">
                        <span
                          className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                        />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                      </span>
                    )}
                    {room.status !== 'available' && (
                      <span className={cn('h-3 w-3 rounded-full', config.bg)} />
                    )}
                    <span className={cn('text-xs font-semibold', config.text)}>
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span>{room.tower}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <Layers className="w-3 h-3 shrink-0" />
                    <span>{room.floor}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3 h-3 shrink-0" />
                    <span>
                      {room.capacity.min}–{room.capacity.max} people
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>Managed by {room.managedBy}</span>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 pt-1 border-t border-border/50">
                  <Clock className="w-3 h-3" />
                  <span>Last updated: {formatTimestamp(room.lastUpdated)}</span>
                </div>
              </CardContent>

              {/* Flash overlay */}
              {room.flash && (
                <div
                  className={cn(
                    'absolute inset-0 pointer-events-none animate-pulse',
                    room.status === 'available' && 'bg-emerald-500/10',
                    room.status === 'occupied' && 'bg-red-500/10',
                    room.status === 'reserved' && 'bg-amber-500/10',
                  )}
                />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default LiveAvailabilityPage;
