import type { Category, Purpose } from '../types/place';
import type { BooleanFilterKey } from '../types/filters';

export const categoryLabels: Record<Category, string> = {
  library: '도서관', youth: '청년공간', community: '주민·커뮤니티 공간',
  culture: '문화시설', public_lounge: '공공 라운지', park: '공원',
  plaza: '광장', university: '대학', other: '기타',
};
export const purposeLabels: Record<Purpose, string> = {
  study: '공부', work: '노트북 작업', rest: '휴식', conversation: '대화',
  reading: '독서', waiting: '대기', meeting: '모임',
};
export const facilityOptions: { key: BooleanFilterKey; label: string; value: boolean }[] = [
  { key: 'wifi', label: 'Wi-Fi', value: true },
  { key: 'outlet', label: '콘센트', value: true },
  { key: 'restroom', label: '화장실', value: true },
  { key: 'desk', label: '책상', value: true },
  { key: 'wheelchairAccessible', label: '휠체어 접근', value: true },
];
export const conditionOptions: typeof facilityOptions = [
  { key: 'free', label: '무료', value: true },
  { key: 'purchaseRequired', label: '구매 필요 없음', value: false },
  { key: 'reservationRequired', label: '예약 필요 없음', value: false },
  { key: 'indoor', label: '실내', value: true },
  { key: 'outdoor', label: '야외', value: true },
];
export function booleanLabel(value: boolean | undefined, yes = '있음', no = '없음'): string {
  return value === undefined ? '미확인' : value ? yes : no;
}
