import { useEffect, useRef, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import { Popup as LeafletPopup, type Map as LeafletMap, type TileLayer as LeafletTileLayer } from 'leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Crosshair, Layers, MapPin, RefreshCw, TriangleAlert } from 'lucide-react';
import type { Place } from '../../types/place';
import { region } from '../../config/region';
import { PlaceMarker } from './PlaceMarker';
import { MapCenterRegion, type RegionStatus } from './MapCenterRegion';

setWorkerUrl(workerUrl);

const mapStyles = {
  bright: { label: 'Bright', url: 'https://tiles.openfreemap.org/styles/bright' },
  liberty: { label: 'Liberty', url: 'https://tiles.openfreemap.org/styles/liberty' },
  positron: { label: 'Positron', url: 'https://tiles.openfreemap.org/styles/positron' },
  osm: { label: 'Basic', url: '' },
} as const;
type MapStyle = keyof typeof mapStyles;

const vectorAttribution = '<a href="https://openfreemap.org/">OpenFreeMap</a> | &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://github.com/hyperknot/openfreemap/blob/main/LICENSE.md">지도 라이선스</a>';

function focusPlace(map: LeafletMap, selected: Place) {
    const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const position: [number, number] = [selected.latitude, selected.longitude];
    const zoom = Math.max(map.getZoom(), 16);
    const verticalOffset = window.matchMedia('(max-width: 767px)').matches ? 12 : 24;
    let popup: LeafletPopup | undefined;
    map.eachLayer(layer => {
      if (layer instanceof LeafletPopup && layer.isOpen() && layer.getLatLng()?.equals(position)) popup = layer;
    });
    let center = map.project(position, zoom);
    if (popup) {
      // Measure the full popup at the destination zoom before calculating its position.
      map.getContainer().classList.remove('map-zoomed-out');
      popup.update();
      const element = popup.getElement();
      if (element) {
        const bounds = element.getBoundingClientRect();
        const mapBounds = map.getContainer().getBoundingClientRect();
        const marker = map.latLngToContainerPoint(position);
        const x = bounds.left + bounds.width / 2 - mapBounds.left - marker.x;
        const y = bounds.top + bounds.height / 2 - mapBounds.top - marker.y + verticalOffset;
        center = center.add([x, y]);
      }
    }
    let frame = 0;
    const alignPopup = () => {
      frame = requestAnimationFrame(() => {
        if (!popup?.isOpen()) {
          map.eachLayer(layer => {
            if (layer instanceof LeafletPopup && layer.isOpen() && layer.getLatLng()?.equals(position)) popup = layer;
          });
        }
        if (!popup?.isOpen()) return;
        popup.update();
        const element = popup.getElement();
        if (!element) return;
        const bounds = element.getBoundingClientRect();
        const mapBounds = map.getContainer().getBoundingClientRect();
        const dx = bounds.left + bounds.width / 2 - (mapBounds.left + mapBounds.width / 2);
        const dy = bounds.top + bounds.height / 2 - (mapBounds.top + mapBounds.height / 2) + verticalOffset;
        // Correct after zoom and popup layout, when the final rendered height is known.
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) map.panBy([dx, dy], { animate: false });
      });
    };
    map.once('moveend', alignPopup);
    map.flyTo(map.unproject(center, zoom), zoom, { animate });
    return () => { map.off('moveend', alignPopup); cancelAnimationFrame(frame); };
}

function MapController({ selected, navigation, places, resetKey }: { selected?: Place; navigation: { id: string } | null; places: Place[]; resetKey: number }) {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  useEffect(() => {
    if (selected) return focusPlace(map, selected);
  }, [map, selected]);
  useEffect(() => {
    if (!navigation) return;
    const place = places.find(item => item.id === navigation.id);
    if (!place) return;
    // Wait for the marker popup to open so its height can be included in centering.
    let cancelFocus: (() => void) | undefined;
    const frame = requestAnimationFrame(() => { cancelFocus = focusPlace(map, place); });
    return () => { cancelAnimationFrame(frame); cancelFocus?.(); };
  }, [map, navigation, places]);
  useEffect(() => { map.fitBounds(region.bounds, { padding: [24, 24] }); }, [map, resetKey]);
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 767px)');
    const updatePopupSize = () => {
      map.getContainer().classList.toggle('map-zoomed-out', map.getZoom() <= (mobile.matches ? 15 : 14));
      map.eachLayer(layer => { if (layer instanceof LeafletPopup) layer.update(); });
    };
    updatePopupSize();
    map.on('zoomend', updatePopupSize);
    mobile.addEventListener('change', updatePopupSize);
    return () => { map.off('zoomend', updatePopupSize); mobile.removeEventListener('change', updatePopupSize); map.getContainer().classList.remove('map-zoomed-out'); };
  }, [map]);
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

function VectorTiles({ style }: { style: Exclude<MapStyle, 'osm'> }) {
  const map = useMap();
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setError(false);
    let layer: ReturnType<typeof maplibreGL> | undefined;
    try {
      layer = maplibreGL({ style: mapStyles[style].url, attributionControl: false });
      layer.addTo(map);
      const vectorMap = layer.getMaplibreMap();
      const onError = () => setError(true);
      const onIdle = () => { if (vectorMap.isStyleLoaded() && vectorMap.areTilesLoaded()) setError(false); };
      vectorMap.on('error', onError);
      vectorMap.on('idle', onIdle);
      map.attributionControl.addAttribution(vectorAttribution);
      return () => {
        vectorMap.off('error', onError);
        vectorMap.off('idle', onIdle);
        map.attributionControl.removeAttribution(vectorAttribution);
        layer?.remove();
      };
    } catch {
      // A failed WebGL initialization can leave the Leaflet layer partially added.
      try { layer?.remove(); } catch { /* The map is still usable with the existing tiles. */ }
      setError(true);
    }
  }, [map, style, retry]);

  return error && <div className="tile-error" role="status"><TriangleAlert size={18} aria-hidden="true" />
    <div>지도를 불러오지 못했습니다.<small>인터넷 연결을 확인하거나 기존 지도를 선택해주세요.</small></div>
    <button type="button" className="icon-button" aria-label="지도 다시 불러오기" onClick={() => setRetry(value => value + 1)}><RefreshCw size={18} /></button>
  </div>;
}

export function MapView({ places, selectedId, navigation, onSelect, onClose, onDetail }: {
  places: Place[]; selectedId: string | null; navigation: { id: string } | null; onSelect: (id: string) => void; onClose: (id: string) => void; onDetail: (id: string) => void;
}) {
  const [resetKey, setResetKey] = useState(0);
  const [mapStyle, setMapStyle] = useState<MapStyle>('bright');
  const [currentRegion, setCurrentRegion] = useState<RegionStatus>({ state: 'loading' });
  const selected = places.find(place => place.id === selectedId);
  const locationLabel = currentRegion.state === 'matched'
    ? `${currentRegion.region.SIDO_NM} ${currentRegion.region.SIG_KOR_NM}`
    : currentRegion.state === 'loading' ? '지역 확인 중' : currentRegion.state === 'outside' ? '지역 정보 없음' : '지역 정보 불러오기 실패';
  return <section className="map-region" aria-label="동대문구 공간 지도">
    <MapContainer bounds={region.bounds} boundsOptions={{ padding: [24, 24] }} minZoom={11} zoomControl={false} className="map-canvas">
      {mapStyle === 'osm' ? <Tiles /> : <VectorTiles style={mapStyle} />}
      <ZoomControl position="bottomright" zoomInTitle="지도 확대" zoomOutTitle="지도 축소" />
      <MapController selected={selected} navigation={navigation} places={places} resetKey={resetKey} />
      <MapCenterRegion onChange={setCurrentRegion} />
      <GeoJSON data={region.boundary} interactive={false}
        style={{ color: '#26251e', weight: 1.5, opacity: 1, dashArray: '7 5', fillColor: '#c08532', fillOpacity: 0.08 }} />
      {places.map(place => <PlaceMarker key={place.id} place={place} selected={place.id === (selectedId ?? navigation?.id)} navigation={navigation} onSelect={onSelect} onClose={onClose} onDetail={onDetail} />)}
    </MapContainer>
    <div className="map-location" aria-label={`지도 중심: ${locationLabel}`} aria-live="polite" title={`지도 중심: ${locationLabel}`}>
      <MapPin size={16} aria-hidden="true" />
      <span>{currentRegion.state === 'matched' ? <>{currentRegion.region.SIDO_NM} <strong>{currentRegion.region.SIG_KOR_NM}</strong></> : locationLabel}</span>
    </div>
    <button className="map-reset" type="button" onClick={() => setResetKey(key => key + 1)}><Crosshair size={17} aria-hidden="true" />동대문구 전체 보기</button>
    <label className="map-style-select"><Layers size={16} aria-hidden="true" /><span>지도 스타일</span>
      <select aria-label="지도 스타일 선택" value={mapStyle} onChange={event => setMapStyle(event.target.value as MapStyle)}>
        {Object.entries(mapStyles).map(([value, option]) => <option key={value} value={value}>{option.label}</option>)}
      </select>
    </label>
    <div className="map-caption"><span className="legend-dot" />등록 공간 {places.length}개</div>
  </section>;
}
