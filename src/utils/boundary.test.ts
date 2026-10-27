import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import boundary from '../data/dongdaemun.boundary.json';

describe('동대문구 행정경계', () => {
  it('원본 GeoJSON에서 SIG_CD 11230인 도형만 정확히 추출한다', () => {
    const source = JSON.parse(readFileSync(new URL('../data/sig.geojson', import.meta.url), 'utf8')) as FeatureCollection<Polygon, { SIG_CD: string }>;
    const matches = source.features.filter(feature => feature.properties.SIG_CD === '11230');
    expect(matches).toHaveLength(1);
    expect(boundary).toEqual(matches[0]);
    expect(boundary.properties.SIG_KOR_NM).toBe('동대문구');
  });

  it('경도·위도 좌표가 동대문구 초기 지도 범위에 포함되고 도형이 닫혀 있다', () => {
    const feature = boundary as Feature<Polygon>;
    for (const ring of feature.geometry.coordinates) {
      expect(ring.length).toBeGreaterThanOrEqual(4);
      expect(ring[0]).toEqual(ring[ring.length - 1]);
      for (const [longitude, latitude] of ring) {
        expect(longitude).toBeGreaterThanOrEqual(127.023);
        expect(longitude).toBeLessThanOrEqual(127.081);
        expect(latitude).toBeGreaterThanOrEqual(37.559);
        expect(latitude).toBeLessThanOrEqual(37.613);
      }
    }
  });
});
