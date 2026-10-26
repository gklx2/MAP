import { useCallback, useEffect, useState } from 'react';
import { parseSearchParams, serializeSearchState } from '../utils/searchParams';
import type { SearchState } from '../types/filters';

export function useSearchState() {
  const [state, setState] = useState(() => parseSearchParams(new URLSearchParams(window.location.search)));
  useEffect(() => {
    const restore = () => setState(parseSearchParams(new URLSearchParams(window.location.search)));
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  const update = useCallback((next: SearchState, mode: 'replace' | 'push' = 'push') => {
    const url = new URL(window.location.href);
    url.search = serializeSearchState(next, url.searchParams).toString();
    if (url.href !== window.location.href) {
      if (mode === 'replace') window.history.replaceState(null, '', url);
      else window.history.pushState(null, '', url);
    }
    setState(next);
  }, []);
  return [state, update] as const;
}
