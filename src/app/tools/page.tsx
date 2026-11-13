import { getResourcesByCategory } from '@/lib/site-data';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';
import { SectionHeading } from '@/components/section-heading';
import { WrenchIcon } from '@heroicons/react/20/solid';
import { pageMetadata } from '@/seo';
import { isOurUrl } from '@/utils';

import React from 'react';

export const metadata = pageMetadata({
  title: 'MouseHunt Tools',
  description:
    'Calculators, simulators, and lookups for MouseHunt — plan your setups, crunch the numbers, and get more out of every hunt.',
  path: '/tools',
});

export default async function Tools() {
  const items = getResourcesByCategory('tool');
  // Split what runs here from what we link out to, so hunters can tell them apart.
  const onSite = items.filter((item) => isOurUrl(item.url));
  const community = items.filter((item) => !isOurUrl(item.url));

  return (
    <>
      <PageHeader
        title="MouseHunt tools"
        description="Calculators, simulators, and lookups to plan setups and get more out of every hunt."
        count={items.length}
        countLabel="tools"
        icon={WrenchIcon}
        iconClassName="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      />

      {onSite.length > 0 && (
        <section aria-labelledby="on-site-tools" className="mt-10">
          <SectionHeading>
            <span id="on-site-tools">On mouse.rip</span>
          </SectionHeading>
          <ItemList items={onSite} headingLevel={3} showCategory={false} />
        </section>
      )}

      {community.length > 0 && (
        <section aria-labelledby="community-tools" className="mt-12">
          <SectionHeading>
            <span id="community-tools">Community tools</span>
          </SectionHeading>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Built and run by other hunters. These open on their own sites.
          </p>
          <ItemList items={community} headingLevel={3} showCategory={false} />
        </section>
      )}
    </>
  );
}
