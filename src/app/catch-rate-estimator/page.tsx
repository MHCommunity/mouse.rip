import React, { Suspense } from 'react';

import { ScaleIcon } from '@heroicons/react/20/solid';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHeader } from '@/components/page-header';
import { PageLink } from '@/components/page-link';

import { ogCard, pageMetadata } from '@/seo';
import { CatchRateEstimator, CatchRateEstimatorFromUrl } from './estimator';

export const metadata = pageMetadata({
  title: 'MouseHunt Catch Rate Estimator',
  description:
    'Pick a MouseHunt location, cheese and trap setup to see the attraction rate, catch rate and minluck for every mouse there.',
  path: '/catch-rate-estimator',
  image: ogCard({ title: 'Catch rate estimator', eyebrow: 'MouseHunt tool', icon: 'scale', accent: 'pink' }),
});

export default function CatchRateEstimatorPage() {
  return (
    <div>
      <Breadcrumbs
        items={[{ name: 'Home', href: '/' }, { name: 'Tools', href: '/tools' }, { name: 'Catch rate estimator' }]}
      />
      <PageHeader
        title="Catch rate estimator"
        description={
          <>
            Pick where you’re hunting and your trap to see how often you’ll attract and catch each mouse there. Built on{' '}
            <PageLink href="https://tsitu.github.io/MH-Tools/cre.html">tsitu’s catch rate estimator</PageLink>, with
            attraction rates from <PageLink href="https://www.mhct.win/">MHCT</PageLink>.
          </>
        }
        icon={ScaleIcon}
        iconClassName="bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
      />
      {/* The estimator reads a shared link with useSearchParams, which needs a Suspense boundary to prerender. */}
      <Suspense fallback={<CatchRateEstimator syncUrl={false} />}>
        <CatchRateEstimatorFromUrl />
      </Suspense>
    </div>
  );
}
