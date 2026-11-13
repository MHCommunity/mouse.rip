import { notFound } from 'next/navigation';
import React from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { ExternalRefs } from '@/components/external-refs';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';
import { Link } from 'next-view-transitions';

import { getResourcesForLocation, getLocation, getLocations, getTrapEffects } from '@/lib/site-data';
import { getItemsForEnvironment, getLocationLoot, itemSlug } from '@/lib/game-data';
import { ogCard, pageMetadata } from '@/seo';
import { cleanDescription } from '@/utils';
import { itemImageUrl, locationHeaderImageUrl, locationImageUrl } from '@/lib/image-urls';
import { SectionHeading } from '@/components/section-heading';
import { ClampedText } from '@/components/clamped-text';
import { GameImage } from '@/components/game-image';

import { LocationMice, getLocationMiceByCheese } from './location-mice';
import { LocationLoot } from './location-loot';
import { LocationTimerPanel } from '@/components/timers';
import { TIMER_LOCATION_NAMES } from '@/lib/timer-locations';

export const dynamicParams = false;

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

const linkClass =
  'underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 dark:decoration-zinc-600 dark:hover:text-zinc-200';

/** The sidebar region (Gnawnia, Rift Plane…) a location is listed under. */
function regionFor(locationId: string) {
  return getLocations().find((region) => region.locations.some((location) => location.id === locationId));
}

export default async function Location({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const location = getLocation(resolvedParams.id);

  if (!location) {
    notFound();
  }

  const name = location.name ?? 'Location';
  const regionEntry = regionFor(resolvedParams.id);
  const region = regionEntry?.name;
  const description = location.description ? cleanDescription(location.description) : undefined;

  const { groups: cheeseGroups, total: miceTotal } = location.name
    ? getLocationMiceByCheese(location.name)
    : { groups: [], total: 0 };
  const trapEffects = location.name
    ? (getTrapEffects().find((entry) => entry.location === location.name)?.effects ?? [])
    : [];
  const environmentKey = location.environmentId ?? location.id;
  const locationItems = getItemsForEnvironment(environmentKey);

  // Guides and tools written for this location lead the page; the site-wide ones
  // (useful everywhere, the same on every location) wait at the bottom.
  const resources = getResourcesForLocation(resolvedParams.id);
  const localResources = resources.filter((resource) => !resource.locations?.includes('all'));
  const generalResources = resources.filter((resource) => resource.locations?.includes('all'));

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          ...(regionEntry && region !== name ? [{ name: regionEntry.name, href: `/regions/${regionEntry.id}` }] : []),
          { name },
        ]}
      />

      {location.headerImage && (
        // The game's header art has a MouseHunt logo and frame baked into its
        // left edge; a narrower box with the focus pushed right crops it away.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={locationHeaderImageUrl(environmentKey)}
          alt=""
          width={760}
          height={127}
          className="mb-6 aspect-[600/127] w-full max-w-2xl rounded-lg object-cover object-[84%_50%] ring-1 ring-zinc-950/5 dark:ring-white/10"
        />
      )}

      <header className="flex items-start gap-3 sm:gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={locationImageUrl(location.id)}
          alt=""
          width={54}
          height={54}
          className="mt-0.5 size-11 shrink-0 rounded-lg ring-1 ring-zinc-950/5 sm:size-[54px] dark:ring-white/10"
        />
        <div className="min-w-0">
          <Heading>{name}</Heading>
          {regionEntry && region !== name && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href={`/regions/${regionEntry.id}`} className={linkClass}>
                {regionEntry.name}
              </Link>
            </p>
          )}
        </div>
      </header>

      {description && <ClampedText className="mt-4 max-w-prose">{description}</ClampedText>}

      {location.name && TIMER_LOCATION_NAMES.includes(location.name) && (
        <LocationTimerPanel locationName={location.name} />
      )}

      {localResources.length > 0 && (
        <section className="mt-10">
          <SectionHeading>Guides and tools for {name}</SectionHeading>
          <ItemList items={localResources} headingLevel={3} />
        </section>
      )}

      {miceTotal > 0 && location.name && (
        <LocationMice locationName={location.name} groups={cheeseGroups} total={miceTotal} />
      )}

      {location.name && <LocationLoot rows={getLocationLoot(location.name)} />}

      {locationItems.length > 0 && (
        <section className="mt-10">
          <SectionHeading>Items for this location</SectionHeading>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Cheese, charms, gear and other items made for hunting here.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {locationItems.map((item) => {
              const slug = itemSlug(item.type);
              return (
                <li key={item.id}>
                  <Link
                    href={`/items/${slug}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition hover:border-pink-300 hover:text-pink-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-pink-800 dark:hover:text-pink-300"
                  >
                    <GameImage src={itemImageUrl(slug)} width={24} height={24} className="size-6 shrink-0 rounded" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {trapEffects.length > 0 && (
        <section className="mt-10">
          <SectionHeading>Trap special effects here</SectionHeading>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Traps with unique behavior in this location. See{' '}
            <Link href="/trap-special-effects" className={linkClass}>
              all trap special effects
            </Link>
            .
          </p>
          <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-medium sm:px-4">Trap</th>
                  <th className="px-3 py-2 font-medium sm:px-4">Effect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {trapEffects.map((effect) => (
                  <tr key={effect.name} className="align-top">
                    <td className="px-3 py-2 font-medium text-zinc-900 sm:px-4 sm:whitespace-nowrap dark:text-white">
                      {effect.name}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 sm:px-4 dark:text-zinc-300">{effect.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {generalResources.length > 0 && (
        <section className="mt-10">
          <SectionHeading>Tools for every location</SectionHeading>
          <ItemList items={generalResources} headingLevel={3} />
        </section>
      )}

      {location.name && <ExternalRefs name={location.name} kind="locations" />}
    </>
  );
}
