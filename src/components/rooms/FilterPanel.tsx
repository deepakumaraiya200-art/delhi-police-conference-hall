import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RotateCcw } from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';

export function FilterPanel() {
  const { filters, setFilter, resetFilters } = useFilterStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Filters</h3>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-auto py-1 text-xs gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>
      <Separator />

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Tower</Label>
          <Select
            value={filters.tower || 'all'}
            onValueChange={(v) => setFilter('tower', v === 'all' ? null : v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Towers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Towers</SelectItem>
              <SelectItem value="Tower I">Tower I</SelectItem>
              <SelectItem value="Tower II">Tower II</SelectItem>
              <SelectItem value="Bridge Tower">Bridge Tower</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Availability</Label>
          <Select
            value={filters.availability || 'all'}
            onValueChange={(v) => setFilter('availability', v === 'all' ? null : v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Any Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Min Capacity</Label>
          <Select
            value={filters.capacity?.toString() || 'all'}
            onValueChange={(v) => setFilter('capacity', v === 'all' ? null : parseInt(v))}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Any Capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Capacity</SelectItem>
              <SelectItem value="15">15+</SelectItem>
              <SelectItem value="25">25+</SelectItem>
              <SelectItem value="50">50+</SelectItem>
              <SelectItem value="100">100+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
