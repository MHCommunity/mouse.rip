import 'server-only';

import React from 'react';

import { Link } from '@/components/site-link';

import { ColorScaleBadge } from '@/components/color-scale-badge';
import { GameImage } from '@/components/game-image';
import { SectionHeading } from '@/components/section-heading';
import { SourceLink } from '@/components/source-link';
import lookup from '@/data/generated/name-lookup.json';
import { getMiceForRegionName, getMouseAttraction, mouseSlug } from '@/lib/game-data';
import { itemImageUrl, mouseImageUrl } from '@/lib/image-urls';
import { POWER_TYPES, powerTypeSetLabel } from '@/lib/power-types';
import { bestAttractionRow } from '@/lib/attraction';
import { LiveStageLabel, LiveStageNote, LiveStageProvider, LiveStageRow } from './live-stage';
import type { AttractionRow, Mouse } from '@/types';

const cheeseLookup = lookup.cheese as Record<string, string>;

interface LocationMouse {
  mouse: Mouse;
  slug: string;
  best?: AttractionRow;
  minluck?: { value: number; types: string[] };
}

interface CheeseGroup {
  cheese: string | null;
  mice: LocationMouse[];
}

function cheeseSlug(cheese: string): string | undefined {
  const key = cheese.trim().toLowerCase();
  return cheeseLookup[key] ?? cheeseLookup[`${key} cheese`];
}

/** The best charm-free attraction row for a mouse here, skipping tiny samples when possible. */
function bestRowAt(mouseId: number, locationName: string): AttractionRow | undefined {
  return bestAttractionRow(
    getMouseAttraction(mouseId).filter((row) => row.location === locationName && row.charm === null),
  );
}

/** The lowest minluck a mouse has, and every power type that shares it. */
function lowestMinluck(mouse: Mouse): LocationMouse['minluck'] {
  const minlucks = (mouse.minlucks ?? {}) as Record<string, number | undefined>;
  let value = Infinity;
  let types: string[] = [];
  for (const type of POWER_TYPES) {
    const luck = minlucks[type];
    if (typeof luck !== 'number' || luck <= 0) continue;
    if (luck < value) {
      value = luck;
      types = [type];
    } else if (luck === value) {
      types.push(type);
    }
  }
  return types.length > 0 ? { value, types } : undefined;
}

/**
 * Every mouse the game lists for this location, grouped by the cheese that
 * attracts each one best here. Groups with the most mice come first; mice with
 * no attraction data go last.
 */
export function getLocationMiceByCheese(locationName: string): { groups: CheeseGroup[]; total: number } {
  const mice = getMiceForRegionName(locationName).map<LocationMouse>((mouse) => ({
    mouse,
    slug: mouseSlug(mouse.type),
    best: bestRowAt(mouse.id, locationName),
    minluck: lowestMinluck(mouse),
  }));

  const byCheese = new Map<string | null, LocationMouse[]>();
  for (const entry of mice) {
    const key = entry.best?.cheese ?? null;
    byCheese.set(key, [...(byCheese.get(key) ?? []), entry]);
  }

  const groups = [...byCheese.entries()].map(([cheese, entries]) => ({
    cheese,
    mice: entries.sort((a, b) => (b.best?.rate ?? 0) - (a.best?.rate ?? 0) || a.mouse.name.localeCompare(b.mouse.name)),
  }));

  groups.sort((a, b) => {
    if (a.cheese === null) return 1;
    if (b.cheese === null) return -1;
    return b.mice.length - a.mice.length || (b.mice[0].best?.rate ?? 0) - (a.mice[0].best?.rate ?? 0);
  });

  return { groups, total: mice.length };
}

/** MHCT and MH-Tools rates are stored in hundredths of a percent. */
function formatRate(rate: number): string {
  return `${(rate / 100).toFixed(2)}%`;
}

function CheeseTitle({ cheese }: { cheese: string | null }) {
  if (cheese === null) {
    return <span className="text-zinc-700 dark:text-zinc-300">No attraction data yet</span>;
  }
  const slug = cheeseSlug(cheese);
  const content = (
    <>
      {slug && <GameImage src={itemImageUrl(slug)} width={28} height={28} className="size-7 shrink-0 rounded" />}
      <span>{cheese}</span>
    </>
  );
  return slug ? (
    <Link
      href={`/items/${slug}`}
      className="inline-flex min-w-0 items-center gap-2 text-zinc-900 hover:text-pink-700 dark:text-white dark:hover:text-pink-300"
    >
      {content}
    </Link>
  ) : (
    <span className="inline-flex min-w-0 items-center gap-2 text-zinc-900 dark:text-white">{content}</span>
  );
}

function MouseRow({ entry }: { entry: LocationMouse }) {
  const { mouse, slug, best, minluck } = entry;
  return (
    <LiveStageRow stage={best?.stage} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mouseImageUrl(slug)}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        className="size-10 shrink-0 transition-[opacity,filter] group-data-[off-stage]:opacity-40 group-data-[off-stage]:grayscale motion-reduce:transition-none"
      />
      <div className="min-w-0 flex-1">
        <Link
          href={`/mice/${slug}`}
          className="font-medium text-zinc-900 hover:text-pink-700 dark:text-zinc-100 dark:hover:text-pink-300"
        >
          {mouse.name}
        </Link>
        {best && (
          <div className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="tabular-nums">{formatRate(best.rate)}</span> attraction
            {best.stage && <LiveStageLabel stage={best.stage} />}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        {minluck ? (
          <>
            <ColorScaleBadge value={minluck.value} />
            <span className="max-w-32 text-right text-xs text-zinc-600 sm:max-w-48 dark:text-zinc-400">
              {powerTypeSetLabel(minluck.types)}
            </span>
          </>
        ) : (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">No minluck</span>
        )}
      </div>
    </LiveStageRow>
  );
}

export function LocationMice({
  locationName,
  groups,
  total,
}: {
  locationName: string;
  groups: CheeseGroup[];
  total: number;
}) {
  return (
    <LiveStageProvider locationName={locationName}>
      <section className="mt-10">
        <SectionHeading>
          <span className="tabular-nums">{total}</span> {total === 1 ? 'mouse' : 'mice'} found here
        </SectionHeading>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Grouped by the cheese that attracts each mouse best here, with its lowest minluck. Attraction rates from{' '}
          <SourceLink source="mhct" /> and <SourceLink source="mh-tools" />. See the{' '}
          <Link
            href="/minlucks"
            className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 dark:decoration-zinc-600 dark:hover:text-zinc-200"
          >
            full minluck table
          </Link>
          .
        </p>
        <LiveStageNote
          stages={[...new Set(groups.flatMap((group) => group.mice.flatMap((entry) => entry.best?.stage ?? [])))]}
        />

        <div className="mt-4 space-y-4">
          {groups.map((group) => (
            <div
              key={group.cheese ?? 'none'}
              className="overflow-hidden rounded-2xl shadow-xs ring-1 ring-zinc-200 bg-white dark:ring-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold sm:px-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                <CheeseTitle cheese={group.cheese} />
                <span className="shrink-0 text-xs font-normal tabular-nums text-zinc-600 dark:text-zinc-400">
                  {group.mice.length} {group.mice.length === 1 ? 'mouse' : 'mice'}
                </span>
              </h3>
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {group.mice.map((entry) => (
                  <MouseRow key={entry.mouse.id} entry={entry} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </LiveStageProvider>
  );
}
