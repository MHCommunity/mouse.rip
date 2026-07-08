import React from 'react';

import { TrophyIcon } from '@heroicons/react/20/solid';
import { PageHeader } from '@/components/page-header';

import { getTitles } from '@/data';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'MouseHunt Titles & Ranks',
  description:
    'Every MouseHunt hunter title from Novice to Fabled, in order — what each rank unlocks and the wisdom needed to reach it.',
  path: '/titles',
});

const WISDOM_ITEM_URL = 'https://www.mousehuntgame.com/item.php?item_type=wisdom_stat_item';

// Total wisdom required to reach each title, keyed by title id.
const WISDOM_BY_TITLE: Record<string, number> = {
  novice: 0,
  recruit: 2_000,
  apprentice: 5_000,
  initiate: 12_500,
  journeyman: 31_250,
  master: 65_440,
  grandmaster: 137_813,
  legendary: 303_188,
  hero: 667_013,
  knight: 1_467_428,
  lord_lady: 3_228_341,
  baron_baroness: 7_102_349,
  count_countess: 15_625_168,
  duke_dutchess: 34_375_370,
  grand_duke: 75_625_813,
  archduke_archduchess: 166_376_789,
  viceroy: 366_028_936,
  elder: 805_263_659,
  sage: 1_771_580_048,
  fabled: 3_897_476_106,
};

// What each title unlocks, keyed by title id.
const PERKS_BY_TITLE: Record<string, string[]> = {
  novice: ['Access to 1 of 70 locations in the Kingdom', 'Your starting title', 'Hunt in the Meadow'],
  recruit: ['Access to 3 of 70 locations in the Kingdom', 'Hunt in the Town of Gnawnia'],
  apprentice: [
    'Access to 6 of 70 locations in the Kingdom',
    "Hunt at the Windmill, the King's Arms, and the Tournament Hall",
  ],
  initiate: [
    'Access to 7 of 70 locations in the Kingdom',
    'Hunt at the Harbour',
    'Combine 2 items while crafting',
  ],
  journeyman: [
    'Access to 9 of 70 locations in the Kingdom',
    'Hunt in the Mountain and the Calm Clearing',
    'Combine 3 items while crafting',
    'Use Charms by visiting the Charm Shoppe in the Mountain',
  ],
  master: [
    'Access to 13 of 70 locations in the Kingdom',
    'Hunt in the Laboratory, Town of Digby, Mousoleum, and the Great Gnarled Tree',
    'Combine 4 items while crafting',
  ],
  grandmaster: [
    'Access to 19 of 70 locations in the Kingdom',
    'Hunt in the Bazaar, Training Grounds, Dojo, Meditation Room, Pinnacle Chamber, and the Lagoon',
    'Combine 5 items while crafting',
  ],
  legendary: [
    'Access to 27 of 70 locations in the Kingdom',
    'Hunt in the Catacombs, Forbidden Grove, Acolyte Realm, S.S. Huntington IV, Cape Clawed, Elub Shore, Nerg Plains, and the Derr Dunes',
    'Can now open Scavenger Hunt Scrolls',
    'Combine 6 items while crafting',
  ],
  hero: [
    'Access to 29 of 70 locations in the Kingdom',
    "Hunt in the Jungle of Dread, and the King's Gauntlet",
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
    'Access to 51 of 70 locations in the Kingdom',
    'Hunt at the Gnawnian Rift, Queso River, Prickly Plains, Cantera Quarry, Queso Geyser, and the Sunken City',
    'Toxic Spill: Higher contamination level clearance granted',
    'Combine 11 items while crafting',
    'Charge your Tower Amplifier to 175% when hunting in the Seasonal Garden',
  ],
  duke_dutchess: [
    'Access to 56 of 70 locations in the Kingdom',
    'Hunt at the Burroughs Rift, Whisker Woods Rift, Fungal Cavern, Labyrinth and Zokor',
    'Toxic Spill: Higher contamination level clearance granted',
    'Combine 12 items while crafting',
  ],
  grand_duke: [
    'Access to 59 of 70 locations in the Kingdom',
    'Hunt at the Furoma Rift, Bristle Woods Rift and Moussu Picchu',
    'Toxic Spill: Higher contamination level clearance granted',
  ],
  archduke_archduchess: [
    'Access to 64 of 70 locations in the Kingdom',
    'Hunt at the Valour Rift, Floating Islands, Foreword Farm, Prologue Pond, and Table of Contents',
    'Toxic Spill: Maximum contamination level clearance granted',
  ],
  viceroy: [
    'Access to 70 of 70 locations in the Kingdom',
    'Hunt at the Bountiful Beanstalk, School of Sorcery, Draconic Depths, Afterword Acres, Epilogue Falls, and Conclusion Cliffs',
  ],
  elder: ['Access to 70 of 70 locations in the Kingdom', 'Combine 13 items while crafting'],
  sage: ['Access to 70 of 70 locations in the Kingdom', 'Combine 14 items while crafting'],
  fabled: [
    'Access to 70 of 70 locations in the Kingdom',
    'Combine 15 items while crafting (reference the wiki for the locations)',
  ],
};

export default function TitlesPage() {
  const titles = getTitles();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Titles &amp; ranks"
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
            from catching mice. Here&rsquo;s what each title unlocks, and the wisdom it takes to get
            there.
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
                  src={title.icon}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  className="size-10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {title.name}
                  </div>
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
