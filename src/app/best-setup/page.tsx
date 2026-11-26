import React, { Suspense } from 'react';

import { TrophyIcon } from '@heroicons/react/20/solid';
import { PageHeader } from '@/components/page-header';
import { PageLink } from '@/components/page-link';

import { pageMetadata } from '@/seo';
import { BestSetup, BestSetupFromUrl } from './best-setup';

export const metadata = pageMetadata({
  title: 'MouseHunt Best Setup',
  description:
    'Find the MouseHunt weapon, base and charm that catch the most mice for a location and cheese, or the best setup for one mouse.',
  path: '/best-setup',
});

export default function BestSetupPage() {
  return (
    <div className="warm">
      <PageHeader
        title="Best setup"
        description={
          <>
            Pick where you’re hunting to rank every weapon and base by how many mice they’d catch, or aim for one mouse.
            Built on <PageLink href="https://tsitu.github.io/MH-Tools/setup.html">tsitu’s Best Setup</PageLink>, with
            the same catch rates as the <PageLink href="/catch-rate-estimator">catch rate estimator</PageLink>.
          </>
        }
        icon={TrophyIcon}
        iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      />
      {/* Best Setup reads a shared link with useSearchParams, which needs a Suspense boundary to prerender. */}
      <Suspense fallback={<BestSetup syncUrl={false} />}>
        <BestSetupFromUrl />
      </Suspense>
    </div>
  );
}
