import type { LatLngBoundsExpression } from 'leaflet';
import type { Feature, Polygon } from 'geojson';
import dongdaemunBoundary from '../data/dongdaemun.boundary.json';

export const region = {
  name: '동대문구',
  // 동대문구 통계연보의 극점(남 37°33′36″, 북 37°36′27″,
  // 서 127°01′23″, 동 127°04′41″)을 포함하는 시작 범위입니다.
  // https://www.ddm.go.kr/upload/info/z2020statistics.pdf (인쇄면 56)
  // 지도 시작 범위이며 행정경계 선을 의미하지 않습니다.
  bounds: [[37.559, 127.023], [37.613, 127.081]] as LatLngBoundsExpression,
  navigationBounds: [[37.52, 126.97], [37.65, 127.14]] as LatLngBoundsExpression,
  // sig.geojson에서 SIG_CD가 11230인 동대문구 행정경계를 추출했습니다.
  boundary: dongdaemunBoundary as Feature<Polygon>,
  tileUrl: import.meta.env.VITE_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: import.meta.env.VITE_TILE_ATTRIBUTION
    || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
