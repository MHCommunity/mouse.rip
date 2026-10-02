import React from 'react';

import { ArrowTrendingUpIcon } from '@heroicons/react/20/solid';
import { PageHeader } from '@/components/page-header';

import { pageMetadata } from '@/seo';
import { MarketplaceBrowser } from './marketplace-browser';

export const metadata = pageMetadata({
  title: 'MouseHunt Marketplace Prices',
  description:
    'Live marketplace prices for every tradable MouseHunt item — gold price, SB price, and trade volume, powered by Markethunt.',
  path: '/marketplace',
});

export default function MarketplacePage() {
  return (
    <div>
      <PageHeader
        title="Marketplace"
        description="Live gold and SUPER|brie+ prices for every tradable item, with daily trade volume. Sort and filter, then open any item for its full price history."
        icon={ArrowTrendingUpIcon}
        iconClassName="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
      />

      <MarketplaceBrowser />
    </div>
  );
}
