'use client';

import clsx from 'clsx';
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { GameImage } from '@/components/game-image';
import { ItemPicker } from '@/components/item-picker';
import { Link } from '@/components/link';
import type { Catalog } from '@/lib/catch-rate/data';
import { estimate, matchShownTotals, type Extras, type Setup } from '@/lib/catch-rate/engine';
import { EMPTY_SETUP, applyChanges, resolveStage, setupFromParams, setupToParams } from '@/lib/catch-rate/options';
import { mouseImageUrl } from '@/lib/image-urls';
import { powerTypeLabel } from '@/lib/power-types';
import { formatNumber } from '@/utils';

import {
  CatalogStatus,
  ExtrasCard,
  NumberField,
  Toggle,
  WhereFields,
  cardClasses,
  fieldClasses,
  hintClasses,
  labelClasses,
  useCatchRateCatalog,
  useItemOptions,
} from './fields';

const STORAGE_KEY = 'mouse.rip:catch-rate-estimator';
const ON_SERVER = 'server';

function readStorage(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    // Storage is blocked (private browsing, say); start fresh.
    return '';
  }
}
const noSubscribe = () => () => {};

/** "86.4%", but a whole 100% without the ".0". */
function percent(value: number, digits = 1): string {
  return value >= 100 - 0.5 * 10 ** -digits ? '100%' : `${value.toFixed(digits)}%`;
}

/** A shared link wins; without one, pick up the setup this device used last. */
export function CatchRateEstimatorFromUrl() {
  const params = useSearchParams();
  const stored = useSyncExternalStore(noSubscribe, readStorage, () => ON_SERVER);
  const linked = params.has('location') || params.has('weapon');
  const ready = linked || stored !== ON_SERVER;
  const initial = linked
    ? setupFromParams(new URLSearchParams(params.toString()))
    : ready && stored
      ? setupFromParams(new URLSearchParams(stored))
      : EMPTY_SETUP;
  // The estimator takes its setup once, so it mounts again when the saved one arrives.
  // Until the saved setup is read, don't save or touch the URL, or the empty first render would overwrite both.
  return <CatchRateEstimator key={ready ? 'ready' : 'server'} initial={initial} syncUrl={ready} />;
}

export function CatchRateEstimator({ initial = EMPTY_SETUP, syncUrl }: { initial?: Setup; syncUrl: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { catalog, failed } = useCatchRateCatalog();
  const [setup, setSetup] = useState<Setup>(initial);

  // Remember the setup on screen, including one opened from a link, for the next visit.
  useEffect(() => {
    if (!syncUrl) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, setupToParams(setup).toString());
    } catch {
      // Blocked storage only means the next visit starts fresh.
    }
  }, [setup, syncUrl]);

  const update = (next: Setup) => {
    setSetup(next);
    if (!syncUrl) return;
    const query = setupToParams(next).toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  if (!catalog) return <CatalogStatus failed={failed} />;
  return <EstimatorForm catalog={catalog} setup={setup} onChange={update} />;
}

function EstimatorForm({
  catalog,
  setup,
  onChange,
}: {
  catalog: Catalog;
  setup: Setup;
  onChange: (setup: Setup) => void;
}) {
  const options = useItemOptions(catalog, setup);

  const choose = (changes: Partial<Setup>) => onChange(applyChanges(catalog, setup, changes));
  const setExtra = <K extends keyof Extras>(key: K, value: Extras[K]) =>
    onChange({ ...setup, extras: { ...setup.extras, [key]: value } });

  // The data has Iceberg stages for each special base; the base picks which one.
  const resolved = { ...setup, stage: resolveStage(catalog, setup.location, setup.stage, setup.base) };
  const result = estimate(resolved, catalog);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <form className="min-w-0 space-y-4" aria-label="Your setup" onSubmit={(event) => event.preventDefault()}>
        <WhereFields catalog={catalog} setup={setup} onChange={onChange} />

        <fieldset className={clsx(cardClasses, 'space-y-4')}>
          <legend className="sr-only">Your trap</legend>
          <ItemPicker
            label="Weapon"
            options={options.weapons}
            value={setup.weapon}
            onChange={(weapon) => choose({ weapon })}
          />
          <ItemPicker label="Base" options={options.bases} value={setup.base} onChange={(base) => choose({ base })} />
          <ItemPicker
            label="Charm"
            options={options.charms}
            value={setup.charm}
            onChange={(charm) => choose({ charm })}
            placeholder="No charm"
            clearable
            clearLabel="No charm"
          />
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Toggle checked={setup.goldenShield} onChange={(goldenShield) => onChange({ ...setup, goldenShield })}>
              Golden Shield
            </Toggle>
            <Toggle checked={setup.riftstalker} onChange={(riftstalker) => onChange({ ...setup, riftstalker })}>
              Riftstalker Codex
            </Toggle>
          </div>
        </fieldset>

        <ExtrasCard catalog={catalog} setup={resolved} onExtra={setExtra} />

        <BonusCard catalog={catalog} setup={setup} onChange={onChange} />
      </form>

      <section aria-labelledby="results-heading" aria-live="polite" className="min-w-0">
        <h2 id="results-heading" className="sr-only">
          Catch rates
        </h2>
        <Results setup={resolved} result={result} />
      </section>
    </div>
  );
}

/** Bonuses the estimator can’t see, such as auras, with a helper that works them out from the camp. */
function BonusCard({ catalog, setup, onChange }: { catalog: Catalog; setup: Setup; onChange: (setup: Setup) => void }) {
  const [shownPower, setShownPower] = useState('');
  const [shownLuck, setShownLuck] = useState('');
  const matched =
    shownPower && shownLuck
      ? matchShownTotals(setup, catalog, { power: Number(shownPower), luck: Number(shownLuck) })
      : undefined;

  return (
    <details className={clsx(cardClasses, 'group')} open={Boolean(setup.bonusPower || setup.bonusLuck) || undefined}>
      <summary className="cursor-pointer text-sm font-medium text-zinc-950 marker:text-zinc-400 dark:text-white">
        Auras and other bonuses
        {(setup.bonusPower !== 0 || setup.bonusLuck !== 0) && (
          <span className="ml-2 text-xs font-normal text-pink-700 dark:text-pink-300">
            +{setup.bonusPower}% power, +{setup.bonusLuck} luck
          </span>
        )}
      </summary>
      <div className="mt-4 space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Auras, events and some location effects add power and luck that aren’t on the items. Add them here, or type in
          the power and luck your camp shows and let the estimator work them out.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Extra power bonus"
            hint="%"
            value={setup.bonusPower || undefined}
            min={-100}
            max={10000}
            onChange={(v) => onChange({ ...setup, bonusPower: v ?? 0 })}
          />
          <NumberField
            label="Extra luck"
            value={setup.bonusLuck || undefined}
            min={-100}
            max={1000}
            onChange={(v) => onChange({ ...setup, bonusLuck: v ?? 0 })}
          />
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
          <p className="text-sm font-medium text-zinc-950 dark:text-white">Match my camp</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className={labelClasses}>
              <span className={hintClasses}>Power shown</span>
              <input
                type="number"
                inputMode="numeric"
                className={fieldClasses}
                value={shownPower}
                onChange={(event) => setShownPower(event.target.value)}
              />
            </label>
            <label className={labelClasses}>
              <span className={hintClasses}>Luck shown</span>
              <input
                type="number"
                inputMode="numeric"
                className={fieldClasses}
                value={shownLuck}
                onChange={(event) => setShownLuck(event.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            disabled={!matched}
            onClick={() => {
              if (!matched) return;
              onChange({ ...setup, ...matched });
              setShownPower('');
              setShownLuck('');
            }}
            className="mt-3 rounded-lg bg-pink-600 px-3 py-1.5 text-sm font-medium text-white shadow-xs hover:bg-pink-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-zinc-900"
          >
            {matched
              ? `Use +${matched.bonusPower}% power and +${matched.bonusLuck} luck`
              : !setup.weapon || !setup.base
                ? 'Pick a weapon and base first'
                : 'Type the power and luck your camp shows'}
          </button>
        </div>
      </div>
    </details>
  );
}

function Results({ setup, result }: { setup: Setup; result: ReturnType<typeof estimate> }) {
  if (!setup.location || !setup.weapon || !setup.base) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-base font-medium text-zinc-900 dark:text-white">Pick a location, weapon and base</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          The catch rate for every mouse there shows up here as you go.
        </p>
      </div>
    );
  }
  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-base font-medium text-zinc-900 dark:text-white">No attraction data for this setup</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Try another cheese or stage.</p>
      </div>
    );
  }

  const { trap, overall } = result;
  const stats: [string, string][] = [
    ['Power', formatNumber(trap.power)],
    ['Luck', formatNumber(trap.luck)],
    ['Attraction bonus', percent(trap.attraction, 0)],
    ['Power type', powerTypeLabel(trap.powerType)],
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-linear-to-br from-pink-50 via-white to-amber-50 p-4 ring-1 ring-pink-100/80 sm:p-5 dark:from-pink-950/30 dark:via-zinc-900 dark:to-amber-950/20 dark:ring-zinc-800">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <p>
            <span className="block text-sm text-zinc-700 dark:text-zinc-300">Overall catch rate</span>
            <span className="block text-4xl font-semibold tracking-tight tabular-nums text-zinc-950 dark:text-white">
              {percent(overall.catchRate * 100)}
            </span>
          </p>
          <p className="text-sm text-zinc-700 sm:text-right dark:text-zinc-300">
            {percent(overall.attraction)} of hunts attract a mouse.
            {overall.minluck !== undefined && overall.minluck > 0 && (
              <span className="block">{formatNumber(overall.minluck)} luck catches every mouse here.</span>
            )}
          </p>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl bg-white/80 px-3 py-2 ring-1 ring-zinc-200/80 dark:bg-white/5 dark:ring-zinc-700/60"
            >
              <dt className="text-xs text-zinc-600 dark:text-zinc-400">{label}</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {result.mice.every((mouse) => mouse.minluck === undefined) && (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-900">
          None of these mice can be caught with {powerTypeLabel(trap.powerType)} power. Try a weapon of another power
          type; each mouse’s page lists what it’s weak to.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <table className="w-full text-sm">
          <caption className="sr-only">Catch rate for each mouse</caption>
          <thead className="text-left text-xs text-zinc-600 dark:text-zinc-400">
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-3 py-2.5 font-medium sm:px-4">Mouse</th>
              <th className="hidden px-3 py-2.5 text-right font-medium sm:table-cell">Attraction</th>
              <th className="px-3 py-2.5 text-right font-medium">Catch rate</th>
              <th className="px-3 py-2.5 text-right font-medium">
                Catches <span className="hidden sm:inline">per 100 hunts</span>
              </th>
              <th className="hidden px-3 py-2.5 text-right font-medium sm:table-cell sm:px-4">Minluck</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {result.mice.map((mouse) => (
              <tr key={mouse.type}>
                <td className="px-3 py-2 sm:px-4">
                  <Link
                    href={`/mice/${mouse.type.replaceAll('_', '-')}`}
                    prefetch={false}
                    className="inline-flex items-center gap-2 font-medium text-zinc-900 hover:text-pink-700 dark:text-zinc-100 dark:hover:text-pink-300"
                  >
                    <GameImage
                      src={mouseImageUrl(mouse.type)}
                      width={28}
                      height={28}
                      className="size-7 shrink-0 bg-white object-contain"
                    />
                    {mouse.name}
                  </Link>
                  {/* On a phone the attraction and minluck columns fold into a line under the name. */}
                  <span className="mt-0.5 block pl-9 text-xs tabular-nums text-zinc-600 sm:hidden dark:text-zinc-400">
                    {percent(mouse.attraction, 2)} attraction
                    {mouse.minluck !== undefined && mouse.minluck > 0 ? `, minluck ${formatNumber(mouse.minluck)}` : ''}
                  </span>
                </td>
                <td className="hidden px-3 py-2 text-right tabular-nums text-zinc-700 sm:table-cell dark:text-zinc-300">
                  {percent(mouse.attraction, 2)}
                </td>
                <td className="px-3 py-2 text-right">
                  <CatchRateCell rate={mouse.catchRate} immune={mouse.minluck === undefined} />
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-zinc-900 dark:text-white">
                  {mouse.catches.toFixed(2)}
                </td>
                <td className="hidden px-3 py-2 text-right tabular-nums text-zinc-700 sm:table-cell sm:px-4 dark:text-zinc-300">
                  {mouse.minluck === undefined ? (
                    <span title="This power type can’t catch it">—</span>
                  ) : (
                    formatNumber(mouse.minluck)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CatchRateCell({ rate, immune }: { rate: number; immune: boolean }) {
  if (immune) {
    return (
      <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
        Immune
      </span>
    );
  }
  const value = rate * 100;
  const tone =
    value >= 80
      ? 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-900'
      : value >= 40
        ? 'bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900'
        : 'bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:ring-rose-900';
  return (
    <span className={clsx('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1', tone)}>
      {value >= 100 ? '100%' : `${Math.min(99.99, value).toFixed(value < 10 ? 2 : 1)}%`}
    </span>
  );
}
