import React from 'react';

import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Link } from '@/components/link';

const SITE_URL = 'https://mouse.rip';

export type Crumb = {
  name: string;
  /** Omit on the final (current) crumb. */
  href?: string;
};

/**
 * Visible breadcrumb trail plus matching BreadcrumbList JSON-LD. The last item
 * is treated as the current page (rendered as text with aria-current).
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.href ? { item: `${SITE_URL}${crumb.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${crumb.name}-${index}`} className="flex items-center gap-x-1.5">
              {index > 0 && (
                <ChevronRightIcon className="size-4 shrink-0 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
              )}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="rounded transition-colors hover:text-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:hover:text-zinc-200"
                >
                  {crumb.name}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {crumb.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
