import React from 'react';

import clsx from 'clsx';

/** The small-caps heading over each section of a mouse, item or location page. */
export function SectionHeading({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h2
      className={clsx('text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500', className)}
    >
      {children}
    </h2>
  );
}
