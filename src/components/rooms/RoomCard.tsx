import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvailabilityBadge } from '@/components/common/AvailabilityBadge';
import { Users, MapPin, Building2, ArrowRight, Wifi, Monitor, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Room } from '@/types';

interface RoomCardProps {
  room: Room;
  view?: 'grid' | 'list';
}

export function RoomCard({ room, view = 'grid' }: RoomCardProps) {
  const navigate = useNavigate();

  const amenityIcons: Record<string, React.ReactNode> = {
    'WiFi': <Wifi className="w-3 h-3" />,
    'Projector': <Monitor className="w-3 h-3" />,
    'Video Conferencing': <Monitor className="w-3 h-3" />,
    'Microphone': <Mic className="w-3 h-3" />,
  };

  if (view === 'list') {
    return (
      <Card className="animate-fade-in hover:shadow-lg transition-all duration-300">
        <div className="flex items-center p-4 gap-4">
          <div
            className={cn(
              'w-16 h-16 rounded-xl flex items-center justify-center shrink-0',
              room.status === 'available' ? 'bg-emerald-50 text-emerald-600' :
              room.status === 'occupied' ? 'bg-red-50 text-red-600' :
              'bg-amber-50 text-amber-600'
            )}
          >
            <Building2 className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{room.name}</h3>
              <AvailabilityBadge status={room.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {room.tower} • Floor {room.floor}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {room.capacity.min}-{room.capacity.max}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/rooms/${room.id}`)}>
              Details
            </Button>
            <Button size="sm" onClick={() => navigate(`/book?room=${room.id}`)}>
              Book
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group animate-fade-in hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Room visual header */}
      <div
        className={cn(
          'h-36 relative flex items-end p-4',
          room.type === 'Auditorium'
            ? 'bg-gradient-to-br from-violet-500 to-purple-700'
            : room.type === 'Mini Auditorium'
            ? 'bg-gradient-to-br from-blue-500 to-indigo-700'
            : 'bg-gradient-to-br from-primary to-indigo-600'
        )}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-3 right-3 z-10">
          <AvailabilityBadge status={room.status} />
        </div>
        <div className="relative z-10">
          <h3 className="text-white font-bold text-lg leading-tight">{room.name}</h3>
          {room.roomNumber && (
            <p className="text-white/80 text-sm">Room {room.roomNumber}</p>
          )}
        </div>
        <div className="absolute bottom-0 right-0 opacity-10">
          <Building2 className="w-24 h-24 text-white transform translate-x-4 translate-y-4" />
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {room.tower} • Floor {room.floor}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            {room.capacity.min}-{room.capacity.max}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs font-normal">
            {room.managedBy}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal">
            {room.type}
          </Badge>
        </div>

        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {room.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground"
              >
                {amenityIcons[amenity] || null}
                {amenity}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                +{room.amenities.length - 4}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => navigate(`/rooms/${room.id}`)}
        >
          Details
        </Button>
        <Button
          size="sm"
          className="flex-1 gap-1"
          onClick={() => navigate(`/book?room=${room.id}`)}
        >
          Book Now <ArrowRight className="w-3 h-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
