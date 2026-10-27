import { useEffect, useRef } from 'react';
import { divIcon, type Marker as LeafletMarker } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { Place } from '../../types/place';
import { booleanLabel, categoryLabels, purposeLabels } from '../../config/labels';

const makeIcon = (selected: boolean) => divIcon({
  className: `place-marker ${selected ? 'is-selected' : ''}`,
  html: '<span aria-hidden="true"></span>', iconSize: [30, 36], iconAnchor: [15, 36], popupAnchor: [0, -34],
});
const defaultIcon = makeIcon(false);
const selectedIcon = makeIcon(true);

export function PlaceMarker({ place, selected, navigation, onSelect, onClose, onDetail }: {
  place: Place; selected: boolean; navigation: { id: string } | null; onSelect: (id: string) => void; onClose: (id: string) => void; onDetail: (id: string) => void;
}) {
  const markerRef = useRef<LeafletMarker>(null);
  useEffect(() => {
    if (navigation?.id === place.id) markerRef.current?.openPopup();
  }, [navigation, place.id]);

  return <Marker ref={markerRef} position={[place.latitude, place.longitude]} icon={selected ? selectedIcon : defaultIcon}
    title={place.name} alt={place.name} eventHandlers={{ click: () => onSelect(place.id), popupclose: () => onClose(place.id) }}>
    <Popup className="place-map-popup" autoPan={false}><div className="place-popup"><span className="eyebrow">{categoryLabels[place.category]}</span><h3>{place.name}</h3>
      <p>{place.address}</p><p>{place.openingHours || '운영시간 미확인'}</p>
      <p>{booleanLabel(place.free, '무료', '유료')} · Wi-Fi {booleanLabel(place.wifi)}<br />콘센트 {booleanLabel(place.outlet)} · 화장실 {booleanLabel(place.restroom)}</p>
      <p>{place.purposes.map(purpose => purposeLabels[purpose]).join(' · ') || '추천 목적 미확인'}</p>
      <button className="primary-button" type="button" onClick={() => onDetail(place.id)}>상세보기</button>
    </div></Popup>
  </Marker>;
}
