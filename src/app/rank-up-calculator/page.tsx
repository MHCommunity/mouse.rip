import React, { Suspense } from 'react';

import { ArrowTrendingUpIcon } from '@heroicons/react/20/solid';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHeader } from '@/components/page-header';
import { PageLink } from '@/components/page-link';

import { titleImageUrl } from '@/lib/image-urls';
import { getTitles } from '@/lib/site-data';
import { WISDOM_BY_TITLE } from '@/lib/titles';
import { pageMetadata } from '@/seo';
import { RankUpCalculator, RankUpCalculatorFromUrl, type RankTitle } from './rank-up-calculator';

export const metadata = pageMetadata({
  title: 'MouseHunt Rank-Up Calculator',
  description:
    'How much wisdom you need to reach your next MouseHunt title, or any title after it, and how many catches of a mouse that takes.',
  path: '/rank-up-calculator',
});

export default function RankUpCalculatorPage() {
  const titles: RankTitle[] = getTitles()
    .filter((title) => WISDOM_BY_TITLE[title.id] !== undefined)
    .sort((a, b) => a.order - b.order)
    .map((title) => ({
      id: title.id,
      name: title.name,
      wisdom: WISDOM_BY_TITLE[title.id],
      image: titleImageUrl(title.id),
    }));

  return (
    <div className="max-w-3xl">
      <Breadcrumbs
        items={[{ name: 'Home', href: '/' }, { name: 'Tools', href: '/tools' }, { name: 'Rank-up calculator' }]}
      />
      <PageHeader
        title="Rank-up calculator"
        description={
          <>
            How much more wisdom you need for your next title, or any title after it. Your exact wisdom is the{' '}
            <PageLink href="https://www.mousehuntgame.com/item.php?item_type=wisdom_stat_item">Wisdom</PageLink> item in
            your inventory.
          </>
        }
        icon={ArrowTrendingUpIcon}
        iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      />
      {/* The calculator reads a shared link's entries with useSearchParams, which needs a Suspense boundary to prerender. */}
      <Suspense fallback={<RankUpCalculator titles={titles} syncUrl={false} />}>
        <RankUpCalculatorFromUrl titles={titles} />
      </Suspense>
    </div>
  );
}
