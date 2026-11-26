'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

const noSubscribe = () => () => {};

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage is blocked (private browsing, say); start fresh.
    return null;
  }
}

/**
 * State that this device remembers between visits. The saved value arrives after hydration, so the server's render
 * and the first client render agree; `parse` gets whatever JSON is stored and returns undefined to ignore it.
 */
export function useStoredState<T>(
  key: string,
  fallback: T,
  parse: (saved: unknown) => T | undefined,
): [T, (next: T | ((current: T) => T)) => void] {
  const stored = useSyncExternalStore(
    noSubscribe,
    () => read(key),
    () => null,
  );
  const saved = useMemo(() => {
    if (!stored) return undefined;
    try {
      return parse(JSON.parse(stored));
    } catch {
      // Something other than our JSON is stored under the key.
      return undefined;
    }
    // `parse` is a module-level function in every caller; the stored string is what changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stored]);
  const [edited, setEdited] = useState<T | undefined>(undefined);

  useEffect(() => {
    if (edited === undefined) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(edited));
    } catch {
      // Blocked storage only means the next visit starts fresh.
    }
  }, [key, edited]);

  const set = useCallback(
    (next: T | ((current: T) => T)) =>
      setEdited((previous) => {
        const current = previous ?? saved ?? fallback;
        return typeof next === 'function' ? (next as (current: T) => T)(current) : next;
      }),
    // A fallback is a fresh literal each render; only the saved value matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [saved],
  );

  return [edited ?? saved ?? fallback, set];
}
