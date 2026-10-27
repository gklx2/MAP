import type { FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';

export interface RegionProperties {
  SIG_CD: string;
  SIG_KOR_NM: string;
  SIDO_NM: string;
}

type BoundaryGeometry = Polygon | MultiPolygon;
type Ring = Position[];
type RegionPolygon = { rings: Ring[]; bounds: [number, number, number, number] };
export type RegionIndex = { properties: RegionProperties; polygons: RegionPolygon[] }[];

// GeoJSON 좌표는 [경도, 위도] 순서입니다.
export function createRegionIndex(data: FeatureCollection<BoundaryGeometry, RegionProperties>): RegionIndex {
  return data.features.flatMap(feature => {
    if (!feature.geometry || !feature.properties) return [];
    const shapes = feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [];
    const polygons = shapes.flatMap(rings => {
      const outer = rings[0];
      if (!outer || outer.length < 4) return [];
      let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
      for (const [longitude, latitude] of outer) {
        west = Math.min(west, longitude); south = Math.min(south, latitude);
        east = Math.max(east, longitude); north = Math.max(north, latitude);
      }
      return [{ rings, bounds: [west, south, east, north] as [number, number, number, number] }];
    });
    return polygons.length ? [{ properties: feature.properties, polygons }] : [];
  });
}

// -1: 바깥, 0: 경계선, 1: 내부. 다각형의 꼭짓점과 수평 경계도 처리합니다.
function ringRelation(longitude: number, latitude: number, ring: Ring): -1 | 0 | 1 {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x1, y1] = ring[j], [x2, y2] = ring[i];
    const cross = (longitude - x1) * (y2 - y1) - (latitude - y1) * (x2 - x1);
    if (Math.abs(cross) < 1e-12
      && longitude >= Math.min(x1, x2) - 1e-10 && longitude <= Math.max(x1, x2) + 1e-10
      && latitude >= Math.min(y1, y2) - 1e-10 && latitude <= Math.max(y1, y2) + 1e-10) return 0;
    if ((y1 > latitude) !== (y2 > latitude)
      && longitude < (x2 - x1) * (latitude - y1) / (y2 - y1) + x1) inside = !inside;
  }
  return inside ? 1 : -1;
}

function containsPoint(longitude: number, latitude: number, polygon: RegionPolygon): boolean {
  const [west, south, east, north] = polygon.bounds;
  if (longitude < west || longitude > east || latitude < south || latitude > north) return false;
  const exterior = ringRelation(longitude, latitude, polygon.rings[0]);
  if (exterior < 0) return false;
  if (exterior === 0) return true;
  for (const hole of polygon.rings.slice(1)) {
    const relation = ringRelation(longitude, latitude, hole);
    if (relation === 0) return true;
    if (relation === 1) return false;
  }
  return true;
}

export function findRegion(index: RegionIndex, latitude: number, longitude: number): RegionProperties | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  // Leaflet은 세계 지도를 가로로 반복하므로 동일 위치의 경도를 정규화합니다.
  const normalizedLongitude = ((longitude + 180) % 360 + 360) % 360 - 180;
  return index.find(region => region.polygons.some(polygon => containsPoint(normalizedLongitude, latitude, polygon)))?.properties ?? null;
}
