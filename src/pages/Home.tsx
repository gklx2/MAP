import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Leaf, MapPin, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { places } from '../data/places';
import { searchPlaces } from '../utils/searchPlaces';
import { filterPlaces } from '../utils/filterPlaces';
import { booleanFilterKeys, emptySearchState, type PlaceFilters } from '../types/filters';
import { useSearchState } from '../hooks/useSearchState';
import { categoryLabels, purposeLabels, facilityOptions, conditionOptions } from '../config/labels';
import { SearchBar } from '../components/Search/SearchBar';
import { FilterPanel } from '../components/Filters/FilterPanel';
import { PlaceList } from '../components/Places/PlaceList';
import { PlaceDetail } from '../components/Places/PlaceDetail';
import { MapView } from '../components/Map/MapView';

export function Home() {
  const [state, update] = useSearchState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<{ id: string } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [sidebarOpen, setSidebarOpen] = useState(() => !window.matchMedia('(max-width: 767px)').matches);
  const sidebarRef = useRef<HTMLElement>(null);
  const closeSidebarRef = useRef<HTMLButtonElement>(null);
  const results = useMemo(() => filterPlaces(searchPlaces(places, state.query), state.filters), [state]);
  const selected = results.find(place => place.id === selectedId);
  const detail = results.find(place => place.id === detailId);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const onChange = (event: MediaQueryListEvent) => { setIsMobile(event.matches); setSidebarOpen(!event.matches); };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeSidebarRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) return;
      if (event.key === 'Escape') { event.preventDefault(); setSidebarOpen(false); return; }
      if (event.key !== 'Tab') return;
      const focusable = [...(sidebarRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [])].filter(element => element.getClientRects().length > 0);
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus(); };
  }, [isMobile, sidebarOpen]);

  const changeFilters = (filters: PlaceFilters) => { update({ ...state, filters }); setSelectedId(null); setNavigation(null); setDetailId(null); };
  const reset = () => { update(emptySearchState()); setSelectedId(null); setNavigation(null); setDetailId(null); };
  const showDetail = (id: string) => { setSelectedId(id); if (isMobile) setSidebarOpen(false); setDetailId(id); };
  const locatePlace = (id: string) => {
    setSelectedId(null);
    setDetailId(null);
    setNavigation({ id });
    if (isMobile) setSidebarOpen(false);
  };
  const selectMarker = (id: string) => {
    setNavigation(null);
    setSelectedId(id);
    document.getElementById(`desktop-place-${encodeURIComponent(id)}`)?.scrollIntoView({ block: 'nearest' });
  };
  const list = <PlaceList places={results} total={places.length} selectedId={selected?.id ?? navigation?.id ?? null} onSelect={locatePlace} onReset={reset} />;
  const filters = <FilterPanel filters={state.filters} onChange={changeFilters} onReset={reset} />;
  const chips = [
    ...state.filters.purposes.map(value => ({ key: `purpose-${value}`, label: purposeLabels[value], remove: () => changeFilters({ ...state.filters, purposes: state.filters.purposes.filter(item => item !== value) }) })),
    ...state.filters.categories.map(value => ({ key: `category-${value}`, label: categoryLabels[value], remove: () => changeFilters({ ...state.filters, categories: state.filters.categories.filter(item => item !== value) }) })),
    ...booleanFilterKeys.filter(key => state.filters[key] !== undefined).map(key => {
      const option = [...facilityOptions, ...conditionOptions].find(item => item.key === key);
      const fallback = key === 'conversationAllowed' ? '대화 가능' : '노트북 작업 적합';
      const oppositeLabels: Partial<Record<typeof key, string>> = {
        wifi: 'Wi-Fi 없음', outlet: '콘센트 없음', restroom: '화장실 없음', desk: '책상 없음',
        wheelchairAccessible: '휠체어 접근 불가', free: '유료', purchaseRequired: '구매 필요',
        reservationRequired: '예약 필요', indoor: '실내 아님', outdoor: '야외 아님',
      };
      const label = option ? (state.filters[key] === option.value ? option.label : oppositeLabels[key]!) : `${fallback} ${state.filters[key] ? '예' : '아니오'}`;
      return { key, label, remove: () => changeFilters({ ...state.filters, [key]: undefined }) };
    }),
  ];

  return <div className="app-shell">
    <a className="skip-link" href="#place-search" onClick={event => {
      event.preventDefault(); setSidebarOpen(true);
      requestAnimationFrame(() => document.getElementById('place-search')?.focus());
    }}>검색으로 바로가기</a>
    <header className="site-header"><div className="brand"><span className="brand-symbol"><MapPin size={25} strokeWidth={1.7} aria-hidden="true" /></span>
      <div><div className="brand-kicker">우리 동네, 머물 곳</div><h1>동대문구 무료 공간 지도</h1></div></div>
      <div className="header-note"><Leaf size={17} aria-hidden="true" /><span>소비 없이, 함께 쓰는 공간</span><span className="header-divider" /><span className="status-pill">1차 조사 자료</span></div>
    </header>
    <main className="workspace">
    {isMobile && sidebarOpen && <div className="sidebar-backdrop" aria-hidden="true" onClick={() => setSidebarOpen(false)} />}
    <aside ref={sidebarRef} id="search-sidebar" className="sidebar" aria-label="공간 검색과 목록"
      role={isMobile ? 'dialog' : undefined} aria-modal={isMobile && sidebarOpen ? true : undefined} hidden={!sidebarOpen}>
      <div className="sidebar-mobile-header"><h2>공간 검색</h2>
        <button ref={closeSidebarRef} type="button" className="icon-button" aria-label="메뉴 닫기" onClick={() => setSidebarOpen(false)}><X size={22} aria-hidden="true" /></button>
      </div>
      <div className="sidebar-intro"><span className="eyebrow">일상에 쉼표가 필요할 때</span><h2>돈을 쓰지 않아도,<br />머물 수 있는 곳.</h2>
        <p>돈을 쓰지 않아도 머물 수 있는 동대문구의 공간을 찾아보세요.</p>
        <SearchBar value={state.query} onChange={query => { update({ ...state, query }, 'replace'); setSelectedId(null); setNavigation(null); setDetailId(null); }} />
      </div>
      <div className="desktop-panel">{filters}{list}
        <footer className="sidebar-footer"><span>발견되지 않은 공간을, 일상 가까이.</span><a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener noreferrer">배경지도 오류 제보<ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> 새 탭에서 열기</span></a></footer>
      </div>
    </aside>
    <div className="map-column">
      <button type="button" className="sidebar-handle" aria-controls="search-sidebar" aria-expanded={sidebarOpen} aria-label={sidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
        onClick={() => setSidebarOpen(open => !open)}>
        {sidebarOpen ? <PanelLeftClose size={18} aria-hidden="true" /> : <PanelLeftOpen size={18} aria-hidden="true" />}
      </button>
      <div className="map-toolbar"><div><span className="live-dot" /><strong>동대문구 둘러보기</strong><span className="toolbar-hint">잠시 머물 공간을 찾아보세요</span></div><span className="result-summary" role="status">검색 결과 <strong>{results.length}</strong>개</span></div>
      {chips.length > 0 && <div className="active-filters" aria-label="선택한 필터">{chips.map(chip => <button type="button" key={chip.key} onClick={chip.remove} aria-label={`${chip.label} 조건 해제`}>{chip.label}<X size={12} aria-hidden="true" /></button>)}<button type="button" className="clear-all" onClick={reset}>전체 초기화</button></div>}
      <MapView places={results} selectedId={selected?.id ?? null} navigation={navigation} onSelect={selectMarker}
        onClose={id => { setSelectedId(current => current === id ? null : current); setNavigation(current => current?.id === id ? null : current); }} onDetail={showDetail} />
      <footer className="map-source" aria-label="행정경계 데이터 출처">
        <span>행정경계 출처:</span>
        <a href="https://www.kgeop.go.kr/" target="_blank" rel="noopener noreferrer">국가공간정보포털<span className="sr-only"> 새 탭에서 열기</span></a>
        <span aria-hidden="true">·</span>
        <a href="https://www.data.go.kr/" target="_blank" rel="noopener noreferrer">공공데이터포털<span className="sr-only"> 새 탭에서 열기</span></a>
        <span aria-hidden="true">·</span>
        <a href="https://github.com/KnellBalm/kr-admin-geojson" target="_blank" rel="noopener noreferrer">가공: kr-admin-geojson<span className="sr-only"> 새 탭에서 열기</span></a>
      </footer>
    </div></main>
    {detail && <PlaceDetail place={detail} onClose={() => setDetailId(null)} />}
  </div>;
}
