import { create } from 'zustand';
import type { FilterState, Tower, RoomStatus } from '@/types';

interface FilterStoreState {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
}

const initialFilters: FilterState = {
  tower: null,
  floor: null,
  capacity: null,
  availability: null,
  searchQuery: '',
};

export const useFilterStore = create<FilterStoreState>((set) => ({
  filters: { ...initialFilters },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: { ...initialFilters } }),
  setSearchQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),
}));
