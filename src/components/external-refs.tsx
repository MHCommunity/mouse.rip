import React from 'react';

import { ArrowUpRightIcon } from '@heroicons/react/20/solid';

function wikiName(name: string): string {
  return encodeURIComponent(name.trim().replaceAll(' ', '_'));
}

/**
 * Outbound "more info" links to community references. Pass `id` to add an MHCT
 * deep link (via the api.mouse.rip redirect, which maps our ids to MHCT's), and
 * `tradable` to add a Markethunt link.
 */
export function ExternalRefs({
  name,
  kind,
  id,
  tradable,
}: {
  name: string;
  kind: 'mice' | 'items';
  id?: number;
  tradable?: boolean;
}) {
  const refs = [
    {
      label: 'MHWiki',
      href: `https://mhwiki.hitgrab.com/wiki/index.php/${wikiName(name)}`,
    },
    ...(id != null
      ? [
          {
            label: 'MHCT',
            href:
              kind === 'mice'
                ? `https://api.mouse.rip/mhct-redirect/${id}`
                : `https://api.mouse.rip/mhct-redirect-item/${id}`,
          },
        ]
      : []),
    ...(id != null && tradable ? [{ label: 'Markethunt', href: `https://markethunt.win/?item_id=${id}` }] : []),
  ];

  return (
    <div className="mt-10 border-t border-zinc-100 pt-6 dark:border-zinc-800">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
        More references
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {refs.map((ref) => (
          <a
            key={ref.label}
            href={ref.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 shadow-sm transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            {ref.label}
            <ArrowUpRightIcon className="size-3.5 text-zinc-400" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}
