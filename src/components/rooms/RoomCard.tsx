import React, { useState } from 'react';
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
  const [imgError, setImgError] = useState(false);

  const amenityIcons: Record<string, React.ReactNode> = {
    'WiFi': <Wifi className="w-3 h-3" />,
    'Projector': <Monitor className="w-3 h-3" />,
    'Video Conferencing': <Monitor className="w-3 h-3" />,
    'Microphone': <Mic className="w-3 h-3" />,
  };

  // ─── LIST VIEW ─────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <Card className="animate-fade-in hover:shadow-lg transition-all duration-300">
        <div className="flex items-center p-4 gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-slate-100 relative">
            {/* CHANGED THIS BACK TO room.imgsrc */}
            {room.imgsrc && !imgError ? (
              <img 
                src={room.imgsrc} 
                alt={room.name} 
                className="w-full h-full object-cover" 
                onError={() => setImgError(true)} 
              />
            ) : (
              <Building2 className={cn(
                "w-7 h-7",
                room.status === 'available' ? 'text-emerald-500' :
                room.status === 'occupied' ? 'text-red-500' : room.status === 'reserved' ? 'text-amber-500' : 'text-slate-400'
              )} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{room.name}</h3>
              <AvailabilityBadge status={room.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> 
                <span className="truncate">
                  {room.tower} • {room.floor} {room.roomNumber && `• Room ${room.roomNumber}`}
                </span>
              </span>
              <span className="flex items-center gap-1 shrink-0">
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

  // ─── GRID VIEW ─────────────────────────────────────────────────────────────
  return (
    <Card className="group animate-fade-in hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      
      {/* Room Image Header */}
      <div className="relative h-48 w-full bg-slate-100 flex-shrink-0">
        {/* CHANGED THIS BACK TO room.imgsrc */}
        {room.imgsrc && !imgError ? (
          <img 
            src={room.imgsrc} 
            alt={room.name} 
            className="w-full h-full object-cover" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-slate-300" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute top-3 right-3 z-10">
          <AvailabilityBadge status={room.status} />
        </div>
        
        <div className="absolute bottom-3 left-4 right-4 z-10">
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">{room.name}</h3>
        </div>
      </div>

      <CardContent className="p-4 space-y-3 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
          <span className="flex items-center gap-1.5 text-muted-foreground truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate" title={`${room.tower} • ${room.floor} • Room ${room.roomNumber}`}>
              {room.tower} • {room.floor} {room.roomNumber && `• Room ${room.roomNumber}`}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground shrink-0 font-medium">
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
          <div className="flex flex-wrap gap-1 pt-1">
            {room.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-slate-100"
              >
                {amenityIcons[amenity] || null}
                {amenity}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                +{room.amenities.length - 4}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2 mt-auto">
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
          className="flex-1 gap-1 border-none font-semibold text-sm bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate(`/book?room=${room.id}`)}
        >
          Book Now <ArrowRight className="w-3 h-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}