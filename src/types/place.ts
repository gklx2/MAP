interface PlaceConditions {
  free?: boolean;
  indoor?: boolean;
  outdoor?: boolean;
  wifi?: boolean;
  outlet?: boolean;
  restroom?: boolean;
  conversationAllowed?: boolean;
  laptopFriendly?: boolean;
  foodAllowed?: boolean;
  reservationRequired?: boolean;
  wheelchairAccessible?: boolean;
}

export interface Place extends PlaceConditions {
  id: string;
  name: string;
  category: 'library' | 'youth' | 'community' | 'culture' | 'public_lounge' | 'park' | 'plaza' | 'university';
  address: string;
  district: '동대문구';
  latitude: number;
  longitude: number;
  description?: string;
  openingHours?: string;
  // 필터에 쓰는 값은 위 조건에, 구역·시간·예외는 여기에 기록합니다.
  conditionDetails?: Partial<Record<keyof PlaceConditions, string>>;
  purposes: Array<'study' | 'work' | 'rest' | 'conversation' | 'waiting' | 'reading' | 'meeting'>;
  source?: string;
  sourceUrl?: string;
  lastVerified?: string;
  imageUrl?: string;
}

export type Category = Place['category'];
export type Purpose = Place['purposes'][number];
