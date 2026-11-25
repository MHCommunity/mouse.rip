'use client';

import React, { useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Link } from '@/components/link';
import { SectionHeading } from '@/components/section-heading';
import type { TrapEffect } from '@/types';

export interface EffectLocation {
  /** The location's id where it has a page, otherwise a slug of its name. Used in ?location=. */
  key: string;
  name: string;
  region: string;
  href?: string;
  effects: TrapEffect[];
}

export interface SharedEffect extends TrapEffect {
  key: string;
  locations: Pick<EffectLocation, 'key' | 'name' | 'href'>[];
}

interface BrowserProps {
  locations: EffectLocation[];
  shared: SharedEffect[];
}

const selectClasses =
  'w-full rounded-lg border border-zinc-950/10 bg-white px-3 py-2.5 text-base/6 text-zinc-950 shadow-sm hover:border-zinc-950/20 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 sm:py-1.5 sm:text-sm/6 dark:border-white/10 dark:bg-white/5 dark:text-white dark:scheme-dark dark:hover:border-white/20';

const linkClasses = 'hover:text-green-700 hover:underline dark:hover:text-green-300';

export function EffectsBrowserFromUrl(props: BrowserProps) {
  const searchParams = useSearchParams();
  return <EffectsBrowser {...props} initialLocation={searchParams.get('location') ?? ''} syncUrl />;
}

export function EffectsBrowser({
  locations,
  shared,
  initialLocation,
  syncUrl,
}: BrowserProps & {
  initialLocation: string;
  /** Off for the prerendered fallback, which mustn't rewrite a link it couldn't read. */
  syncUrl: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState(initialLocation);
  const pickerRef = useRef<HTMLDivElement>(null);
  const current = locations.find((location) => location.key === selected);

  const choose = (key: string) => {
    setSelected(key);
    if (!syncUrl) return;
    const params = new URLSearchParams(window.location.search);
    if (key) params.set('location', key);
    else params.delete('location');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const regions: { region: string; locations: EffectLocation[] }[] = [];
  for (const location of locations) {
    let group = regions.find((r) => r.region === location.region);
    if (!group) {
      group = { region: location.region, locations: [] };
      regions.push(group);
    }
    group.locations.push(location);
  }

  const sharedKeys = new Set(shared.map((effect) => effect.key));
  const isShared = (effect: TrapEffect) => sharedKeys.has(`${effect.name}\n${effect.effect}`);

  return (
    <>
      <div ref={pickerRef} className="max-w-xs scroll-mt-20">
        <label htmlFor="effects-location" className="block text-sm font-medium text-zinc-950 dark:text-white">
          Location
        </label>
        <select
          id="effects-location"
          className={`${selectClasses} mt-1.5`}
          value={current ? current.key : ''}
          onChange={(event) => choose(event.target.value)}
        >
          <option value="">All locations</option>
          {regions.map(({ region, locations: inRegion }) => (
            <optgroup key={region} label={region}>
              {inRegion.map((location) => (
                <option key={location.key} value={location.key}>
                  {location.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {current ? (
        <div className="mt-8">
          <LocationCard location={current} effects={current.effects} />
          <button
            type="button"
            onClick={() => choose('')}
            className="mt-4 text-sm font-medium text-pink-700 hover:text-pink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-pink-300 dark:hover:text-pink-200"
          >
            Show all locations
          </button>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {shared.length > 0 && (
            <section aria-labelledby="shared-effects-heading">
              <SectionHeading id="shared-effects-heading">In many locations</SectionHeading>
              <dl className="mt-4 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white px-5 shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {shared.map((effect) => (
                  <div
                    key={effect.key}
                    className="grid grid-cols-1 gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[minmax(0,14rem)_1fr]"
                  >
                    <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{effect.name}</dt>
                    <dd className="text-sm text-zinc-600 dark:text-zinc-400">
                      <p className="text-zinc-800 dark:text-zinc-200">{effect.effect}</p>
                      <p className="mt-1">
                        {effect.locations.length} locations:{' '}
                        {effect.locations.map((location, i) => (
                          <React.Fragment key={location.key}>
                            {i > 0 && ', '}
                            <button
                              type="button"
                              onClick={() => {
                                choose(location.key);
                                pickerRef.current?.scrollIntoView({ block: 'start' });
                              }}
                              className={`${linkClasses} focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500`}
                            >
                              {location.name}
                            </button>
                          </React.Fragment>
                        ))}
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {regions.map(({ region, locations: inRegion }) => {
            const cards = inRegion
              .map((location) => ({ location, effects: location.effects.filter((effect) => !isShared(effect)) }))
              .filter(({ effects }) => effects.length > 0);
            if (cards.length === 0) return null;
            return (
              <section key={region}>
                <SectionHeading>{region}</SectionHeading>
                <div className="mt-4 space-y-4">
                  {cards.map(({ location, effects }) => (
                    <LocationCard key={location.key} location={location} effects={effects} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

function LocationCard({ location, effects }: { location: EffectLocation; effects: TrapEffect[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
        {location.href ? (
          <Link href={location.href} className={linkClasses}>
            {location.name}
          </Link>
        ) : (
          location.name
        )}
      </h3>
      <dl className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800">
        {effects.map((effect) => (
          <div
            key={`${effect.name}-${effect.effect}`}
            className="grid grid-cols-1 gap-x-4 gap-y-0.5 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr]"
          >
            <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{effect.name}</dt>
            <dd className="text-sm text-zinc-600 dark:text-zinc-400">{effect.effect}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
