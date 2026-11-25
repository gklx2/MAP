import type { Place } from '../types/place';
import { categoryLabels, purposeLabels } from '../config/labels';

export function searchPlaces(places: readonly Place[], query: string): Place[] {
  const terms = query.trim().normalize('NFKC').toLocaleLowerCase('ko').split(/\s+/).filter(Boolean);
  return places.filter(place => {
    // '독서실' 키워드는 실제 장소 이름이나 설명으로 검색합니다.
    const categoryText = place.category === 'library' ? '도서관' : categoryLabels[place.category];
    const text = [place.name, place.address, place.description, categoryText, place.category,
      ...place.purposes.flatMap(purpose => [purposeLabels[purpose], purpose])]
      .filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase('ko');
    return terms.every(term => text.includes(term));
  });
}
