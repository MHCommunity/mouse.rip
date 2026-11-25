import { notFound } from 'next/navigation';
import React from 'react';

import { Link } from 'next-view-transitions';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Heading } from '@/components/heading';
import { getLocation, getLocations } from '@/lib/site-data';
import { getMiceForRegionName } from '@/lib/game-data';
import { locationImageUrl } from '@/lib/image-urls';
import { pageMetadata } from '@/seo';
import { cleanDescription } from '@/utils';

export const dynamicParams = false;

export function generateStaticParams() {
  return getLocations().map((region) => ({ id: region.id }));
}

function getRegion(id: string) {
  return getLocations().find((region) => region.id === id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const region = getRegion(id);
  if (!region) return { title: 'Not Found' };

  const names = region.locations.map((location) => location.name);
  return pageMetadata({
    title: `${region.name} Locations in MouseHunt`,
    description: `The ${names.length} MouseHunt locations in ${region.name}: ${names.join(', ')}. Mice, cheese, and loot for each.`,
    path: `/regions/${id}`,
  });
}

/** Trims a game description to its first sentence, for a card. */
function firstSentence(text: string): string {
  const match = text.match(/^.+?[.!?](\s|$)/);
  return (match ? match[0] : text).trim();
}

export default async function RegionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const region = getRegion(id);
  if (!region) notFound();

  // Many mice live in several locations, so the region total counts each species once.
  const regionMouseIds = new Set<number>();
  const locations = region.locations.map((entry) => {
    const location = getLocation(entry.id);
    const description = location?.description ? firstSentence(cleanDescription(location.description)) : undefined;
    const mice = getMiceForRegionName(entry.name);
    for (const mouse of mice) regionMouseIds.add(mouse.id);
    return { id: entry.id, name: entry.name, description, mice: mice.length };
  });
  const totalMice = regionMouseIds.size;

  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: region.name }]} />

      <Heading>{region.name}</Heading>
      <p className="mt-2 text-sm text-zinc-600 tabular-nums dark:text-zinc-400">
        {totalMice.toLocaleString()} {totalMice === 1 ? 'mouse' : 'mice'} across {locations.length}{' '}
        {locations.length === 1 ? 'location' : 'locations'}
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {locations.map((location) => (
          <li key={location.id}>
            <Link
              href={`/locations/${location.id}`}
              className="group flex h-full items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-pink-300 hover:bg-pink-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pink-800 dark:hover:bg-pink-950/20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={locationImageUrl(location.id)}
                alt=""
                width={48}
                height={48}
                loading="lazy"
                className="size-12 shrink-0 rounded-md ring-1 ring-zinc-950/5 dark:ring-white/10"
              />
              <span className="min-w-0">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-zinc-900 group-hover:text-pink-700 dark:text-white dark:group-hover:text-pink-300">
                    {location.name}
                  </span>
                  {location.mice > 0 && (
                    <span className="shrink-0 text-xs text-zinc-600 tabular-nums dark:text-zinc-400">
                      {location.mice} {location.mice === 1 ? 'mouse' : 'mice'}
                    </span>
                  )}
                </span>
                {location.description && (
                  <span className="mt-1 line-clamp-2 block text-sm text-pretty text-zinc-600 dark:text-zinc-400">
                    {location.description}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
