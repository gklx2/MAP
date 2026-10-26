import { Search, X } from 'lucide-react';

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="search-box">
    <Search size={20} aria-hidden="true" />
    <label className="sr-only" htmlFor="place-search">공간 이름, 주소, 설명, 유형 검색</label>
    <input id="place-search" type="search" placeholder="어떤 공간을 찾으세요?" value={value}
      onChange={event => onChange(event.target.value)} autoComplete="off" />
    {value && <button type="button" className="icon-button" aria-label="검색어 지우기" onClick={() => onChange('')}><X size={17} /></button>}
  </div>;
}
