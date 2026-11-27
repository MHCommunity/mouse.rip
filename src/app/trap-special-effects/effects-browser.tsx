'use client';

import React, { useRef, useState, useSyncExternalStore } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { usePathname, useRouter } from 'next/navigation';

import { GameImage } from '@/components/game-image';
import { Link } from '@/components/link';
import { SectionHeading } from '@/components/section-heading';
import type { TrapEffect as SheetEffect } from '@/types';

/** An item the effect names, matched from the sheet's wording. */
export interface EffectItem {
  name: string;
  href: string;
  image: string;
}

type TrapEffect = SheetEffect & { items?: EffectItem[] };

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
  'w-full rounded-lg border border-zinc-950/45 bg-white px-3 py-2.5 text-base/6 text-zinc-950 shadow-sm hover:border-zinc-950/60 focus:border-pink-500 focus:outline-hidden focus:ring-2 focus:ring-pink-500 sm:py-1.5 sm:text-sm/6 dark:border-white/35 dark:bg-white/5 dark:text-white dark:scheme-dark dark:hover:border-white/45';

const linkClasses =
  'underline decoration-zinc-300 underline-offset-2 hover:text-pink-700 hover:decoration-current dark:decoration-zinc-600 dark:hover:text-pink-300';

const noSubscribe = () => () => {};

export function EffectsBrowser({ locations, shared }: BrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  // The page is prerendered with every location showing, and a ?location= link narrows it once it's running. The
  // address is read this way and not with useSearchParams: that hook makes the browser throw away the prerendered
  // list (some 2,700 elements) and build it again, link or no link.
  const linked = useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).get('location') ?? '',
    () => '',
  );
  // What the visitor picks here wins over the link they came in on.
  const [picked, setPicked] = useState<string | null>(null);
  const selected = picked ?? linked;
  const pickerRef = useRef<HTMLDivElement>(null);
  const current = locations.find((location) => location.key === selected);

  const choose = (key: string) => {
    setPicked(key);
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
          <LocationCard location={current} effects={current.effects} heading="h2" />
          <button
            type="button"
            onClick={() => {
              choose('');
              document.getElementById('effects-location')?.focus({ preventScroll: true });
            }}
            className="mt-4 text-sm font-medium text-pink-700 hover:text-pink-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-pink-300 dark:hover:text-pink-200"
          >
            Show all locations
          </button>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {shared.length > 0 && (
            <section aria-labelledby="shared-effects-heading">
              <SectionHeading id="shared-effects-heading">In many locations</SectionHeading>
              <dl className="mt-4 divide-y divide-zinc-100 rounded-2xl ring-1 ring-zinc-200 bg-white px-5 shadow-xs dark:divide-zinc-800 dark:ring-zinc-800 dark:bg-zinc-900">
                {shared.map((effect) => (
                  <div
                    key={effect.key}
                    className="grid grid-cols-1 gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[minmax(0,14rem)_1fr]"
                  >
                    <dt>
                      <EffectName effect={effect} />
                    </dt>
                    <dd className="text-sm text-zinc-600 dark:text-zinc-400">
                      <p className="text-zinc-800 dark:text-zinc-200">{effect.effect}</p>
                      <p className="mt-1">
                        {effect.locations.length} locations:{' '}
                        {effect.locations.map((location, i) => (
                          <React.Fragment key={location.key}>
                            {i > 0 && ' '}
                            <span className="whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  choose(location.key);
                                  pickerRef.current?.scrollIntoView({ block: 'start' });
                                  // This button is about to be replaced by the location's own view.
                                  document.getElementById('effects-location')?.focus({ preventScroll: true });
                                }}
                                className={`${linkClasses} focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500`}
                              >
                                {location.name}
                              </button>
                              {i < effect.locations.length - 1 && ','}
                            </span>
                          </React.Fragment>
                        ))}
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section aria-labelledby="region-effects-heading">
            <SectionHeading id="region-effects-heading">By region</SectionHeading>
            {/* Folded, since every region open runs to thousands of pixels. Find in page still opens a match. */}
            <div className="mt-4 space-y-3">
              {regions.map(({ region, locations: inRegion }) => {
                const cards = inRegion
                  .map((location) => ({ location, effects: location.effects.filter((effect) => !isShared(effect)) }))
                  .filter(({ effects }) => effects.length > 0);
                if (cards.length === 0) return null;
                const effectCount = cards.reduce((sum, { effects }) => sum + effects.length, 0);
                return (
                  <details
                    key={region}
                    className="group rounded-2xl ring-1 ring-zinc-200 bg-white shadow-xs dark:ring-zinc-800 dark:bg-zinc-900"
                  >
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-3 hover:bg-pink-50/50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:hover:bg-pink-950/20 [&::-webkit-details-marker]:hidden">
                      <span>
                        <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{region}</span>
                        <span className="mt-0.5 block text-xs/5 text-zinc-600 dark:text-zinc-400">
                          {cards.length} {cards.length === 1 ? 'location' : 'locations'}, {effectCount}{' '}
                          {effectCount === 1 ? 'effect' : 'effects'}
                        </span>
                      </span>
                      <ChevronDownIcon
                        className="size-5 shrink-0 text-zinc-500 transition-transform group-open:rotate-180 motion-reduce:transition-none dark:text-zinc-400"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="divide-y divide-zinc-100 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                      {cards.map(({ location, effects }) => (
                        <LocationEffects key={location.key} location={location} effects={effects} />
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function LocationCard({
  location,
  effects,
  heading,
}: {
  location: EffectLocation;
  effects: TrapEffect[];
  heading?: 'h2' | 'h3';
}) {
  return (
    <div className="rounded-2xl ring-1 ring-zinc-200 bg-white shadow-xs dark:ring-zinc-800 dark:bg-zinc-900">
      <LocationEffects location={location} effects={effects} heading={heading} />
    </div>
  );
}

function LocationEffects({
  location,
  effects,
  heading: Heading = 'h3',
}: {
  location: EffectLocation;
  effects: TrapEffect[];
  /** h2 when a location is shown by itself, straight under the page title; h3 under a region's heading. */
  heading?: 'h2' | 'h3';
}) {
  return (
    <div className="px-5 py-4">
      <Heading className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
        {location.href ? (
          <Link href={location.href} className={linkClasses}>
            {location.name}
          </Link>
        ) : (
          location.name
        )}
      </Heading>
      <dl className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800">
        {effects.map((effect) => (
          <div
            key={`${effect.name}-${effect.effect}`}
            className="grid grid-cols-1 gap-x-4 gap-y-0.5 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr]"
          >
            <dt>
              <EffectName effect={effect} />
            </dt>
            <dd className="text-sm text-zinc-600 dark:text-zinc-400">{effect.effect}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** The trap, base or charm with its picture; the name links to its page when it's one item. */
function EffectName({ effect }: { effect: TrapEffect }) {
  const items = effect.items ?? [];
  const single = items.length === 1 ? items[0] : undefined;
  return (
    <span className="flex items-start gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
      {items.length > 0 && (
        <span className="flex shrink-0 gap-1">
          {items.map((item) => (
            <Link key={item.href} href={item.href} title={item.name} className="shrink-0">
              <GameImage src={item.image} width={24} height={24} className="size-6 object-contain" />
              <span className="sr-only">{item.name}</span>
            </Link>
          ))}
        </span>
      )}
      {single ? (
        <Link href={single.href} className="pt-0.5 hover:text-pink-700 dark:hover:text-pink-300">
          {effect.name}
        </Link>
      ) : (
        <span className="pt-0.5">{effect.name}</span>
      )}
    </span>
  );
}
