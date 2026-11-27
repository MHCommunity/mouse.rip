'use client';

import clsx from 'clsx';
import React, { useState } from 'react';

/**
 * A game art thumbnail that degrades to a neutral tile when the image is
 * missing from i.mouse.rip, instead of the browser's broken-image icon.
 */
export function GameImage({
  className,
  alt = '',
  fallback,
  ...props
}: React.ComponentPropsWithoutRef<'img'> & {
  /** Shown instead of the neutral tile when the image is missing, e.g. the section's icon. */
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    if (fallback) return <>{fallback}</>;
    return <span aria-hidden="true" className={clsx('inline-block bg-zinc-200 dark:bg-zinc-700', className)} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} loading="lazy" decoding="async" {...props} className={className} onError={() => setFailed(true)} />
  );
}
