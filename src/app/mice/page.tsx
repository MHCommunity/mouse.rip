import React, { Suspense } from 'react';

import { MouseIcon } from '@/components/game-icons';
import { PageHeader } from '@/components/page-header';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Link } from '@/components/link';

import { getAllMice, getAllMiceGroups } from '@/lib/game-data';
import { pageMetadata } from '@/seo';
import { MiceBrowser, type SlimGroup } from './mice-browser';

export const metadata = pageMetadata({
  title: 'MouseHunt Mice & Groups',
  description:
    'Every mouse in MouseHunt. Browse by group, or search and filter by power-type weakness to find stats, minlucks, and attraction rates.',
  path: '/mice',
});

export default function MiceIndexPage() {
  // Only the count and the group cards cross to the client. The mouse list is a
  // code-split chunk the browser fetches on demand (see @/lib/client-index).
  const mice = getAllMice();

  const groups: SlimGroup[] = getAllMiceGroups().map((group) => ({
    slug: group.id,
    name: group.name,
    count: group.mouse_ids.length,
    description: group.description_short || undefined,
  }));

  return (
    <div>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Mice' }]} />
      <PageHeader
        title="Mice"
        description={
          <>
            Every mouse in MouseHunt, with stats, minlucks, and the best cheese and location to catch each one. You can
            also{' '}
            <Link
              href="/mice/rankings"
              className="font-medium text-pink-700 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200"
            >
              rank them by points, gold, or wisdom
            </Link>
            .
          </>
        }
        count={mice.length}
        countLabel="mice"
        icon={MouseIcon}
        iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      />

      {/* MiceBrowser reads the filters off the URL with useSearchParams, which
          would opt this page into dynamic rendering without a boundary here. The
          page must stay static: game-data reads its JSON off disk at build time,
          and that disk isn't there in the Cloudflare worker. */}
      <Suspense>
        <MiceBrowser groups={groups} />
      </Suspense>
    </div>
  );
}
