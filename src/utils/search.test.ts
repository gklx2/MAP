import { describe, expect, it } from 'vitest';
import { places } from '../data/places';
import { searchPlaces } from './searchPlaces';
import { filterPlaces } from './filterPlaces';
import { parseSearchParams, serializeSearchState } from './searchParams';
import { booleanFilterKeys, emptySearchState } from '../types/filters';
import { safeUrl } from './safeUrl';

describe('조사 전 데이터 계약', () => {
  it('등록된 장소 없이 시작한다', () => { expect(places).toEqual([]); });
  it('빈 데이터의 모든 검색과 필터 결과가 비어 있다', () => {
    for (const query of ['', '   ', '도서관', '회기 콘센트']) expect(searchPlaces(places, query)).toEqual([]);
    const filters = emptySearchState().filters;
    filters.purposes = ['study', 'reading'];
    filters.categories = ['library', 'park'];
    for (const key of booleanFilterKeys) filters[key] = true;
    Object.freeze(places);
    expect(filterPlaces(places, filters)).toEqual([]);
    expect(places).toEqual([]);
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
