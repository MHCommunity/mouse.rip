import React from 'react';

import clsx from 'clsx';

/** The heading over each section of a mouse, item or location page: a step above body text, never below it. */
export function SectionHeading({
  id,
  className,
  children,
}: {
  /** For a section's aria-labelledby. */
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className={clsx('text-lg/7 font-semibold text-zinc-900 dark:text-white', className)}>
      {children}
    </h2>
  );
}
