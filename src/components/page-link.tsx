import clsx from 'clsx';
import React, { type ComponentPropsWithoutRef } from 'react';

import { Link } from '@/components/site-link';
import { isOurUrl } from '@/utils';

/**
 * A link in running text. One that leaves the site opens in a new tab, like the footer and resource links do, so
 * a hunter part-way through a calculator doesn't lose the page they were filling in.
 */
export function PageLink({ href, className, children, ...props }: ComponentPropsWithoutRef<typeof Link>) {
  const leaves = typeof href === 'string' && /^https?:\/\//.test(href) && !isOurUrl(href);
  return (
    <Link
      href={href}
      {...(leaves ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={clsx(
        className,
        'text-pink-600 underline decoration-pink-600/30 underline-offset-2 transition-colors hover:text-pink-800 hover:decoration-current dark:text-pink-400 dark:decoration-pink-400/40 dark:hover:text-pink-200',
      )}
      {...props}
    >
      {children}
      {leaves && <span className="sr-only"> (opens in a new tab)</span>}
    </Link>
  );
}
