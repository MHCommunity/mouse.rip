import React from 'react';

import { MouseIcon } from '@/components/game-icons';
import { PageHeader } from '@/components/page-header';

import { getAllMice, getAllMiceGroups, groupSlugForName, mouseSlug } from '@/lib/game-data';
import { bestPowerTypes } from '@/lib/power-types';
import { pageMetadata } from '@/seo';
import { MiceBrowser, type SlimGroup, type SlimMouse } from './mice-browser';

export const metadata = pageMetadata({
  title: 'MouseHunt Mice & Groups',
  description:
    'Every mouse in MouseHunt — browse by group, or search and filter by power-type weakness to find stats, minlucks, attraction rates, and loot.',
  path: '/mice',
});

export default function MiceIndexPage() {
  const mice = getAllMice();

  const slim: SlimMouse[] = mice.map((mouse) => ({
    id: mouse.id,
    name: mouse.name,
    slug: mouseSlug(mouse.type),
    group: mouse.group || 'Other',
    groupSlug: groupSlugForName(mouse.group),
    subgroup: mouse.subgroup || undefined,
    power: bestPowerTypes(mouse.effectivenesses as Record<string, number | undefined>),
  }));

  const groups: SlimGroup[] = getAllMiceGroups().map((group) => ({
    slug: group.id,
    name: group.name,
    count: group.mouse_ids.length,
    description: group.description_short || undefined,
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Mice"
        description="Browse every mouse by group, or search by name and filter by power-type weakness. Each mouse has its own page with stats, minlucks, attraction rates, and loot."
        count={mice.length}
        countLabel="mice"
        icon={MouseIcon}
        iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      />

      <MiceBrowser mice={slim} groups={groups} />
    </div>
  );
}
