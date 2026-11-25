import React from 'react';

import { TrophyIcon } from '@heroicons/react/20/solid';
import { Link } from '@/components/link';
import { PageHeader } from '@/components/page-header';

import { getTitles } from '@/lib/site-data';
import { pageMetadata } from '@/seo';
import { titleImageUrl } from '@/lib/image-urls';
import { WISDOM_BY_TITLE } from '@/lib/titles';

export const metadata = pageMetadata({
  title: 'MouseHunt Titles & Ranks',
  description:
    'Every MouseHunt hunter title from Novice to Fabled, in order, with what each rank unlocks and the wisdom needed to reach it.',
  path: '/titles',
});

const WISDOM_ITEM_URL = 'https://www.mousehuntgame.com/item.php?item_type=wisdom_stat_item';

// What each title unlocks, keyed by title id.
const PERKS_BY_TITLE: Record<string, string[]> = {
  novice: ['Access to 1 of 70 locations in the Kingdom', 'Your starting title', 'Hunt in the Meadow'],
  recruit: ['Access to 2 of 70 locations in the Kingdom', 'Hunt in the Town of Gnawnia'],
  apprentice: [
    'Access to 5 of 70 locations in the Kingdom',
    "Hunt at the Windmill, the King's Arms, and the Tournament Hall",
  ],
  initiate: ['Access to 6 of 70 locations in the Kingdom', 'Hunt at the Harbour', 'Combine 2 items while crafting'],
  journeyman: [
    'Access to 8 of 70 locations in the Kingdom',
    'Hunt in the Mountain and the Calm Clearing',
    'Combine 3 items while crafting',
    'Use Charms by visiting the Charm Shoppe in the Mountain',
  ],
  master: [
    'Access to 12 of 70 locations in the Kingdom',
    'Hunt in the Laboratory, Town of Digby, Mousoleum, and the Great Gnarled Tree',
    'Combine 4 items while crafting',
  ],
  grandmaster: [
    'Access to 18 of 70 locations in the Kingdom',
    'Hunt in the Bazaar, Training Grounds, Dojo, Meditation Room, Pinnacle Chamber, and the Lagoon',
    'Combine 5 items while crafting',
  ],
  legendary: [
    'Access to 26 of 70 locations in the Kingdom',
    'Hunt in the Catacombs, Forbidden Grove, Acolyte Realm, S.S. Huntington IV, Cape Clawed, Elub Shore, Nerg Plains, and the Derr Dunes',
    'Open Scavenger Hunt Scrolls',
    'Combine 6 items while crafting',
  ],
  hero: [
    'Access to 29 of 70 locations in the Kingdom',
    "Hunt in the Jungle of Dread, the King's Gauntlet, and the Toxic Spill",
    'Toxic Spill: Limited contamination level clearance granted',
    'Combine 7 items while crafting',
  ],
  knight: [
    'Access to 31 of 70 locations in the Kingdom',
    "Hunt in Dracano and Balack's Cove",
    'Toxic Spill: Higher contamination level clearance granted',
    'Combine 8 items while crafting',
  ],
  lord_lady: [
    'Access to 38 of 70 locations in the Kingdom',
    "Hunt in the Seasonal Garden, Zugzwang's Tower, Crystal Library, Slushy Shoreline, the Iceberg, Claw Shot City, and Gnawnian Express Station",
    'Toxic Spill: Higher contamination level clearance granted',
    'Combine 9 items while crafting',
  ],
  baron_baroness: [
    'Access to 44 of 70 locations in the Kingdom',
    'Hunt at Fort Rox, Fiery Warpath, Muridae Market, Living Garden, Lost City, and Sand Dunes',
    'Toxic Spill: Higher contamination level clearance granted',
    'Combine 10 items while crafting',
    'Charge your Tower Amplifier to 160% when hunting in the Seasonal Garden',
  ],
  count_countess: [
    'Access to 50 of 70 locations in the Kingdom',
    'Hunt at the Gnawnian Rift, Queso River, Prickly Plains, Cantera Quarry, Queso Geyser, and the Sunken City',
    'Toxic Spill: Higher contamination level clearance granted',
    'Combine 11 items while crafting',
    'Charge your Tower Amplifier to 175% when hunting in the Seasonal Garden',
  ],
  duke_dutchess: [
    'Access to 55 of 70 locations in the Kingdom',
    'Hunt at the Burroughs Rift, Whisker Woods Rift, Fungal Cavern, Labyrinth, and Zokor',
    'Toxic Spill: Higher contamination level clearance granted',
    'Combine 12 items while crafting',
  ],
  grand_duke: [
    'Access to 58 of 70 locations in the Kingdom',
    'Hunt at the Furoma Rift, Bristle Woods Rift, and Moussu Picchu',
    'Toxic Spill: Higher contamination level clearance granted',
  ],
  archduke_archduchess: [
    'Access to 64 of 70 locations in the Kingdom',
    'Hunt at the Valour Rift, Floating Islands, Cerulean Skyport, Foreword Farm, Prologue Pond, and Table of Contents',
    'Toxic Spill: Maximum contamination level clearance granted',
  ],
  viceroy: [
    'Access to 70 of 70 locations in the Kingdom',
    'Hunt at the Bountiful Beanstalk, School of Sorcery, Draconic Depths, Afterword Acres, Epilogue Falls, and Conclusion Cliffs',
  ],
  elder: ['Access to 70 of 70 locations in the Kingdom', 'Combine 13 items while crafting'],
  sage: ['Access to 70 of 70 locations in the Kingdom', 'Combine 14 items while crafting'],
  fabled: ['Access to 70 of 70 locations in the Kingdom', 'Combine 15 items while crafting'],
};

export default function TitlesPage() {
  const titles = getTitles();

  return (
    <div>
      <PageHeader
        title="Titles and ranks"
        description={
          <>
            Your rank climbs as you stack{' '}
            <a
              href={WISDOM_ITEM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-700 underline decoration-amber-300 underline-offset-2 transition-colors hover:text-amber-800 hover:decoration-amber-500 dark:text-amber-300 dark:decoration-amber-700 dark:hover:text-amber-200"
            >
              wisdom
            </a>{' '}
            from catching mice. The{' '}
            <Link
              href="/rank-up-calculator"
              className="font-medium text-amber-700 underline decoration-amber-300 underline-offset-2 transition-colors hover:text-amber-800 hover:decoration-amber-500 dark:text-amber-300 dark:decoration-amber-700 dark:hover:text-amber-200"
            >
              rank-up calculator
            </Link>{' '}
            works out how much more you need.
          </>
        }
        count={titles.length}
        countLabel="ranks"
        icon={TrophyIcon}
        iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      />

      <ol className="space-y-4">
        {titles.map((title) => {
          const wisdom = WISDOM_BY_TITLE[title.id];
          const perks = PERKS_BY_TITLE[title.id] ?? [];

          return (
            <li
              key={title.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={titleImageUrl(title.id)}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  className="size-10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title.name}</div>
                  {wisdom !== undefined && (
                    <div className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                      {wisdom.toLocaleString('en-US')} wisdom
                    </div>
                  )}
                </div>
              </div>

              {perks.length > 0 && (
                <ul className="mt-4 space-y-2 border-l-2 border-amber-200 pl-4 text-sm text-zinc-600 dark:border-amber-900/60 dark:text-zinc-300">
                  {perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
