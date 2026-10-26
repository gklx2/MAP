import type { Category, Purpose } from './place';

export const booleanFilterKeys = [
  'wifi', 'outlet', 'restroom', 'desk', 'wheelchairAccessible',
  'free', 'purchaseRequired', 'reservationRequired', 'indoor', 'outdoor',
  'conversationAllowed', 'laptopFriendly',
] as const;

export type BooleanFilterKey = typeof booleanFilterKeys[number];
export type PlaceFilters = { purposes: Purpose[]; categories: Category[] }
  & Partial<Record<BooleanFilterKey, boolean>>;
export interface SearchState { query: string; filters: PlaceFilters }

export function emptySearchState(): SearchState {
  return { query: '', filters: { purposes: [], categories: [] } };
}

export function countFilters(filters: PlaceFilters): number {
  return filters.purposes.length + filters.categories.length
    + booleanFilterKeys.filter(key => filters[key] !== undefined).length;
}
