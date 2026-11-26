import clsx from 'clsx';
import { Link } from 'next-view-transitions';
import React, { type ComponentPropsWithoutRef } from 'react';

export function PageLink({ href, className, children, ...props }: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      href={href}
      className={clsx(
        className,
        'text-pink-600 underline decoration-pink-600/30 underline-offset-2 transition-colors hover:text-pink-800 hover:decoration-current dark:text-pink-400 dark:decoration-pink-400/40 dark:hover:text-pink-200',
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
