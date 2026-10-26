import { MapPinned } from 'lucide-react';
import { useId } from 'react';
import type { Place } from '../../types/place';
import { PlaceCard } from './PlaceCard';

export function PlaceList({ places, total, selectedId, onSelect, onReset, idPrefix = 'desktop' }: {
  places: Place[]; total: number; selectedId: string | null; onSelect: (id: string) => void; onReset: () => void; idPrefix?: string;
}) {
  const titleId = useId();
  return <section className="results" aria-labelledby={titleId}>
    <div className="section-heading"><h2 id={titleId}>찾은 공간 <span className="result-count">{places.length}</span></h2>
      <span className="muted">동대문구</span></div>
    <p className="sr-only" role="status">검색 결과 {places.length}개</p>
    {places.length > 0 ? <div className="place-list">{places.map(place => <PlaceCard key={place.id} place={place}
      selected={place.id === selectedId} onSelect={onSelect} idPrefix={idPrefix} />)}</div>
      : <div className="empty-state"><div className="empty-icon"><MapPinned size={28} strokeWidth={1.5} aria-hidden="true" /></div>
        <h3>{total === 0 ? '아직 등록된 공간이 없습니다.' : '조건에 맞는 공간이 없습니다.'}</h3>
        <p>{total === 0 ? '동대문구의 무료·공공 공간을 조사하여 순차적으로 추가할 예정입니다.' : '일부 검색 조건을 해제해보세요.'}</p>
        {total > 0 && <button className="secondary-button" onClick={onReset} type="button">검색 조건 초기화</button>}
        {total === 0 && <span className="research-label"><span />공간을 조사하고 있어요</span>}
      </div>}
  </section>;
}
