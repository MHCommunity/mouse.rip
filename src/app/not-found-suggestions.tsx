'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ToolCard } from '@/components/tool-card';
import {
  getStaticSearchRecords,
  loadGameItemRecords,
  loadMouseRecords,
  searchRecords,
  type SearchRecord,
} from '@/lib/search';

const MAX_SUGGESTIONS = 3;

/**
 * Mouse and item pages are addressed by the game's internal type, which often isn't the name ("glazed" is the
 * Glazy Mouse), so a URL typed from a name lands here. The last part of the address, read as a search, usually
 * finds what was meant.
 */
function queryFromPath(pathname: string): { section: string; query: string } | null {
  const parts = pathname.split('/').filter(Boolean);
  const last = parts.at(-1);
  if (!last) return null;
  let query: string;
  try {
    query = decodeURIComponent(last);
  } catch {
    query = last;
  }
  query = query
    .replace(/\.(html?|php)$/i, '')
    .replace(/[-_+]+/g, ' ')
    .trim();
  return query ? { section: parts[0] ?? '', query } : null;
}

function recordsFor(section: string): Promise<SearchRecord[]> {
  if (section === 'mice') return loadMouseRecords();
  if (section === 'items') return loadGameItemRecords();
  return Promise.all([loadMouseRecords(), loadGameItemRecords()]).then(([mice, items]) => [
    ...getStaticSearchRecords(),
    ...mice,
    ...items,
  ]);
}

export function NotFoundSuggestions() {
  const pathname = usePathname();
  const [suggestions, setSuggestions] = useState<SearchRecord[]>([]);

  useEffect(() => {
    const parsed = queryFromPath(pathname ?? '');
    if (!parsed) return;
    let cancelled = false;
    recordsFor(parsed.section)
      .then((records) => {
        if (!cancelled) setSuggestions(searchRecords(records, parsed.query, MAX_SUGGESTIONS));
      })
      // The search box above still works, so a failed index load only costs the suggestions.
      .catch((error: unknown) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (suggestions.length === 0) return null;

  return (
    <section aria-labelledby="suggestions-heading" className="mt-8">
      <h2 id="suggestions-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Were you looking for one of these?
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {suggestions.map((record) => (
          <li key={record.id}>
            <ToolCard
              href={record.href}
              title={record.title}
              description={record.subtitle ?? record.group}
              image={record.image}
              external={record.external ? new URL(record.href).hostname.replace(/^www\./, '') : undefined}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
