import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { RoomCard } from '@/components/rooms/RoomCard';
import { FilterPanel } from '@/components/rooms/FilterPanel';
import { EmptyState } from '@/components/common/EmptyState';
import { RoomCardSkeleton } from '@/components/common/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LayoutGrid, List, SlidersHorizontal, X, Building2 } from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import { useFilterStore } from '@/store/filterStore';
import type { Room } from '@/types';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

export default function Rooms() {
  const navigate = useNavigate();
  const { data: rooms, isLoading, error } = useRooms();
  const { filters, setFilter, resetFilters, setSearchQuery } = useFilterStore();
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = React.useState(false);

  // Derive filtered rooms from data + filters
  const filteredRooms = React.useMemo(() => {
    if (!rooms) return [];
    let result = [...rooms];

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (room) =>
          room.name.toLowerCase().includes(query) ||
          room.roomNumber.toLowerCase().includes(query) ||
          room.tower.toLowerCase().includes(query) ||
          room.floor.toLowerCase().includes(query) ||
          room.managedBy.toLowerCase().includes(query) ||
          room.type.toLowerCase().includes(query) ||
          room.amenities.some((a) => a.toLowerCase().includes(query))
      );
    }

    // Tower filter
    if (filters.tower) {
      result = result.filter((room) => room.tower === filters.tower);
    }

    // Floor filter
    if (filters.floor) {
      result = result.filter((room) => room.floor === filters.floor);
    }

    // Capacity filter
    if (filters.capacity) {
      result = result.filter((room) => room.capacity.max >= (filters.capacity as number));
    }

    // Availability filter
    if (filters.availability) {
      result = result.filter((room) => room.status === filters.availability);
    }

    return result;
  }, [rooms, filters]);

  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.tower) count++;
    if (filters.floor) count++;
    if (filters.capacity) count++;
    if (filters.availability) count++;
    return count;
  }, [filters]);

  // Compute unique floors for info
  const towerCounts = React.useMemo(() => {
    if (!rooms) return { total: 0, available: 0, occupied: 0, reserved: 0 };
    return {
      total: rooms.length,
      available: rooms.filter((r) => r.status === 'available').length,
      occupied: rooms.filter((r) => r.status === 'occupied').length,
      reserved: rooms.filter((r) => r.status === 'reserved').length,
    };
  }, [rooms]);

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Conference Rooms" description="Browse and book available conference rooms" />
        <EmptyState
          icon={Building2}
          title="Failed to load rooms"
          description="An error occurred while loading the rooms. Please try again."
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Conference Rooms"
        description="Browse and book available conference rooms"
      >
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 hidden sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {towerCounts.available} available
          </Badge>
          <Button onClick={() => navigate('/book')} size="sm">
            Book Room
          </Button>
        </div>
      </PageHeader>

      {/* Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={filters.searchQuery}
          onChange={setSearchQuery}
          placeholder="Search rooms by name, tower, floor, amenities..."
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* View Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-9 w-9 rounded-none',
                viewMode === 'grid' && 'bg-muted'
              )}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-9 w-9 rounded-none',
                viewMode === 'list' && 'bg-muted'
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap animate-fade-in">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.tower && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Tower: {filters.tower}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setFilter('tower', null)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.availability && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Status: {filters.availability}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setFilter('availability', null)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.capacity && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Capacity: {filters.capacity}+
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setFilter('capacity', null)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={resetFilters}>
            Clear All
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn('flex gap-6', showFilters ? 'flex-col lg:flex-row' : '')}>
        {/* Filter Panel */}
        {showFilters && (
          <div className="w-full lg:w-64 shrink-0 animate-fade-in">
            <Card>
              <CardContent className="p-4">
                <FilterPanel />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rooms Grid/List */}
        <div className="flex-1 min-w-0">
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? 'Loading rooms...'
                : `Showing ${filteredRooms.length} of ${rooms?.length ?? 0} rooms`}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-3'
              )}
            >
              {[...Array(6)].map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredRooms.length === 0 && (
            <EmptyState
              icon={Building2}
              title="No rooms found"
              description="No conference rooms match your current filters. Try adjusting your search or clearing filters."
              actionLabel="Clear Filters"
              onAction={() => {
                resetFilters();
                setSearchQuery('');
              }}
            />
          )}

          {/* Room Cards */}
          {!isLoading && filteredRooms.length > 0 && (
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-3'
              )}
            >
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} view={viewMode} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
