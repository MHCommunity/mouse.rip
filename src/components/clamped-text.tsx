'use client';

import clsx from 'clsx';
import React, { useLayoutEffect, useRef, useState } from 'react';

/**
 * A paragraph cut to three lines on phones, with a "More" toggle, so flavour text
 * doesn't push the useful part of a page below the first screen. From sm up it
 * shows in full. The toggle only appears when the text is actually cut.
 */
export function ClampedText({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setClamped(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={className}>
      <p
        ref={ref}
        className={clsx('text-base/7 text-pretty text-zinc-600 dark:text-zinc-300', !expanded && 'max-sm:line-clamp-3')}
      >
        {children}
      </p>
      {(clamped || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="mt-1 inline-flex min-h-9 items-center rounded-md text-sm font-medium text-pink-700 hover:text-pink-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 sm:hidden dark:text-pink-300 dark:hover:text-pink-200"
        >
          {expanded ? 'Less' : 'More'}
        </button>
      )}
    </div>
  );
}
