'use client';

import React, { useEffect, useState } from 'react';

/**
 * A one-line result for screen readers, spoken once it has stopped changing.
 *
 * The calculators used to mark their whole results panel as a live region. A screen reader then reads out every
 * cell that changed, as bare numbers with no row or column to place them, on each keystroke. This says the answer
 * in a sentence instead; the table is there to explore afterwards.
 */
export function Announce({ children }: { children: string }) {
  // Starts as the first result, so arriving on a page that already has one isn't an announcement.
  const [spoken, setSpoken] = useState(children);
  useEffect(() => {
    const timer = setTimeout(() => setSpoken(children), 600);
    return () => clearTimeout(timer);
  }, [children]);

  return (
    <p role="status" aria-atomic="true" className="sr-only">
      {spoken}
    </p>
  );
}
