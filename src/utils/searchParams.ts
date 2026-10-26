import { categoryLabels, purposeLabels } from '../config/labels';
import { booleanFilterKeys, emptySearchState, type SearchState } from '../types/filters';
import type { Category, Purpose } from '../types/place';

const managedKeys = ['q', 'purpose', 'category', ...booleanFilterKeys];

export function parseSearchParams(params: URLSearchParams): SearchState {
  const state = emptySearchState();
  state.query = params.get('q') ?? '';
  state.filters.purposes = [...new Set(params.getAll('purpose'))]
    .filter((value): value is Purpose => Object.hasOwn(purposeLabels, value));
  state.filters.categories = [...new Set(params.getAll('category'))]
    .filter((value): value is Category => Object.hasOwn(categoryLabels, value));
  for (const key of booleanFilterKeys) {
    const value = params.get(key);
    if (value === 'true' || value === 'false') state.filters[key] = value === 'true';
  }
  return state;
}

export function serializeSearchState(state: SearchState, existing = new URLSearchParams()): URLSearchParams {
  const params = new URLSearchParams(existing);
  managedKeys.forEach(key => params.delete(key));
  if (state.query.trim()) params.set('q', state.query);
  state.filters.purposes.forEach(value => params.append('purpose', value));
  state.filters.categories.forEach(value => params.append('category', value));
  booleanFilterKeys.forEach(key => {
    if (state.filters[key] !== undefined) params.set(key, String(state.filters[key]));
  });
  return params;
}
