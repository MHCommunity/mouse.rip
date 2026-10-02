import { notFound } from 'next/navigation';
import React from 'react';

import { Avatar } from '@/components/avatar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';
import { MouseGrid } from '@/components/mouse-grid';
import { Link } from 'next-view-transitions';

import { getItemsByLocation, getLocation, getLocations, getTitles, getTrapEffects } from '@/data';
import { getAllGameItems, getMiceForRegionName, itemSlug } from '@/lib/game-data';
import { ogCard, pageMetadata } from '@/seo';
import { cleanDescription } from '@/utils';
import { itemImageUrl, locationHeaderImageUrl, locationImageUrl, titleImageUrl } from '@/lib/image-urls';

export const dynamicParams = false;

// Keep the game-data sections hidden while their navigation is hidden.
const SHOW_LOCATION_GAME_DATA = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const location = getLocation(resolvedParams.id);

  if (!location) {
    return { title: 'Not Found' };
  }

  const where = location.article ? location.article : location.name;
  return pageMetadata({
    title: `MouseHunt Resources for ${where}`,
    description: location.description
      ? cleanDescription(location.description)
      : `Guides, tools, and community resources for ${where} in MouseHunt.`,
    path: `/locations/${resolvedParams.id}`,
    image: location.name
      ? ogCard({
          title: location.name,
          eyebrow: 'Location',
          image: locationImageUrl(location.id),
          accent: 'emerald',
        })
      : undefined,
  });
}

export function generateStaticParams() {
  const locations = getLocations();
  if (!locations) {
    return [];
  }

  type Environment = { id: string };

  const paths = locations.map((region: { locations: Environment[] }) => {
    return region.locations.map((environment: Environment) => {
      return {
        id: environment.id,
      };
    });
  });

  return paths.flat();
}

export default async function Location({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const location = getLocation(resolvedParams.id);

  if (!location) {
    notFound();
  }
  const items = getItemsByLocation(resolvedParams.id);

  const mice = SHOW_LOCATION_GAME_DATA && location.name ? getMiceForRegionName(location.name) : [];
  const minTitle = location.title ? getTitles().find((title) => title.id === location.title) : undefined;
  const trapEffects = location.name
    ? (getTrapEffects().find((entry) => entry.location === location.name)?.effects ?? [])
    : [];
  const environmentKey = location.environmentId ?? location.id;
  const locationItems = SHOW_LOCATION_GAME_DATA
    ? getAllGameItems().filter((item) => (item.environment ?? []).includes(environmentKey))
    : [];

  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: location.name ?? 'Location' }]} />

      {location.headerImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={locationHeaderImageUrl(location.environmentId ?? location.id)}
          alt=""
          className="mb-6 h-40 w-full rounded-2xl object-cover ring-1 ring-zinc-950/5 dark:ring-white/10"
        />
      )}

      <Heading>
        <Avatar src={locationImageUrl(location.id)} alt={location.name} square className="mr-2" />
        MouseHunt Resources for {location.article ? location.article : location.name}
      </Heading>

      {minTitle && (
        <p className="mt-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={titleImageUrl(minTitle.id)} alt="" className="size-5 shrink-0" />
          Requires the{' '}
          <Link
            href="/titles"
            className="font-medium text-zinc-700 underline decoration-zinc-300 decoration-dotted underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            {minTitle.name}
          </Link>{' '}
          title to enter.
        </p>
      )}

      <ItemList items={items} />

      {locationItems.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Items for this location
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gear, bait, and other items that are specific to hunting here.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {locationItems.map((item) => {
              const slug = itemSlug(item.type);
              return (
                <li key={item.id}>
                  <Link
                    href={`/items/${slug}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-blue-800 dark:hover:text-blue-300"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={itemImageUrl(slug)} alt="" loading="lazy" className="size-6 shrink-0 rounded" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {trapEffects.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Trap special effects here
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Traps with unique behavior in this location. See{' '}
            <Link
              href="/trap-special-effects"
              className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              all trap special effects
            </Link>
            .
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Trap</th>
                  <th className="px-4 py-2 font-medium">Effect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {trapEffects.map((effect) => (
                  <tr key={effect.name}>
                    <td className="px-4 py-2 font-medium whitespace-nowrap text-zinc-900 dark:text-white">
                      {effect.name}
                    </td>
                    <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">{effect.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {mice.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            {mice.length} mice found here
          </h2>
          <div className="mt-4">
            <MouseGrid mice={mice} />
          </div>
        </section>
      )}
    </>
  );
}
