export interface Place {
  id: string;
  name: string;
  category: 'library' | 'youth' | 'community' | 'culture' | 'public_lounge' | 'park' | 'plaza' | 'university' | 'other';
  address: string;
  district: '동대문구';
  latitude: number;
  longitude: number;
  description?: string;
  openingHours?: string;
  free?: boolean;
  purchaseRequired?: boolean;
  indoor?: boolean;
  outdoor?: boolean;
  wifi?: boolean;
  outlet?: boolean;
  restroom?: boolean;
  desk?: boolean;
  conversationAllowed?: boolean;
  laptopFriendly?: boolean;
  foodAllowed?: boolean;
  reservationRequired?: boolean;
  wheelchairAccessible?: boolean;
  purposes: Array<'study' | 'work' | 'rest' | 'conversation' | 'waiting' | 'reading' | 'meeting'>;
  source?: string;
  sourceUrl?: string;
  lastVerified?: string;
  imageUrl?: string;
}

export type Category = Place['category'];
export type Purpose = Place['purposes'][number];
