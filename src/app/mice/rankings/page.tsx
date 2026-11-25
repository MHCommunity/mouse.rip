import React, { Suspense } from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHeader } from '@/components/page-header';

import { getAllMice, mouseSlug } from '@/lib/game-data';
import { pageMetadata } from '@/seo';
import { RankingsTable, RankingsTableFromUrl, type RankedMouse } from './rankings-table';

export const metadata = pageMetadata({
  title: 'MouseHunt Mice Ranked by Points, Gold & Wisdom',
  description: 'Every MouseHunt mouse ranked by the points, gold, and wisdom it gives when caught.',
  path: '/mice/rankings',
});

export default function MouseRankingsPage() {
  const mice: RankedMouse[] = getAllMice().map((mouse) => ({
    slug: mouseSlug(mouse.type),
    name: mouse.name,
    group: mouse.group,
    points: mouse.points,
    gold: mouse.gold,
    wisdom: mouse.wisdom,
  }));

  return (
    <div>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Mice', href: '/mice' }, { name: 'Rankings' }]} />
      <PageHeader
        title="Mice ranked"
        description="Every mouse by the points, gold, or wisdom it gives when caught. Mice with the same value share a rank."
        count={mice.length}
        countLabel="mice"
      />
      {/* The table reads ?by= and ?group= with useSearchParams, which needs a Suspense boundary to prerender. */}
      <Suspense fallback={<RankingsTable mice={mice} initialBy="points" initialGroup="" syncUrl={false} />}>
        <RankingsTableFromUrl mice={mice} />
      </Suspense>
    </div>
  );
}
