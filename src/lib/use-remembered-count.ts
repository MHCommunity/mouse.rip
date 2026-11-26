'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const KEY = 'mouse.rip:list-depth';

/** How long after a Back or Forward a list that mounts is taken to be the page being returned to. */
const RETURN_WINDOW_MS = 3000;

// Set when the visitor goes Back or Forward. A list only puts its scroll position back on that kind of arrival:
// following a link to the same list should start at the top.
let returnedAt = 0;
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    returnedAt = Date.now();
  });
}

interface Saved {
  scope: string;
  count: number;
  /** How far down the page was scrolled when the list was last left. */
  scrollY: number;
}

function read(scope: string): Saved | undefined {
  try {
    const saved: unknown = JSON.parse(window.sessionStorage.getItem(KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return undefined;
    const { scope: savedScope, count, scrollY } = saved as Record<string, unknown>;
    if (savedScope !== scope || typeof count !== 'number' || count <= 0) return undefined;
    return { scope, count, scrollY: typeof scrollY === 'number' ? scrollY : 0 };
  } catch {
    // Storage is blocked, or holds something else; start from the first page of rows.
    return undefined;
  }
}

function write(saved: Saved) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // Blocked storage only means Back lands on a shorter list.
  }
}

/**
 * How far a "show more" list has been opened, remembered for the tab. Open a mouse from row 350 of a list and
 * press Back, and the list is as long as it was and scrolled to where it was, not back at the top of the first
 * hundred rows.
 *
 * The scroll position is put back here too. The browser restores it by itself on Back, but it does so while the
 * page being left is still on screen, and when that page is shorter the position is cut off at its end.
 *
 * `scope` names the list and what it's filtered to, so a different filter starts short again; null keeps
 * nothing (the prerendered copy of a list). Only the latest list is kept.
 *
 * Only for components the browser renders itself, such as those behind a useSearchParams boundary: the first
 * render reads storage, which a component hydrated from server HTML must not do.
 */
export function useRememberedCount(scope: string | null, initial: number): [number, (count: number) => void] {
  const [count, setCount] = useState(() => (scope ? read(scope)?.count : undefined) ?? initial);

  // The latest values, for the save made as the list is left.
  const latest = useRef({ scope, count });
  useEffect(() => {
    latest.current = { scope, count };
  }, [scope, count]);

  useLayoutEffect(() => {
    if (!scope) return;
    const saved = read(scope);
    if (saved && saved.scrollY > 0 && Date.now() - returnedAt < RETURN_WINDOW_MS) {
      window.scrollTo({ top: saved.scrollY, behavior: 'instant' });
    }

    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      // Runs as the next page is put on screen, before the router scrolls it to the top.
      window.removeEventListener('scroll', onScroll);
      const { scope: lastScope, count: lastCount } = latest.current;
      if (lastScope) write({ scope: lastScope, count: lastCount, scrollY });
    };
    // Once, as the list arrives and as it leaves; what it saves on the way out comes from `latest`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [count, setCount];
}
