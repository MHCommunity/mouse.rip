'use client';

/** The form pieces the catch rate estimator and Best Setup share. */

import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';

import type { PickerOption } from '@/components/item-picker';
import { loadCatchRateData } from '@/lib/client-index';
import { buildCatalog, group, type Catalog } from '@/lib/catch-rate/data';
import { findPopulation, type Extras, type Setup } from '@/lib/catch-rate/engine';
import { applyChanges, cheesesFor, specialCharmsFor, stagesFor } from '@/lib/catch-rate/options';
import { EMPOWERABLE_CHEESES, GOLEM_GUARDIAN, ISLE_IDOL, PRESTIGE_BASES } from '@/lib/catch-rate/special';
import { itemImageUrl } from '@/lib/image-urls';
import { powerTypeLabel } from '@/lib/power-types';

export const cardClasses =
  // min-w-0: a fieldset otherwise never shrinks below its widest line, and pushes off a phone's screen.
  'min-w-0 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-zinc-200 sm:p-5 dark:bg-zinc-900 dark:ring-zinc-800';
export const labelClasses = 'flex flex-col gap-1.5 text-sm font-medium text-zinc-950 dark:text-white';
export const hintClasses = 'text-xs font-normal text-zinc-600 dark:text-zinc-400';
export const fieldClasses =
  'w-full rounded-xl border border-zinc-950/45 bg-white px-3 py-2.5 text-base/6 text-zinc-950 shadow-xs hover:border-zinc-950/60 focus:border-pink-500 focus:outline-hidden focus:ring-2 focus:ring-pink-500/30 sm:py-2 sm:text-sm/6 dark:border-white/35 dark:bg-white/5 dark:text-white dark:scheme-dark dark:hover:border-white/45';

/** The catch rate data, loaded once the page is in the browser. */
export function useCatchRateCatalog(): { catalog: Catalog | null; failed: boolean } {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [failed, setFailed] = useState(false);
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
  return { catalog, failed };
}

export function CatalogStatus({ failed }: { failed: boolean }) {
  return failed ? (
    <p className={cardClasses}>The catch rate data didn’t load. Check your connection and reload the page.</p>
  ) : (
    <div className="h-96 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" aria-label="Loading" />
  );
}

/** Weapons, bases and charms as picker options, with the game's art. */
export function useItemOptions(catalog: Catalog, setup: Setup) {
  const specialCharms = useMemo(
    () => specialCharmsFor(catalog, setup.location, setup.stage, setup.cheese),
    [catalog, setup.location, setup.stage, setup.cheese],
  );
  const weapons = useMemo<PickerOption[]>(
    () =>
      [...catalog.weapons.values()].map((item) => ({
        value: item.type,
        name: item.name,
        image: itemImageUrl(item.type),
        hint: item.powerType ? powerTypeLabel(item.powerType) : undefined,
      })),
    [catalog],
  );
  const bases = useMemo<PickerOption[]>(
    () =>
      [...catalog.bases.values()].map((item) => ({
        value: item.type,
        name: item.name,
        image: itemImageUrl(item.type),
      })),
    [catalog],
  );
  const charms = useMemo<PickerOption[]>(
    () =>
      [...catalog.charms.values()].map((item) => ({
        value: item.type,
        name: item.name,
        image: itemImageUrl(item.type),
        hint: specialCharms.has(item.type) ? 'Own attraction data' : undefined,
      })),
    [catalog, specialCharms],
  );
  return { weapons, bases, charms };
}

/** Location, stage and cheese, kept valid as each changes. */
export function WhereFields({
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
  const choose = (changes: Partial<Setup>) => onChange(applyChanges(catalog, setup, changes));

  return (
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
  );
}

export function Toggle({
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

export function NumberField({
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

export function LevelSelect({
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
export function ExtrasCard({
  catalog,
  setup,
  onExtra,
  items,
}: {
  catalog: Catalog;
  setup: Setup;
  onExtra: <K extends keyof Extras>(key: K, value: Extras[K]) => void;
  /** For Best Setup: the weapons and bases being tried, in place of the setup's own. */
  items?: { weapons: Set<string>; bases: Set<string> };
}) {
  const { location, stage, extras } = setup;
  const dragons = group(catalog, 'dragon');
  const population = findPopulation(setup, catalog);
  const hasWeapon = (type: string) => (items ? items.weapons.has(type) : setup.weapon === type);
  const hasBase = (type: string) => (items ? items.bases.has(type) : setup.base === type);
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
  if ([...PRESTIGE_BASES].some(hasBase)) {
    fields.push(
      <NumberField
        key="umbra"
        label="Highest Umbra floor"
        hint="Prestige or Hailstone Singularity Base"
        value={extras.umbraFloor}
        min={0}
        max={200}
        onChange={(v) => onExtra('umbraFloor', v)}
      />,
    );
  }
  if (hasWeapon(GOLEM_GUARDIAN)) {
    fields.push(
      <div key="golem" className="grid grid-cols-2 gap-3">
        <label className={labelClasses}>
          Golem Guardian skin
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
          label="Golem Guardian charge"
          hint="%"
          value={extras.golemCharge ?? 100}
          min={0}
          max={100}
          onChange={(v) => onExtra('golemCharge', v)}
        />
      </div>,
    );
  }
  if (hasWeapon(ISLE_IDOL)) {
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
  if (hasBase('denture_base') || hasBase('upgraded_denture_base')) {
    fields.push(
      <Toggle key="teeth" checked={Boolean(extras.dentureToothless)} onChange={(v) => onExtra('dentureToothless', v)}>
        Denture Base is toothless <span className={hintClasses}>(out of charge)</span>
      </Toggle>,
    );
  }
  if (hasWeapon('chrono_gwh_weapon')) {
    fields.push(
      <NumberField
        key="acolytes"
        label="Acolytes caught"
        hint="Father Winter’s Timepiece: 2,000 power each"
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

/**
 * On a phone the results sit under a long form. This rides at the bottom of the screen while the form is in view
 * and jumps down to them.
 */
export function JumpToResults({ target }: { target: string }) {
  return (
    <div className="sticky bottom-3 z-10 flex justify-center lg:hidden">
      <a
        href={`#${target}`}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-pink-600 px-5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-pink-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
      >
        See results
        <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}
