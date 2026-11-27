import { Link as ViewTransitionLink } from 'next-view-transitions';
import React from 'react';

/**
 * The link every page uses.
 *
 * Next's default is to fetch a linked page as soon as its link scrolls into view. Pages here list hundreds of mice
 * and items, and each of those pages preloads its own artwork, so that default downloaded megabytes for pages
 * nobody opened. These links wait instead: PrefetchOnIntent, in the layout, fetches a page when a visitor points
 * at, touches or tabs to its link.
 */
export function Link({ prefetch = false, ...props }: React.ComponentProps<typeof ViewTransitionLink>) {
  return <ViewTransitionLink prefetch={prefetch} {...props} />;
}
