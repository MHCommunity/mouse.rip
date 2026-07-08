'use client';

import React, { useEffect, useState } from 'react';

export type Loadable<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'empty' }
  | { status: 'error' };

/**
 * Fetches a JSON endpoint once and tracks its lifecycle. Pass null to skip
 * fetching entirely (the state stays 'empty').
 */
export function useEndpoint<T>(url: string | null, isEmpty: (data: T) => boolean): Loadable<T> {
  const [state, setState] = useState<Loadable<T>>(url ? { status: 'loading' } : { status: 'empty' });

  useEffect(() => {
    if (!url) return;
    let active = true;
    fetch(url)
      .then((res) => res.json() as Promise<T>)
      .then((data) => {
        if (!active) return;
        setState(isEmpty(data) ? { status: 'empty' } : { status: 'ready', data });
      })
      .catch(() => active && setState({ status: 'error' }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return state;
}

export const sectionTitle =
  'text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500';

export function SkeletonRows() {
  return (
    <div className="mt-4 space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      ))}
    </div>
  );
}
