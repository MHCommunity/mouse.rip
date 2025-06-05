import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { cleanDescription, formatNumber } from '@/utils';
import { Heading } from '@/components/heading';

import attractionRates from '@/data/generated/mice-attraction-rates.json';
import environments from '@/data/generated/environments.json';
import environmentsEvents from '@/data/generated/environments-events.json';
import items from '@/data/generated/items.json';
import mice from '@/data/generated/mice.json';
import reverseMapper from '@/data/generated/mhct-reverse-mapper.json';

// Create lookup tables
const envLookup = Object.fromEntries(environments.map((env) => [env.id, env.name]));
const envEventsLookup = Object.fromEntries(environmentsEvents.map((env) => [env.id, env.name]));
const itemLookup = Object.fromEntries(items.map((item) => [item.type, item.name]));

function getSortedAttractionData(attractionData) {
  const rows = [];

  for (const [envId, value] of Object.entries(attractionData)) {
    // If this environment has stages
    if (value && value['has-stages'] && value.stages) {
      for (const [stage, baits] of Object.entries(value.stages)) {
        for (const [bait, rate] of Object.entries(baits)) {
          rows.push({
            location: envId,
            stage,
            cheese: bait,
            rate: Number(rate),
          });
        }
      }
    } else {
      // No stages, just baits
      for (const [bait, rate] of Object.entries(value)) {
        // skip "has-stages" key if present
        if (bait === 'has-stages' || bait === 'stages') {
          continue;
        }
        rows.push({
          location: envId,
          stage: null,
          cheese: bait,
          rate: Number(rate),
        });
      }
    }
  }

  // Sort by rate descending
  rows.sort((a, b) => b.rate - a.rate);

  return rows;
}

export async function generateMetadata({ params }) {
  const mouse = mice.find((m) => m.type === params.id.replace(/-/g, '_'));
  return {
    title: `${mouse?.name ?? 'Unknown Mouse'}`,
  };
}

export function generateStaticParams() {
  return mice.map((m) => ({ id: m.type.replace(/_/g, '-') }));
}

export default async function Mouse({ params }) {
  const mouseType = params.id.replace(/-/g, '_');
  const mouse = mice.find((m) => m.type === mouseType);

  if (! mouse) {
    notFound();
  }

  const EXCLUDED_MAPS = new Set([
    'Naughty 2014 List',
    'Naughty 2019 List',
    'Naughty 2020 List',
    'Naughty 2021 List',
    'Naughty 2022 List',
    'Nice 2014 List',
    'Nice 2019 List',
    'Nice 2020 List',
    'Nice 2021 List',
    'Nice 2022 List',

    /* Never had an entry */
    '10th Birthday Event Map',
    '10th Birthday Map',
    '2012 Halloween Map',
    '2014 Halloween Map',
    '9th Birthday Cupcake List Map',
    'Athletic Lunar List Map',
    'Birthday Dance Hall List Map',
    'Eerie Halloween Map',
    'Elite Toxic Spill Map',
    'Gilded 10th Birthday Map',
    'Gilded Time Traveler\'s Map',
    'Haunted Halloween Map',
    'Lunar New Year Map',
    'Medium Map Treasure Map',
    'New Year\'s Party Map (2023)',
    'Old Arduous Slayer Map (Retired)',
    'Rift Stalkers Map (Old)',
    'Rift Walkers Map (Old)',
    'Seventh Birthday Cupcake List Map',
    'Spooky Halloween Map',
    'Terrifying Halloween Map',
    'Time Traveler\'s Map',
    'Tribal and Shelder Hunt Map (old)',
    'Undead Map',
    'Valentine\'s Map',

    /* hasn't seen an open in 3+ years */
    '11th Birthday Event Map',
    'Gilded 11th Birthday Event Map',
    'Golden Jade Map (Retired 2020)',
    'Floating Isles Pirate Map',
    'Easy Grand Ghostship Map',
    'Lunar New Year Event Map',
    'Party Size Rainbow Map',
    'Eerie Halloween Event Map',

    /* Replaced by new maps */
    'Easy Toxic Spill Map',
    'Hard Toxic Spill Map',
    'Elaborate Toxic Spill Map',
    'Medium Toxic Spill Map',
    'Arduous Toxic Spill Map',

    /* Retired maps */
    'Party Size Elite Chrome Map (-09.2022)',
    'Elite Slayer Map (-09.2022)',
    'Elite Chrome Map (-09.2022)',
    'Elite Chrome Slayer Map (-09.2022)',
    'Elite Map (-09.2022)',
    'Lantern Lighter Event Map (-2022)',

    'Easy Map',
    'Medium Map',
    'Hard Map',
    'Arduous Map',
    'Elaborate Map',
    'Elite Map',
  ]);

  const baseMapName = (name) =>
    name
      .replace(/\s*\(-\d{2}\.\d{4}\)/, '')
      .replace(/\b(Naughty|Nice)\s?\d{4}\s?List\b/gi, 'List')
      .replace(/\b(Naughty|Nice)\s?List\s?\d{4}\b/gi, 'List')
      .trim();

  // Step 1: Get raw map list
  let maps = reverseMapper.find((m) => m.type === mouse.type)?.maps ?? [];

  // Step 2: Initial filter (remove retired, excluded, and under 1% maps)
  maps = maps.filter((map) => {
    if (EXCLUDED_MAPS.has(map.map)) {
      return false;
    }
    if (map.rate < 10) {
      return false;
    }
    return true;
  });

  // Step 3: Create set of canonical (non-dated) map names
  const nonDatedNames = new Set(
    maps
      .filter((map) =>
        ! /\(-\d{2}\.\d{4}\)/.test(map.map) &&
      ! /\b(Naughty|Nice)\s?\d{4}\s?List\b/i.test(map.map)
      )
      .map((map) => baseMapName(map.map))
  );

  // Step 4: Remove duplicates if non-dated version exists
  maps = maps.filter((map) => {
    const isDatedOrYearList = /\(-\d{2}\.\d{4}\)/.test(map.map) || /\b(Naughty|Nice)\s?\d{4}\s?List\b/i.test(map.map);
    return ! isDatedOrYearList || ! nonDatedNames.has(baseMapName(map.map));
  });

  const attractionData = attractionRates[mouseType] || [];
  const sortedAttractionData = getSortedAttractionData(attractionData);
  const hasAnyStage = sortedAttractionData.some((row) => row.stage);

  return (
    <div className="mx-auto max-w-4xl px-2 sm:px-6">
      <div className="mb-4">
        <Link
          href="/mice"
          className="inline-flex items-center text-sm font-medium text-pink-600 transition-colors hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200"
        >
          ← Back to Mice
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link
          href={`/mice/${mouse.group.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
          className="text-sm text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200"
        >
          {mouse.group}
        </Link>

      </div>

      <div className="flex flex-col items-start gap-6 md:flex-row md:gap-8">
        <div className="flex w-full justify-center md:block md:w-auto">
          <Image
            src={`/images/mice/large/${mouse.type.replace(/_/g, '-')}.png`}
            alt={mouse.name}
            width={mouse.images.is_landscape ? 666 : 333}
            height={mouse.images.is_landscape ? 444 : 500}
            className="h-auto w-40 rounded-md border border-gray-300 shadow-md sm:w-56 md:w-64 dark:border-gray-700"
            priority
          />
        </div>

        <div className="w-full flex-1 space-y-3">
          <Heading className="break-words text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-gray-100">
            {mouse.name}
          </Heading>
          <Heading level={2} className="break-words text-lg font-semibold text-gray-800 sm:text-xl dark:text-gray-200">
            {mouse.group}
            {mouse.subgroup && ` (${mouse.subgroup})`}
          </Heading>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700 sm:mt-6 sm:grid-cols-3 dark:text-gray-300">
            <div>
              <span className="font-semibold">Points: </span>
              {formatNumber(mouse.points)}
            </div>
            <div>
              <span className="font-semibold">Gold: </span>
              {formatNumber(mouse.gold)}
            </div>
            <div>
              <span className="font-semibold">Wisdom: </span>
              {formatNumber(mouse.wisdom)}
            </div>
          </div>

          <p className="whitespace-pre-line text-sm text-gray-700 sm:text-base dark:text-gray-300">
            {cleanDescription(mouse.description)}
          </p>

          {/* Weaknesses */}
          {mouse.weaknesses?.effective?.length > 0 && (
            <div className="mt-8">
              <Heading level={2} className="mb-2 text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
                Effective Power Types
              </Heading>
              <ul className="flex flex-wrap gap-2">
                {mouse.weaknesses.effective.map((type) => (
                  <li
                    key={type}
                    className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 sm:text-sm dark:bg-indigo-800 dark:text-white"
                  >
                    <Image
                      src={`/images/power-types/${type}.png`}
                      alt={type}
                      width={16}
                      height={16}
                      className="mr-1 inline-block"
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Minlucks */}
      {mouse.minlucks && Object.keys(mouse.minlucks).length > 0 && (
        <div className="mt-8 sm:mt-10">
          <div className="mb-4 flex items-center justify-between">
            <Heading level={2} className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-gray-100">
              Minlucks
            </Heading>
            <h3 className="align-middle text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              {' '}
              (Guaranteed catch if your trap has this much Luck)
            </h3>
          </div>
          <ul className="flex flex-wrap gap-2">
            {Object.entries(mouse.minlucks)
              .filter(([, value]) => value > 0)
              .map(([type, value]) => (
                <li
                  key={type}
                  className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 sm:text-sm dark:bg-yellow-800 dark:text-yellow-100"
                >
                  <Image
                    src={`/images/power-types/${type}.png`}
                    alt={type}
                    width={16}
                    height={16}
                    className="mr-1 inline-block"
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  <span className="ml-1 font-semibold">
                    {value}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Attraction Table */}
      {sortedAttractionData.length > 0 && (
        <div className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between">
            <Heading level={2} className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-gray-100">
              Where to find {mouse.name}
            </Heading>
            <Link
              href={`https://api.mouse.rip/mhct-redirect/${mouse.id}`}
              className="inline-flex items-center text-sm font-medium text-pink-600 transition-colors hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200"
            >
              View on MHCT →
            </Link>
          </div>
          <div className="w-full overflow-hidden rounded border border-gray-300 dark:border-gray-700">
            <div className="max-h-[500px] overflow-x-auto overflow-y-hidden">
              <table className="w-full min-w-[600px] text-xs sm:text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th className="whitespace-nowrap border-b border-gray-300 bg-gray-100 p-2 text-left sm:px-3 dark:border-gray-700 dark:bg-gray-800">Location</th>
                    {hasAnyStage && (
                      <th className="whitespace-nowrap border-b border-gray-300 bg-gray-100 p-2 text-left sm:px-3 dark:border-gray-700 dark:bg-gray-800">Stage</th>
                    )}
                    <th className="whitespace-nowrap border-b border-gray-300 bg-gray-100 p-2 text-left sm:px-3 dark:border-gray-700 dark:bg-gray-800">Cheese</th>
                    <th className="whitespace-nowrap border-b border-gray-300 bg-gray-100 p-2 text-left sm:px-3 dark:border-gray-700 dark:bg-gray-800">Attraction Rate</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900 dark:text-white">
                  {sortedAttractionData.map((row, i) => (
                    <tr key={i} className="bg-white text-gray-900 even:bg-gray-100 dark:bg-gray-800 dark:text-white dark:even:bg-gray-900">
                      <td className="whitespace-nowrap border-b border-gray-200 p-2 sm:px-3 dark:border-gray-800">
                        {envLookup[row.location] || envEventsLookup[row.location] || row.location}
                      </td>
                      {hasAnyStage && (
                        <td className="whitespace-nowrap border-b border-gray-200 p-2 sm:px-3 dark:border-gray-800">
                          {row.stage || '—'}
                        </td>
                      )}
                      <td className="whitespace-nowrap border-b border-gray-200 p-2 sm:px-3 dark:border-gray-800">
                        {itemLookup[row.cheese] || row.cheese}
                      </td>
                      <td className="whitespace-nowrap border-b border-gray-200 p-2 sm:px-3 dark:border-gray-800">
                        {row.rate ? `${(row.rate).toFixed(2)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Maps */}
      <div className="mt-8 sm:mt-10">
        <Heading level={2} className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-gray-100">
          Maps containing {mouse.name}
        </Heading>
        {maps.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {maps.map((map) => (
              <li
                key={map.map}
                className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-800 sm:text-sm dark:bg-pink-900 dark:text-pink-100"
              >
                <span className="font-semibold">{map.map}</span> ({Math.floor(map.rate / 100)}% chance)
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            This mouse doesn&apos;t seem to appear on any maps.
          </p>
        )}
      </div>
    </div>
  );
}
