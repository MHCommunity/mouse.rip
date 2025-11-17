import clsx from 'clsx';
import Link from 'next/link';
import React, { type ComponentPropsWithoutRef } from 'react';

export function PageLink({ href, className, children, ...props }: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link href={href} className={clsx(
      className,
      'text-pink-600 transition-colors hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200'
    )} {...props}>
      {children}
    </Link>
  );
}
