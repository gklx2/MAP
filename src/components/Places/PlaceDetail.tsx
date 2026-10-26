import { ExternalLink, MapPin, Clock, Info } from 'lucide-react';
import type { Place } from '../../types/place';
import { booleanLabel, categoryLabels, purposeLabels } from '../../config/labels';
import { safeUrl } from '../../utils/safeUrl';
import { Modal } from '../Layout/Modal';

export function PlaceDetail({ place, onClose }: { place: Place; onClose: () => void }) {
  const sourceUrl = safeUrl(place.sourceUrl);
  const imageUrl = safeUrl(place.imageUrl);
  const facts = [
    ['이용 요금', booleanLabel(place.free, '무료', '유료')],
    ['구매', booleanLabel(place.purchaseRequired, '구매 필요', '구매 필요 없음')],
    ['예약', booleanLabel(place.reservationRequired, '예약 필요', '예약 필요 없음')],
    ['Wi-Fi', booleanLabel(place.wifi)], ['콘센트', booleanLabel(place.outlet)],
    ['화장실', booleanLabel(place.restroom)], ['책상', booleanLabel(place.desk)],
    ['노트북 작업', booleanLabel(place.laptopFriendly, '적합', '적합하지 않음')],
    ['대화', booleanLabel(place.conversationAllowed, '가능', '불가')],
    ['실내', booleanLabel(place.indoor)], ['야외', booleanLabel(place.outdoor)],
    ['휠체어 접근', booleanLabel(place.wheelchairAccessible, '가능', '불가')],
    ['음식 반입', booleanLabel(place.foodAllowed, '가능', '불가')],
  ];
  return <Modal title={place.name} onClose={onClose} className="detail-sheet">
    <div className="detail-content"><span className="eyebrow">{categoryLabels[place.category]}</span>
      {imageUrl && <img className="detail-image" src={imageUrl} alt={`${place.name} 공간 모습`} loading="lazy" onError={event => { event.currentTarget.hidden = true; }} />}
      <p className="detail-line"><MapPin size={18} aria-hidden="true" />{place.address}</p>
      <p className="detail-line"><Clock size={18} aria-hidden="true" />{place.openingHours || '운영시간 미확인'}</p>
      <p className="description">{place.description || '등록된 공간 설명이 없습니다.'}</p>
      <h3>이용 정보</h3><dl className="fact-grid">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <h3>추천 이용 목적</h3><div className="tags">{place.purposes.length ? place.purposes.map(purpose => <span className="tag" key={purpose}>{purposeLabels[purpose]}</span>) : <span className="muted">미확인</span>}</div>
      <div className="source-box"><h3><Info size={16} aria-hidden="true" /> 정보 출처</h3><p>{place.source || '미등록'}</p>
        <p>마지막 확인: {place.lastVerified || '미등록'}</p>
        {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer">공식 링크 <ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> 새 탭에서 열기</span></a>}
      </div>
    </div>
  </Modal>;
}
