import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import geojsonUrl from '../../data/sig.geojson?url';
import { createRegionIndex, findRegion, type RegionIndex, type RegionProperties } from '../../utils/findRegion';

export type RegionStatus =
  | { state: 'loading' }
  | { state: 'matched'; region: RegionProperties }
  | { state: 'outside' }
  | { state: 'error' };

export function MapCenterRegion({ onChange }: { onChange: (value: RegionStatus) => void }) {
  const map = useMap();

  useEffect(() => {
    const abort = new AbortController();
    let index: RegionIndex | null = null;
    let previousCode: string | null | undefined;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!index) return;
      const { lat, lng } = map.getCenter();
      const match = findRegion(index, lat, lng);
      const code = match?.SIG_CD ?? null;
      if (code === previousCode) return;
      previousCode = code;
      onChange(match ? { state: 'matched', region: match } : { state: 'outside' });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    map.on('move', schedule);

    fetch(geojsonUrl, { signal: abort.signal })
      .then(response => {
        if (!response.ok) throw new Error(`GeoJSON HTTP ${response.status}`);
        return response.json() as Promise<FeatureCollection<Polygon | MultiPolygon, RegionProperties>>;
      })
      .then(data => {
        if (abort.signal.aborted) return;
        index = createRegionIndex(data);
        if (!index.length) throw new Error('GeoJSON에 유효한 지역이 없습니다.');
        schedule();
      })
      .catch(() => { if (!abort.signal.aborted) onChange({ state: 'error' }); });

    return () => {
      abort.abort();
      if (frame) cancelAnimationFrame(frame);
      map.off('move', schedule);
    };
  }, [map, onChange]);

  return null;
}
