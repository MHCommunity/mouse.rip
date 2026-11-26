'use client';

import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid';

import { GameImage } from '@/components/game-image';
import { Link } from '@/components/link';
import { SectionHeading } from '@/components/section-heading';
import { loadMouseIndex, loadPlannerData, type IndexedMouse } from '@/lib/client-index';
import { mouseImageUrl } from '@/lib/image-urls';
import {
  MIN_HUNTS,
  RATE_FLOOR,
  SORTS,
  buildPlan,
  formatHunts,
  formatRate,
  initialSetups,
  normalizeMouseName,
  parseMice,
  rankSetups,
  type PlannerData,
  type Place,
  type Row,
  type Setup,
  type SortKey,
} from '@/lib/map-plan';
import { formatNumber } from '@/utils';

const INITIAL_SETUPS = 20;
const OTHER_SETUPS_PER_MOUSE = 3;

const selectClasses =
  'rounded-lg border border-zinc-950/10 bg-white px-3 py-1.5 text-sm/6 text-zinc-950 shadow-sm hover:border-zinc-950/20 focus:border-pink-500 focus:outline-hidden focus:ring-2 focus:ring-pink-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:scheme-dark dark:hover:border-white/20';
const linkClasses = 'font-medium text-pink-700 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200';

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function MapPlannerFromUrl({ places }: { places: Record<string, Place> }) {
  const searchParams = useSearchParams();
  const initialIds = (searchParams.get('mice') ?? '')
    .split(',')
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => id > 0);
  return <MapPlanner places={places} initialIds={initialIds} syncUrl />;
}

export function MapPlanner({
  places,
  initialIds,
  syncUrl,
}: {
  places: Record<string, Place>;
  /** Mice from a shared ?mice= link. */
  initialIds: number[];
  /** Off for the prerendered fallback, which mustn't rewrite a link it couldn't read. */
  syncUrl: boolean;
}) {
  const [mice, setMice] = useState<IndexedMouse[] | null>(null);
  const [data, setData] = useState<PlannerData | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [text, setText] = useState('');
  const [sort, setSort] = useState<SortKey>('best');
  const [showAll, setShowAll] = useState(false);

  // A shared link's mice, kept from the first render so the load below fills them in once.
  const linkedIds = useRef(initialIds);

  useEffect(() => {
    let alive = true;
    Promise.all([loadMouseIndex(), loadPlannerData()])
      .then(([loadedMice, loadedData]) => {
        if (!alive) return;
        setMice(loadedMice);
        setData(loadedData);
        const byId = new Map(loadedMice.map((mouse) => [mouse.id, mouse]));
        const names = linkedIds.current.map((id) => byId.get(id)?.name).filter(Boolean);
        if (names.length > 0) setText((current) => current || names.join('\n'));
      })
      .catch(() => alive && setLoadFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const debouncedText = useDebouncedValue(text, 200);
  const { matched, unmatched } = useMemo(
    () => (mice ? parseMice(debouncedText, mice) : { matched: [], unmatched: [] }),
    [debouncedText, mice],
  );

  useEffect(() => {
    if (!syncUrl || !mice) return;
    const params = new URLSearchParams(window.location.search);
    if (matched.length > 0) params.set('mice', matched.map((mouse) => mouse.id).join(','));
    else params.delete('mice');
    const next = params.toString();
    window.history.replaceState(null, '', next ? `?${next}` : window.location.pathname);
  }, [matched, mice, syncUrl]);

  const plan = useMemo(
    () => (data && matched.length > 0 ? buildPlan(matched, data, places) : null),
    [matched, data, places],
  );
  const ranked = useMemo(() => (plan ? rankSetups(plan.setups, sort) : []), [plan, sort]);
  // Every mouse appears in the first view, even when its only setups rank low.
  const initial = useMemo(() => initialSetups(ranked, INITIAL_SETUPS), [ranked]);
  const visible = showAll ? ranked : initial;

  const removeMouse = (mouse: IndexedMouse) => {
    const names = new Set([normalizeMouseName(mouse.name), normalizeMouseName(mouse.abbreviated_name ?? '')]);
    setText((current) =>
      current
        .split(/[\n,;\t]+/)
        .filter((part) => !names.has(normalizeMouseName(part.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, ''))))
        .join('\n'),
    );
  };

  return (
    <div className="space-y-10">
      <section aria-labelledby="map-mice-heading" className="max-w-3xl">
        <label
          htmlFor="map-mice"
          id="map-mice-heading"
          className="block text-sm font-medium text-zinc-950 dark:text-white"
        >
          Mice on your map
        </label>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          One per line, or separated by commas. &ldquo;Mouse&rdquo; at the end is optional.
        </p>
        <textarea
          id="map-mice"
          rows={6}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setShowAll(false);
          }}
          placeholder={'Glazy\nAbominable Snow\nRelic Hunter'}
          spellCheck={false}
          className="mt-2 block w-full rounded-lg border border-zinc-950/45 bg-white px-3 py-2 text-base/6 text-zinc-950 shadow-sm placeholder:text-zinc-500 focus:border-pink-500 focus:outline-hidden focus:ring-2 focus:ring-pink-500/30 sm:text-sm/6 dark:border-white/35 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-400"
        />

        {loadFailed && (
          <p className="mt-3 text-sm text-red-700 dark:text-red-400">
            The attraction data didn&rsquo;t load. Refresh the page to try again.
          </p>
        )}

        {matched.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Mice in the plan">
            {matched.map((mouse) => (
              <li key={mouse.id}>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white py-0.5 pr-1 pl-1 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                  <GameImage src={mouseImageUrl(mouse.type)} width={20} height={20} className="size-5 shrink-0" />
                  {mouse.name}
                  <button
                    type="button"
                    onClick={() => removeMouse(mouse)}
                    aria-label={`Remove ${mouse.name}`}
                    className="rounded p-0.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    <XMarkIcon className="size-4" aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        {unmatched.length > 0 && (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Not recognised:{' '}
            {unmatched.map((name, index) => (
              <React.Fragment key={`${name}-${index}`}>
                {index > 0 && ', '}
                <span className="text-zinc-900 dark:text-zinc-100">{name}</span>
              </React.Fragment>
            ))}
            . Check the spelling against the mouse&rsquo;s page.
          </p>
        )}
      </section>

      {plan && (
        <>
          {plan.guaranteed.length > 0 && (
            <section aria-labelledby="guaranteed-heading">
              <SectionHeading id="guaranteed-heading">Guaranteed attractions</SectionHeading>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Each of these is attracted every hunt with the right setup.
              </p>
              <ul className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {plan.guaranteed.map((entry) => (
                  <li key={entry.mouse.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
                    <MouseName mouse={entry.mouse} />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      <PlaceName row={entry} places={places} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="setups-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <SectionHeading id="setups-heading">Where to hunt</SectionHeading>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {ranked.length > 0
                    ? `${formatNumber(ranked.length)} ${ranked.length === 1 ? 'setup attracts' : 'setups attract'} at least one of your mice at ${RATE_FLOOR}% or more.`
                    : `No setup attracts any of these mice at ${RATE_FLOOR}% or more.`}
                </p>
                {ranked.length > 0 && (
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="rounded border border-pink-300 bg-pink-50 px-1 text-pink-900 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100">
                      Pink
                    </span>{' '}
                    mice can only be planned at that location. Rates in italics have fewer than{' '}
                    {formatNumber(MIN_HUNTS)} hunts behind them.
                  </p>
                )}
              </div>
              {ranked.length > 1 && (
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  Sort
                  <select
                    className={selectClasses}
                    value={sort}
                    title={SORTS[sort].title}
                    onChange={(event) => setSort(event.target.value as SortKey)}
                  >
                    {(Object.keys(SORTS) as SortKey[]).map((key) => (
                      <option key={key} value={key} title={SORTS[key].title}>
                        {SORTS[key].label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <ol className="mt-4 space-y-3">
              {visible.map((setup) => (
                <SetupCard key={setup.key} setup={setup} places={places} rowsByMouse={plan.rowsByMouse} />
              ))}
            </ol>

            {!showAll && ranked.length > initial.length && (
              <button type="button" onClick={() => setShowAll(true)} className={clsx(linkClasses, 'mt-4 text-sm')}>
                Show all {formatNumber(ranked.length)} setups
              </button>
            )}
          </section>

          {(plan.hard.length > 0 || plan.noData.length > 0) && (
            <section aria-labelledby="leftover-heading">
              <SectionHeading id="leftover-heading">Harder to plan</SectionHeading>
              <ul className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {plan.hard.map((entry) => (
                  <li key={entry.mouse.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
                    <MouseName mouse={entry.mouse} />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Best is {formatRate(entry.rate)} at <PlaceName row={entry} places={places} />
                    </span>
                  </li>
                ))}
                {plan.noData.map((mouse) => (
                  <li key={mouse.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
                    <MouseName mouse={mouse} />
                    <span className="text-zinc-600 dark:text-zinc-400">No attraction data on MHCT</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function MouseName({ mouse }: { mouse: { name: string; type: string } }) {
  return (
    <Link
      href={`/mice/${mouse.type.replaceAll('_', '-')}`}
      className="inline-flex items-center gap-2 font-medium text-zinc-900 hover:text-pink-700 dark:text-zinc-100 dark:hover:text-pink-300"
    >
      <GameImage src={mouseImageUrl(mouse.type)} width={24} height={24} className="size-6 shrink-0" />
      {mouse.name}
    </Link>
  );
}

/** "Location (stage) with Cheese", the location linked when it has a page. */
function PlaceName({
  row,
  places,
}: {
  row: Pick<Row, 'location' | 'stage' | 'cheese' | 'charm'>;
  places: Record<string, Place>;
}) {
  const href = places[row.location]?.href;
  return (
    <>
      {href ? (
        <Link
          href={href}
          className="font-medium text-zinc-800 hover:text-pink-700 hover:underline dark:text-zinc-200 dark:hover:text-pink-300"
        >
          {row.location}
        </Link>
      ) : (
        <span className="font-medium text-zinc-800 dark:text-zinc-200">{row.location}</span>
      )}
      {row.stage && <> ({row.stage})</>} with {row.cheese}
      {row.charm && <> and {row.charm}</>}
    </>
  );
}

function SetupCard({
  setup,
  places,
  rowsByMouse,
}: {
  setup: Setup;
  places: Record<string, Place>;
  rowsByMouse: Map<number, Row[]>;
}) {
  const place = places[setup.location];
  // Name the stage only when it differs from this setup's.
  const alternatives = setup.alternatives.map((alt) =>
    alt.stage && alt.stage !== setup.stage ? `${alt.stage} with ${alt.cheese}` : alt.cheese,
  );

  return (
    <li className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex gap-3 px-4 pt-4 pb-3">
        {place?.image ? (
          <GameImage src={place.image} width={44} height={44} className="size-11 shrink-0 rounded-md object-cover" />
        ) : (
          <span aria-hidden="true" className="size-11 shrink-0 rounded-md bg-zinc-200 dark:bg-zinc-700" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-base font-semibold tracking-tight text-zinc-950 dark:text-white">
              {place?.href ? (
                <Link href={place.href} className="hover:text-pink-700 hover:underline dark:hover:text-pink-300">
                  {setup.location}
                </Link>
              ) : (
                setup.location
              )}
              {setup.stage && <span className="font-normal text-zinc-600 dark:text-zinc-400"> ({setup.stage})</span>}
            </h3>
            <p className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
              <span
                className="font-semibold text-zinc-950 dark:text-white"
                title="Chance one hunt attracts one of these mice"
              >
                {formatRate(setup.raw)}
              </span>{' '}
              per hunt, {setup.mice.length} {setup.mice.length === 1 ? 'mouse' : 'mice'},{' '}
              <span title="Expected hunts to attract every listed mouse at least once, not counting misses">
                {formatHunts(setup.hunts)}
              </span>
            </p>
          </div>
          <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">
            {setup.cheese}
            {alternatives.length > 0 && (
              <span className="text-zinc-600 dark:text-zinc-400">
                {' '}
                (or {alternatives.slice(0, 3).join(', ')}
                {alternatives.length > 3 && `, and ${alternatives.length - 3} more`})
              </span>
            )}
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-1.5 px-4 pb-3">
        {setup.mice.map((entry) => (
          <li
            key={entry.mouse.id}
            title={[
              entry.onlyHere ? 'The only location for this mouse' : '',
              entry.hunts < MIN_HUNTS ? `Only ${formatNumber(entry.hunts)} hunts recorded on MHCT` : '',
            ]
              .filter(Boolean)
              .join('. ')}
            className={clsx(
              'inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-sm',
              entry.onlyHere
                ? 'border-pink-300 bg-pink-50 text-pink-900 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100'
                : 'border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
            )}
          >
            <GameImage src={mouseImageUrl(entry.mouse.type)} width={20} height={20} className="size-5 shrink-0" />
            {entry.mouse.name}
            <span className={clsx('tabular-nums opacity-75', entry.hunts < MIN_HUNTS && 'italic')}>
              {formatRate(entry.rate)}
            </span>
          </li>
        ))}
      </ul>

      <details className="group border-t border-zinc-100 dark:border-zinc-800">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-zinc-400 dark:hover:text-white [&::-webkit-details-marker]:hidden">
          <ChevronDownIcon
            className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
          Other places for these mice
        </summary>
        <ul className="space-y-2 px-4 pb-4 text-sm">
          {setup.mice.map((entry) => {
            const others = (rowsByMouse.get(entry.mouse.id) ?? [])
              .filter(
                (row) => !(row.location === setup.location && row.stage === setup.stage && row.cheese === setup.cheese),
              )
              .slice(0, OTHER_SETUPS_PER_MOUSE);
            return (
              <li key={entry.mouse.id}>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{entry.mouse.name}</span>
                {others.length === 0 ? (
                  <span className="text-zinc-600 dark:text-zinc-400">: nowhere else at {RATE_FLOOR}% or more.</span>
                ) : (
                  <ul className="mt-0.5 space-y-0.5 text-zinc-600 dark:text-zinc-400">
                    {others.map((row) => (
                      <li key={`${row.location}|${row.stage}|${row.cheese}`}>
                        <span className="tabular-nums">{formatRate(row.rate)}</span> at{' '}
                        <PlaceName row={row} places={places} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </details>
    </li>
  );
}
