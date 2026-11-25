import React, { Suspense } from 'react';

import { SparklesIcon } from '@heroicons/react/20/solid';
import { PageHeader } from '@/components/page-header';
import { PageLink } from '@/components/page-link';

import { getLocations, getTrapEffects } from '@/lib/site-data';
import { pageMetadata } from '@/seo';
import { EffectsBrowser, EffectsBrowserFromUrl, type EffectLocation, type SharedEffect } from './effects-browser';

export const metadata = pageMetadata({
  title: 'Trap and Base Special Effects',
  description:
    'Which traps, bases, and charms have special effects in each MouseHunt location, such as bonus loot, instacatches, and attraction tweaks.',
  path: '/trap-special-effects',
});

/** An effect listed under this many locations or more is shown once, in its own section. */
const SHARED_MIN_LOCATIONS = 3;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function TrapSpecialEffectsPage() {
  const locationIdByName = new Map<string, string>();
  for (const region of getLocations()) {
    for (const location of region.locations) {
      locationIdByName.set(location.name.toLowerCase(), location.id.toString());
    }
  }

  const locations: EffectLocation[] = getTrapEffects()
    .filter((entry) => entry.effects.length > 0)
    .map((entry) => {
      const id = locationIdByName.get(entry.location.toLowerCase());
      return {
        key: id ?? slugify(entry.location),
        name: entry.location,
        region: entry.region,
        href: id ? `/locations/${id}` : undefined,
        effects: entry.effects,
      };
    });

  const byEffect = new Map<string, SharedEffect>();
  for (const location of locations) {
    for (const effect of location.effects) {
      const key = `${effect.name}\n${effect.effect}`;
      const shared = byEffect.get(key) ?? { ...effect, key, locations: [] };
      shared.locations.push({ key: location.key, name: location.name, href: location.href });
      byEffect.set(key, shared);
    }
  }
  const shared = [...byEffect.values()]
    .filter((effect) => effect.locations.length >= SHARED_MIN_LOCATIONS)
    .sort((a, b) => b.locations.length - a.locations.length);

  const props = { locations, shared };

  return (
    <div>
      <PageHeader
        title="Trap and base special effects"
        description={
          <>
            Traps, bases, and charms with special effects that only apply in certain locations, such as bonus loot,
            instacatches, and attraction tweaks. Adapted from the community{' '}
            <PageLink href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRg_s_It1mDCefWgwc-7Gexr5Hc7lKBztFue9kYZidI76iodSUan3BoGsagLCI1M26U_zG7uVMe9kgK/pubhtml?gid=0&single=true">
              Location Trap Effects
            </PageLink>{' '}
            spreadsheet.
          </>
        }
        icon={SparklesIcon}
        iconClassName="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      />

      {/* The browser reads ?location= with useSearchParams, which needs a Suspense boundary to prerender. */}
      <Suspense fallback={<EffectsBrowser {...props} initialLocation="" syncUrl={false} />}>
        <EffectsBrowserFromUrl {...props} />
      </Suspense>
    </div>
  );
}
