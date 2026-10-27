import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { createRegionIndex, findRegion, type RegionProperties } from './findRegion';

const properties = (code: string, name: string): RegionProperties => ({
  SIG_CD: code, SIG_KOR_NM: name, SIDO_NM: '테스트시',
});
const sample: FeatureCollection<Polygon | MultiPolygon, RegionProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature', properties: properties('one', '첫째 구'),
      geometry: { type: 'Polygon', coordinates: [
        [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
        [[3, 3], [7, 3], [7, 7], [3, 7], [3, 3]],
      ] },
    },
    {
      type: 'Feature', properties: properties('two', '섬 구'),
      geometry: { type: 'MultiPolygon', coordinates: [
        [[[20, 0], [22, 0], [22, 2], [20, 2], [20, 0]]],
        [[[30, 0], [32, 0], [32, 2], [30, 2], [30, 0]]],
      ] },
    },
  ],
};

describe('지도 중심 행정구역 찾기', () => {
  const index = createRegionIndex(sample);

  it('다각형 내부와 경계선을 찾고 좌표 순서를 구분한다', () => {
    expect(findRegion(index, 2, 8)?.SIG_CD).toBe('one');
    expect(findRegion(index, 0, 5)?.SIG_CD).toBe('one');
    expect(findRegion(index, 2, 20)?.SIG_CD).toBe('two');
    expect(findRegion(index, 20, 2)).toBeNull();
  });

  it('행정구역의 구멍 내부와 지역 밖을 제외한다', () => {
    expect(findRegion(index, 5, 5)).toBeNull();
    expect(findRegion(index, 5, 3)?.SIG_CD).toBe('one');
    expect(findRegion(index, 50, 50)).toBeNull();
    expect(findRegion(index, NaN, 1)).toBeNull();
  });

  it('여러 조각으로 된 지역과 반복된 세계 지도의 경도를 처리한다', () => {
    expect(findRegion(index, 1, 21)?.SIG_CD).toBe('two');
    expect(findRegion(index, 1, 31)?.SIG_CD).toBe('two');
    expect(findRegion(index, 1, 381)?.SIG_CD).toBe('two');
  });

  it('실제 원본 GeoJSON에서 동대문구 중심을 식별한다', () => {
    const data = JSON.parse(readFileSync(new URL('../data/sig.geojson', import.meta.url), 'utf8')) as FeatureCollection<Polygon | MultiPolygon, RegionProperties>;
    const realIndex = createRegionIndex(data);
    expect(realIndex).toHaveLength(250);
    expect(findRegion(realIndex, 37.58, 127.05)).toMatchObject({ SIG_CD: '11230', SIG_KOR_NM: '동대문구', SIDO_NM: '서울특별시' });
    expect(findRegion(realIndex, 0, 0)).toBeNull();
  });
});
