'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** A link pointed at again this soon after its page was fetched is left alone. */
const AGAIN_AFTER_MS = 60_000;

/**
 * Fetches a page when a visitor shows they're about to open it: the pointer or a finger lands on its link, or
 * the keyboard focuses it. One listener for the whole document, so a page with a thousand links costs no more
 * than a page with ten. See site-link.tsx for why links don't prefetch on sight.
 */
export function PrefetchOnIntent() {
  const router = useRouter();

  useEffect(() => {
    const fetched = new Map<string, number>();
    const onIntent = (event: Event) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.origin !== window.location.origin || link.target === '_blank' || link.hasAttribute('download')) return;
      const href = link.pathname + link.search;
      // A #link within this page has nothing to fetch.
      if (href === window.location.pathname + window.location.search) return;
      const now = Date.now();
      if (now - (fetched.get(href) ?? 0) < AGAIN_AFTER_MS) return;
      fetched.set(href, now);
      router.prefetch(href);
    };
    // pointerover fires for a mouse moving onto a link and for a finger touching one.
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('focusin', onIntent);
    return () => {
      document.removeEventListener('pointerover', onIntent);
      document.removeEventListener('focusin', onIntent);
    };
  }, [router]);

  return null;
}
