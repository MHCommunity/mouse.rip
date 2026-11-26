'use client';

import clsx from 'clsx';
import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { GameImage } from '@/components/game-image';
import { ItemPicker, type PickerOption } from '@/components/item-picker';
import { Link } from '@/components/link';
import { loadCatchRateData } from '@/lib/client-index';
import { buildCatalog, group, type Catalog } from '@/lib/catch-rate/data';
import { estimate, matchShownTotals, type Extras, type Setup } from '@/lib/catch-rate/engine';
import {
  EMPTY_SETUP,
  cheesesFor,
  resolveStage,
  setupFromParams,
  setupToParams,
  specialCharmsFor,
  stagesFor,
} from '@/lib/catch-rate/options';
import { EMPOWERABLE_CHEESES, GOLEM_GUARDIAN, ISLE_IDOL, PRESTIGE_BASES } from '@/lib/catch-rate/special';
import { itemImageUrl, mouseImageUrl } from '@/lib/image-urls';
import { powerTypeLabel } from '@/lib/power-types';
import { formatNumber } from '@/utils';

const STORAGE_KEY = 'mouse.rip:catch-rate-estimator';
const ON_SERVER = 'server';

const FRESHNESS_NAMES = [
  'Uber Stale',
  'Ultimately Stale',
  'Insanely Stale',
  'Extremely Stale',
  'Very Stale',
  'Stale',
  'No effect',
  'Fresh',
  'Very Fresh',
  'Extremely Fresh',
  'Insanely Fresh',
  'Ultimately Fresh',
  'Uber Fresh',
];

const cardClasses =
  'rounded-2xl bg-white p-4 shadow-xs ring-1 ring-zinc-200 sm:p-5 dark:bg-zinc-900 dark:ring-zinc-800';
const labelClasses = 'flex flex-col gap-1.5 text-sm font-medium text-zinc-950 dark:text-white';
const hintClasses = 'text-xs font-normal text-zinc-600 dark:text-zinc-400';
const fieldClasses =
  'w-full rounded-xl border border-zinc-950/10 bg-white px-3 py-2.5 text-base/6 text-zinc-950 shadow-xs hover:border-zinc-950/20 focus:border-pink-500 focus:outline-hidden focus:ring-2 focus:ring-pink-500/30 sm:py-2 sm:text-sm/6 dark:border-white/10 dark:bg-white/5 dark:text-white dark:scheme-dark dark:hover:border-white/20';

function readStorage(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    // Storage is blocked (private browsing, say); start fresh.
    return '';
  }
}
const noSubscribe = () => () => {};

function percent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
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
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [failed, setFailed] = useState(false);
  const [setup, setSetup] = useState<Setup>(initial);

  useEffect(() => {
    let current = true;
    loadCatchRateData()
      .then((raw) => {
        if (current) setCatalog(buildCatalog(raw));
      })
      .catch(() => {
        if (current) setFailed(true);
      });
    return () => {
      current = false;
    };
  }, []);

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

  if (failed) {
    return <p className={cardClasses}>The catch rate data didn’t load. Check your connection and reload the page.</p>;
  }
  if (!catalog) {
    return <div className="h-96 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" aria-label="Loading" />;
  }
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
  const locations = useMemo(() => [...catalog.locations].sort((a, b) => a.name.localeCompare(b.name)), [catalog]);
  const stages = useMemo(() => (setup.location ? stagesFor(catalog, setup.location) : []), [catalog, setup.location]);
  const cheeses = useMemo(
    () => (setup.location ? cheesesFor(catalog, setup.location, setup.stage) : []),
    [catalog, setup.location, setup.stage],
  );
  const specialCharms = useMemo(
    () => specialCharmsFor(catalog, setup.location, setup.stage, setup.cheese),
    [catalog, setup.location, setup.stage, setup.cheese],
  );

  const weaponOptions = useMemo<PickerOption[]>(
    () =>
      [...catalog.weapons.values()].map((item) => ({
        value: item.type,
        name: item.name,
        image: itemImageUrl(item.type),
        hint: item.powerType ? powerTypeLabel(item.powerType) : undefined,
      })),
    [catalog],
  );
  const baseOptions = useMemo<PickerOption[]>(
    () =>
      [...catalog.bases.values()].map((item) => ({
        value: item.type,
        name: item.name,
        image: itemImageUrl(item.type),
      })),
    [catalog],
  );
  const charmOptions = useMemo<PickerOption[]>(
    () =>
      [...catalog.charms.values()].map((item) => ({
        value: item.type,
        name: item.name,
        image: itemImageUrl(item.type),
        hint: specialCharms.has(item.type) ? 'Own attraction data' : undefined,
      })),
    [catalog, specialCharms],
  );

  // Keep the stage and cheese valid as the location and stage change.
  const choose = (changes: Partial<Setup>) => {
    const next = { ...setup, ...changes };
    if (changes.location !== undefined && changes.location !== setup.location) {
      next.stage = stagesFor(catalog, next.location)[0] ?? '-';
    }
    const available = cheesesFor(catalog, next.location, next.stage);
    if (!available.some((cheese) => cheese.type === next.cheese)) next.cheese = available[0]?.type ?? '';
    onChange(next);
  };
  const setExtra = <K extends keyof Extras>(key: K, value: Extras[K]) =>
    onChange({ ...setup, extras: { ...setup.extras, [key]: value } });

  // The data has Iceberg stages for each special base; the base picks which one.
  const resolved = { ...setup, stage: resolveStage(catalog, setup.location, setup.stage, setup.base) };
  const result = estimate(resolved, catalog);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <form className="space-y-4" aria-label="Your setup" onSubmit={(event) => event.preventDefault()}>
        <fieldset className={clsx(cardClasses, 'space-y-4')}>
          <legend className="sr-only">Where you’re hunting</legend>
          <label className={labelClasses}>
            Location
            <select
              className={fieldClasses}
              value={setup.location}
              onChange={(event) => choose({ location: event.target.value })}
            >
              <option value="">Pick a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
          {stages.length > 1 && (
            <label className={labelClasses}>
              Stage
              <select
                className={fieldClasses}
                value={setup.stage}
                onChange={(event) => choose({ stage: event.target.value })}
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </label>
          )}
          {setup.location && (
            <label className={labelClasses}>
              Cheese
              <select
                className={fieldClasses}
                value={setup.cheese}
                onChange={(event) => choose({ cheese: event.target.value })}
              >
                {cheeses.map((cheese) => (
                  <option key={cheese.type} value={cheese.type}>
                    {cheese.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {EMPOWERABLE_CHEESES.has(setup.cheese) && (
            <Toggle checked={Boolean(setup.empowered)} onChange={(empowered) => onChange({ ...setup, empowered })}>
              Empowered <span className={hintClasses}>(20% power bonus)</span>
            </Toggle>
          )}
        </fieldset>

        <fieldset className={clsx(cardClasses, 'space-y-4')}>
          <legend className="sr-only">Your trap</legend>
          <ItemPicker
            label="Weapon"
            options={weaponOptions}
            value={setup.weapon}
            onChange={(weapon) => choose({ weapon })}
          />
          <ItemPicker label="Base" options={baseOptions} value={setup.base} onChange={(base) => choose({ base })} />
          <ItemPicker
            label="Charm"
            options={charmOptions}
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
        <Results catalog={catalog} setup={resolved} result={result} />
      </section>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-zinc-300 text-pink-600 focus:ring-pink-500 dark:border-zinc-600"
      />
      <span>{children}</span>
    </label>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  hint?: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min: number;
  max: number;
}) {
  return (
    <label className={labelClasses}>
      <span>
        {label} {hint && <span className={hintClasses}>({hint})</span>}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        className={fieldClasses}
        value={value ?? ''}
        onChange={(event) => {
          const number = event.target.value === '' ? undefined : Number(event.target.value);
          onChange(number === undefined || !Number.isFinite(number) ? undefined : Math.min(max, Math.max(min, number)));
        }}
      />
    </label>
  );
}

function LevelSelect({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number | undefined;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className={labelClasses}>
      {label}
      <select className={fieldClasses} value={value ?? 0} onChange={(event) => onChange(Number(event.target.value))}>
        {Array.from({ length: max + 1 }, (_, level) => (
          <option key={level} value={level}>
            {level === 0 ? 'None' : `Level ${level}`}
          </option>
        ))}
      </select>
    </label>
  );
}

/** The location and item states that change the numbers, shown only when they apply. */
function ExtrasCard({
  catalog,
  setup,
  onExtra,
}: {
  catalog: Catalog;
  setup: Setup;
  onExtra: <K extends keyof Extras>(key: K, value: Extras[K]) => void;
}) {
  const { location, stage, extras } = setup;
  const dragons = group(catalog, 'dragon');
  const population = estimate(setup, catalog)?.population;
  const fields: React.ReactNode[] = [];

  if (location === 'rift_furoma') {
    fields.push(
      <LevelSelect
        key="battery"
        label="Battery"
        value={extras.battery}
        max={10}
        onChange={(v) => onExtra('battery', v)}
      />,
    );
  }
  if (location === 'fort_rox') {
    fields.push(
      <div key="fort" className="grid grid-cols-2 gap-3">
        <LevelSelect label="Ballista" value={extras.ballista} max={3} onChange={(v) => onExtra('ballista', v)} />
        <LevelSelect label="Cannon" value={extras.cannon} max={3} onChange={(v) => onExtra('cannon', v)} />
      </div>,
    );
    if (stage === 'Heart of the Meteor') {
      fields.push(
        <NumberField
          key="meteor"
          label="Meteor width"
          hint="%"
          value={extras.meteorWidth ?? 100}
          min={0}
          max={100}
          onChange={(v) => onExtra('meteorWidth', v)}
        />,
      );
    }
  }
  if (location === 'zugzwang_tower') {
    fields.push(
      <NumberField
        key="amp"
        label="Amplifier"
        hint="0–175%"
        value={extras.amplifier ?? 100}
        min={0}
        max={175}
        onChange={(v) => onExtra('amplifier', v)}
      />,
    );
  }
  if (location === 'sand_crypts') {
    fields.push(
      <NumberField
        key="salt"
        label="Salt"
        hint="0–50"
        value={extras.salt ?? 0}
        min={0}
        max={50}
        onChange={(v) => onExtra('salt', v)}
      />,
    );
  }
  if (location === 'ancient_city') {
    fields.push(
      <Toggle key="boss" checked={Boolean(extras.zokorBossDefeated)} onChange={(v) => onExtra('zokorBossDefeated', v)}>
        District boss defeated <span className={hintClasses}>(Forgotten does double)</span>
      </Toggle>,
    );
    if (stage.startsWith('Lair')) {
      fields.push(
        <NumberField
          key="width"
          label="Retired Minotaur width"
          hint="%"
          value={extras.zokorWidth ?? 100}
          min={0}
          max={100}
          onChange={(v) => onExtra('zokorWidth', v)}
        />,
      );
    }
  }
  if (location === 'desert_warpath' && (stage === 'Wave 4' || stage === 'Portal')) {
    fields.push(
      <Toggle key="guards" checked={Boolean(extras.warpathGuards)} onChange={(v) => onExtra('warpathGuards', v)}>
        Guards still standing <span className={hintClasses}>(the boss can’t be caught yet)</span>
      </Toggle>,
    );
  }
  if (location === 'rift_bristle_woods' && stage.startsWith('Acolyte')) {
    fields.push(
      <Toggle key="sand" checked={Boolean(extras.acolyteSand)} onChange={(v) => onExtra('acolyteSand', v)}>
        The Acolyte still has sand
      </Toggle>,
    );
  }
  if (PRESTIGE_BASES.has(setup.base)) {
    fields.push(
      <NumberField
        key="umbra"
        label="Highest Umbra floor"
        value={extras.umbraFloor}
        min={0}
        max={200}
        onChange={(v) => onExtra('umbraFloor', v)}
      />,
    );
  }
  if (setup.weapon === GOLEM_GUARDIAN) {
    fields.push(
      <div key="golem" className="grid grid-cols-2 gap-3">
        <label className={labelClasses}>
          Golem skin
          <select
            className={fieldClasses}
            value={extras.golemType ?? 'arcane'}
            onChange={(event) => onExtra('golemType', event.target.value)}
          >
            {['arcane', 'forgotten', 'hydro', 'physical', 'tactical'].map((type) => (
              <option key={type} value={type}>
                {powerTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>
        <NumberField
          label="Charge"
          hint="%"
          value={extras.golemCharge ?? 100}
          min={0}
          max={100}
          onChange={(v) => onExtra('golemCharge', v)}
        />
      </div>,
    );
  }
  if (setup.weapon === ISLE_IDOL) {
    fields.push(
      <label key="idol" className={labelClasses}>
        Isle Idol skin
        <select
          className={fieldClasses}
          value={extras.isleIdolSkin ?? ''}
          onChange={(event) => onExtra('isleIdolSkin', event.target.value)}
        >
          <option value="">No skin</option>
          <option value="hydroplane">Hydroplane</option>
          <option value="stakeshooter">Stakeshooter</option>
        </select>
      </label>,
    );
  }
  if (setup.base === 'denture_base' || setup.base === 'upgraded_denture_base') {
    fields.push(
      <Toggle key="teeth" checked={Boolean(extras.dentureToothless)} onChange={(v) => onExtra('dentureToothless', v)}>
        Toothless <span className={hintClasses}>(out of charge)</span>
      </Toggle>,
    );
  }
  if (setup.weapon === 'chrono_gwh_weapon') {
    fields.push(
      <NumberField
        key="acolytes"
        label="Acolytes caught"
        hint="2,000 power each"
        value={extras.acolyteCatches}
        min={0}
        max={99}
        onChange={(v) => onExtra('acolyteCatches', v)}
      />,
    );
  }
  if (population?.mice.some((mouse) => dragons.has(mouse.type))) {
    fields.push(
      <Toggle key="might" checked={Boolean(extras.dragonsMight)} onChange={(v) => onExtra('dragonsMight', v)}>
        Dragon’s Might aura <span className={hintClasses}>(300% against dragons)</span>
      </Toggle>,
    );
  }

  if (fields.length === 0) return null;
  return (
    <fieldset className={clsx(cardClasses, 'space-y-4')}>
      <legend className="sr-only">Location and item details</legend>
      <p className="text-sm font-medium text-zinc-950 dark:text-white">A few more details</p>
      {fields}
    </fieldset>
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
            label="Power bonus"
            hint="%"
            value={setup.bonusPower || undefined}
            min={-100}
            max={10000}
            onChange={(v) => onChange({ ...setup, bonusPower: v ?? 0 })}
          />
          <NumberField
            label="Luck"
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
              : 'Pick a weapon and base first'}
          </button>
        </div>
      </div>
    </details>
  );
}

function Results({ catalog, setup, result }: { catalog: Catalog; setup: Setup; result: ReturnType<typeof estimate> }) {
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

  const { trap, overall, population } = result;
  const stats: [string, string][] = [
    ['Power', formatNumber(trap.power)],
    ['Luck', formatNumber(trap.luck)],
    ['Attraction bonus', percent(trap.attraction, 0)],
    ['Cheese effect', FRESHNESS_NAMES[trap.freshness + 6]],
    ['Power type', powerTypeLabel(trap.powerType)],
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-linear-to-br from-pink-50 via-white to-amber-50 p-5 ring-1 ring-pink-100/80 sm:p-6 dark:from-pink-950/30 dark:via-zinc-900 dark:to-amber-950/20 dark:ring-zinc-800">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Every 100 hunts, you can expect to catch about</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums text-zinc-950 dark:text-white">
          {overall.catches.toFixed(1)}{' '}
          <span className="text-lg font-medium text-zinc-600 dark:text-zinc-400">mice</span>
        </p>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Something is attracted on {percent(overall.attraction)} of hunts, and you catch{' '}
          {percent(overall.catchRate * 100)} of those.
          {overall.minluck !== undefined && overall.minluck > 0 && (
            <> {formatNumber(overall.minluck)} luck would catch every mouse here.</>
          )}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
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
                      className="size-7 shrink-0 rounded-md bg-white object-contain"
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
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Attraction rates for {catalog.locationName.get(setup.location)}
        {setup.stage !== '-' ? ` (${setup.stage})` : ''} with {catalog.cheeseName.get(setup.cheese)}
        {population.charm !== '-' ? ` and ${catalog.charms.get(population.charm)?.name ?? population.charm}` : ''} from{' '}
        {population.source === 'mhct'
          ? `MHCT${population.sample ? `, ${formatNumber(population.sample)} hunts` : ''}`
          : 'MH-Tools'}
        . Catch rates use the community’s formula with MH-Tools’ and MouseHunt Improved’s special cases.
      </p>
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
