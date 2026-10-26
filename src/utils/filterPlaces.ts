import type { Place } from '../types/place';
import { booleanFilterKeys, type PlaceFilters } from '../types/filters';

export function filterPlaces(places: readonly Place[], filters: PlaceFilters): Place[] {
  return places.filter(place =>
    (filters.purposes.length === 0 || filters.purposes.some(purpose => place.purposes.includes(purpose)))
    && (filters.categories.length === 0 || filters.categories.includes(place.category))
    && booleanFilterKeys.every(key => filters[key] === undefined || place[key] === filters[key]),
  );
}
