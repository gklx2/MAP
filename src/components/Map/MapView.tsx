import { useEffect, useRef, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import type { TileLayer as LeafletTileLayer } from 'leaflet';
import { Crosshair, MapPin, RefreshCw, TriangleAlert } from 'lucide-react';
import type { Place } from '../../types/place';
import { region } from '../../config/region';
import { PlaceMarker } from './PlaceMarker';

function MapController({ selected, resetKey }: { selected?: Place; resetKey: number }) {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  useEffect(() => {
    if (selected) map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 16), { animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches });
  }, [map, selected]);
  useEffect(() => { map.fitBounds(region.bounds, { padding: [24, 24] }); }, [map, resetKey]);
  return null;
}

function Tiles() {
  const [error, setError] = useState(false);
  const tileRef = useRef<LeafletTileLayer>(null);
  const failed = useRef(new Set<string>());
  return <>
    <TileLayer ref={tileRef} url={region.tileUrl} attribution={region.tileAttribution} maxZoom={19}
      eventHandlers={{
        tileerror: event => { failed.current.add(event.tile.src); setError(true); },
        tileload: event => { failed.current.delete(event.tile.src); if (failed.current.size === 0) setError(false); },
      }} />
    {error && <div className="tile-error" role="status"><TriangleAlert size={18} aria-hidden="true" />
      <div>지도를 불러오지 못했습니다.<small>인터넷 연결을 확인하고 다시 시도해주세요.</small></div>
      <button type="button" className="icon-button" aria-label="지도 다시 불러오기" onClick={() => {
        failed.current.clear(); setError(false); tileRef.current?.redraw();
      }}><RefreshCw size={18} /></button>
    </div>}
  </>;
}

export function MapView({ places, selectedId, onSelect, onDetail }: {
  places: Place[]; selectedId: string | null; onSelect: (id: string) => void; onDetail: (id: string) => void;
}) {
  const [resetKey, setResetKey] = useState(0);
  const selected = places.find(place => place.id === selectedId);
  return <section className="map-region" aria-label="동대문구 공간 지도">
    <MapContainer bounds={region.bounds} boundsOptions={{ padding: [24, 24] }} minZoom={11} zoomControl={false} className="map-canvas">
      <Tiles /><ZoomControl position="bottomright" zoomInTitle="지도 확대" zoomOutTitle="지도 축소" />
      <MapController selected={selected} resetKey={resetKey} />
      <GeoJSON data={region.boundary} interactive={false}
        style={{ color: '#26251e', weight: 1.5, opacity: 1, dashArray: '7 5', fillColor: '#c08532', fillOpacity: 0.08 }} />
      {places.map(place => <PlaceMarker key={place.id} place={place} selected={place.id === selectedId} onSelect={onSelect} onDetail={onDetail} />)}
    </MapContainer>
    <div className="map-location"><MapPin size={16} aria-hidden="true" /><span>서울특별시 <strong>동대문구</strong></span><span className="location-dot" /></div>
    <button className="map-reset" type="button" onClick={() => setResetKey(key => key + 1)}><Crosshair size={17} aria-hidden="true" />동대문구 전체 보기</button>
    <div className="map-caption"><span className="legend-dot" />등록 공간 {places.length}개</div>
  </section>;
}
