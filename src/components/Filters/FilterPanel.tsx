import { RotateCcw } from 'lucide-react';
import { categoryLabels, purposeLabels, facilityOptions, conditionOptions } from '../../config/labels';
import { countFilters, type PlaceFilters } from '../../types/filters';

interface Props { filters: PlaceFilters; onChange: (filters: PlaceFilters) => void; onReset: () => void }

function toggle<T>(items: T[], value: T): T[] {
  return items.includes(value) ? items.filter(item => item !== value) : [...items, value];
}

export function FilterPanel({ filters, onChange, onReset }: Props) {
  const count = countFilters(filters);
  const booleanGroup = (legend: string, options: typeof facilityOptions) => <fieldset className="filter-group">
    <legend>{legend}</legend>
    <div className="checkbox-grid">{options.map(({ key, label, value }) => <label className="check-label" key={key}>
      <input type="checkbox" checked={filters[key] === value} onChange={() => onChange({ ...filters, [key]: filters[key] === value ? undefined : value })} />
      <span>{label}</span>
    </label>)}</div>
  </fieldset>;

  return <div className="filters">
    <div className="section-heading"><h2>내게 맞는 공간 찾기 {count > 0 && <span className="count-badge">{count}</span>}</h2>
      <button className="text-button" type="button" onClick={onReset}><RotateCcw size={14} aria-hidden="true" />초기화</button>
    </div>
    <fieldset className="filter-group"><legend>이용 목적 <span>복수 선택</span></legend>
      <div className="purpose-grid">{(Object.entries(purposeLabels)).map(([key, label]) => {
        const value = key as keyof typeof purposeLabels;
        return <label className="purpose-option" key={key}>
          <input type="checkbox" checked={filters.purposes.includes(value)} onChange={() => onChange({ ...filters, purposes: toggle(filters.purposes, value) })} />
          <span>{label}</span>
        </label>;
      })}</div>
    </fieldset>
    <fieldset className="filter-group"><legend>공간 유형</legend>
      <div className="checkbox-grid">{Object.entries(categoryLabels).map(([key, label]) => {
        const value = key as keyof typeof categoryLabels;
        return <label className="check-label" key={key}><input type="checkbox" checked={filters.categories.includes(value)}
          onChange={() => onChange({ ...filters, categories: toggle(filters.categories, value) })} /><span>{label}</span></label>;
      })}</div>
    </fieldset>
    {booleanGroup('시설', facilityOptions)}
    {booleanGroup('이용 조건', conditionOptions)}
    <p className="filter-help">목적·유형은 하나 이상, 시설·조건은 모두 맞는 공간을 찾습니다. 미확인 정보는 조건 충족에 포함하지 않습니다.</p>
  </div>;
}
