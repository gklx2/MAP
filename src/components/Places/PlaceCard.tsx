import { MapPin, Plug, Wifi } from 'lucide-react';
import type { Place } from '../../types/place';
import { booleanLabel, categoryLabels, purposeLabels } from '../../config/labels';

export function PlaceCard({ place, selected, onSelect, idPrefix }: { place: Place; selected: boolean; onSelect: (id: string) => void; idPrefix: string }) {
  return <button type="button" id={`${idPrefix}-place-${encodeURIComponent(place.id)}`} className={`place-card ${selected ? 'selected' : ''}`}
    aria-pressed={selected} onClick={() => onSelect(place.id)}>
    <span className="card-meta">{categoryLabels[place.category]}<span className="tag">{place.free ? '무료' : '유료'}</span></span>
    <h3>{place.name}</h3><p className="address"><MapPin size={14} aria-hidden="true" />{place.address}</p>
    <div className="card-facilities"><span><Wifi size={14} aria-hidden="true" /> Wi-Fi {booleanLabel(place.wifi)}</span>
      <span><Plug size={14} aria-hidden="true" /> 콘센트 {booleanLabel(place.outlet)}</span></div>
    <div className="tags">{place.purposes.map(purpose => <span className="tag neutral" key={purpose}>{purposeLabels[purpose]}</span>)}</div>
  </button>;
}
