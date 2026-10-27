import type { Place } from '../types/place';
import { categoryLabels, purposeLabels } from '../config/labels';

export function searchPlaces(places: readonly Place[], query: string): Place[] {
  const terms = query.trim().normalize('NFKC').toLocaleLowerCase('ko').split(/\s+/).filter(Boolean);
  return places.filter(place => {
    const text = [place.name, place.address, place.description, categoryLabels[place.category], place.category,
      ...place.purposes.flatMap(purpose => [purposeLabels[purpose], purpose])]
      .filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase('ko');
    return terms.every(term => text.includes(term));
  });
}
