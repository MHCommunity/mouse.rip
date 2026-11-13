'use client';

import clsx from 'clsx';
import React, { useState } from 'react';

/**
 * A game art thumbnail that degrades to a neutral tile when the image is
 * missing from i.mouse.rip, instead of the browser's broken-image icon.
 */
export function GameImage({ className, alt = '', ...props }: React.ComponentPropsWithoutRef<'img'>) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span aria-hidden="true" className={clsx('inline-block bg-zinc-200 dark:bg-zinc-700', className)} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} loading="lazy" decoding="async" {...props} className={className} onError={() => setFailed(true)} />
  );
}
