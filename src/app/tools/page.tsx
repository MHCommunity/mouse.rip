import { getResourcesByCategory } from '@/lib/site-data';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';
import { SectionHeading } from '@/components/section-heading';
import { isInternalPath } from '@/utils';
import { WrenchIcon } from '@heroicons/react/20/solid';
import { pageMetadata } from '@/seo';

import React from 'react';

export const metadata = pageMetadata({
  title: 'MouseHunt Tools',
  description: 'MouseHunt calculators, simulators, and lookups for catch rates, minlucks, and Marketplace prices.',
  path: '/tools',
});

export default async function Tools() {
  const items = getResourcesByCategory('tool');
  // The ones that run here first: they answer without leaving the site.
  const onSite = items.filter((item) => isInternalPath(item.url));
  const elsewhere = items.filter((item) => !isInternalPath(item.url));

  return (
    <>
      <PageHeader
        title="MouseHunt tools"
        description="Catch rate estimators, minluck lookups, simulators, and Marketplace price history."
        count={items.length}
        countLabel="tools"
        icon={WrenchIcon}
        iconClassName="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      />
      {onSite.length > 0 && (
        <section aria-labelledby="tools-here" className="mt-10">
          <SectionHeading id="tools-here">On mouse.rip</SectionHeading>
          <ItemList items={onSite} headingLevel={3} showCategory={false} compact />
        </section>
      )}
      {elsewhere.length > 0 && (
        <section aria-labelledby="tools-elsewhere" className="mt-10">
          <SectionHeading id="tools-elsewhere">On other sites</SectionHeading>
          <ItemList items={elsewhere} headingLevel={3} showCategory={false} compact />
        </section>
      )}
    </>
  );
}
