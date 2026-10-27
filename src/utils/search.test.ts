import { describe, expect, it } from 'vitest';
import { places } from '../data/places';
import type { Place } from '../types/place';
import { searchPlaces } from './searchPlaces';
import { filterPlaces } from './filterPlaces';
import { parseSearchParams, serializeSearchState } from './searchParams';
import { booleanFilterKeys, emptySearchState } from '../types/filters';
import { safeUrl } from './safeUrl';

describe('장소 데이터와 빈 결과 처리', () => {
  it('등록된 장소의 ID는 중복되지 않고 좌표는 유효한 숫자이다', () => {
    const ids = places.map(place => place.id);
    expect(ids.every(id => id.trim().length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    for (const place of places) {
      expect(Number.isFinite(place.latitude)).toBe(true);
      expect(Number.isFinite(place.longitude)).toBe(true);
      expect(place.latitude).toBeGreaterThanOrEqual(-90);
      expect(place.latitude).toBeLessThanOrEqual(90);
      expect(place.longitude).toBeGreaterThanOrEqual(-180);
      expect(place.longitude).toBeLessThanOrEqual(180);
      expect(place.district).toBe('동대문구');
    }
  });
  it('빈 데이터의 모든 검색과 필터 결과가 비어 있다', () => {
    const emptyPlaces: readonly Place[] = Object.freeze([] as Place[]);
    for (const query of ['', '   ', '도서관', '회기 콘센트']) expect(searchPlaces(emptyPlaces, query)).toEqual([]);
    const filters = emptySearchState().filters;
    filters.purposes = ['study', 'reading'];
    filters.categories = ['library', 'park'];
    for (const key of booleanFilterKeys) filters[key] = true;
    expect(filterPlaces(emptyPlaces, filters)).toEqual([]);
    expect(emptyPlaces).toEqual([]);
  });
});

describe('이용 목적 검색', () => {
  const studyPlace = places.find(place => place.purposes.includes('study')
    && ![place.name, place.address, place.description].some(value => value?.includes('공부')));

  it.skipIf(!studyPlace)('설명에 공부가 없어도 이용 목적이 공부인 장소를 찾는다', () => {
    expect(searchPlaces([studyPlace!], '공부')).toEqual([studyPlace]);
    const city = studyPlace!.address.split(' ')[0];
    expect(searchPlaces([studyPlace!], `${city} 공부`)).toEqual([studyPlace]);
  });

  it.each([
    ['study', '공부'], ['work', '노트북'], ['rest', '휴식'],
    ['conversation', '대화'], ['reading', '독서'], ['waiting', '대기'], ['meeting', '모임'],
  ] as const)('%s 이용 목적을 한국어 검색어 %s로 찾는다', (purpose, query) => {
    const matchingPlaces = places.filter(place => place.purposes.includes(purpose));
    expect(searchPlaces(places, query)).toEqual(expect.arrayContaining(matchingPlaces));
  });
});

describe('URL 상태', () => {
  it('복수 선택, 한국어, false, 공백 및 모든 boolean 값을 왕복 보존한다', () => {
    const state = emptySearchState();
    state.query = '회기 근처 공간';
    state.filters.purposes = ['study', 'conversation'];
    state.filters.categories = ['library', 'public_lounge'];
    booleanFilterKeys.forEach((key, index) => { state.filters[key] = index % 2 === 0; });
    expect(parseSearchParams(serializeSearchState(state))).toEqual(state);
  });
  it('잘못된 값과 중복을 제거하고 미확인을 false로 바꾸지 않는다', () => {
    const state = parseSearchParams(new URLSearchParams('purpose=study&purpose=study&purpose=invalid&category=__proto__&wifi=maybe&outlet=1&reservationRequired=false'));
    expect(state.filters.purposes).toEqual(['study']);
    expect(state.filters.categories).toEqual([]);
    expect(state.filters.wifi).toBeUndefined();
    expect(state.filters.outlet).toBeUndefined();
    expect(state.filters.reservationRequired).toBe(false);
  });
  it('관리하는 쿼리만 교체하고 다른 쿼리는 보존한다', () => {
    const params = serializeSearchState(emptySearchState(), new URLSearchParams('q=old&wifi=true&utm_source=course'));
    expect(params.toString()).toBe('utm_source=course');
  });
  it('빈 검색 조건을 간결한 URL로 직렬화한다', () => {
    expect(serializeSearchState(emptySearchState()).toString()).toBe('');
  });
});

describe('외부 링크', () => {
  it('웹 링크만 허용하고 잘못된 주소를 거른다', () => {
    expect(safeUrl('https://www.ddm.go.kr/')).toBe('https://www.ddm.go.kr/');
    expect(safeUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeUrl('data:text/html,test')).toBeUndefined();
    expect(safeUrl('invalid')).toBeUndefined();
    expect(safeUrl()).toBeUndefined();
  });
});
