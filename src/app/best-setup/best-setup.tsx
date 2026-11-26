'use client';

import clsx from 'clsx';
import React, { useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Announce } from '@/components/announce';
import { GameImage } from '@/components/game-image';
import { ItemPicker } from '@/components/item-picker';
import { Link } from '@/components/link';
import { bestSetups, tiedForBest, type Goal, type RankedSetup } from '@/lib/catch-rate/best-setup';
import type { Catalog } from '@/lib/catch-rate/data';
import { findPopulation, type Extras, type Setup } from '@/lib/catch-rate/engine';
import { EMPTY_SETUP, applyChanges, overlayOnSaved, setupFromParams, setupToParams } from '@/lib/catch-rate/options';
import { itemImageUrl } from '@/lib/image-urls';
import { powerTypeLabel } from '@/lib/power-types';
import { formatNumber } from '@/utils';

import {
  CatalogStatus,
  ExtrasCard,
  NumberField,
  Toggle,
  WhereFields,
  cardClasses,
  hintClasses,
  labelClasses,
  fieldClasses,
  useCatchRateCatalog,
  useItemOptions,
  JumpToResults,
  NoDataHint,
  startOverClasses,
} from '../catch-rate-estimator/fields';

const SETUP_KEY = 'mouse.rip:best-setup';
const OWNED_KEY = 'mouse.rip:owned-items';
const ON_SERVER = 'server';
const PAGE = 25;

/** The weapons, bases and charms a hunter owns, by type. */
export interface OwnedItems {
  weapons: string[];
  bases: string[];
  charms: string[];
}

const KINDS = [
  { key: 'weapons', label: 'Weapons', param: 'own_weapons' },
  { key: 'bases', label: 'Bases', param: 'own_bases' },
  { key: 'charms', label: 'Charms', param: 'own_charms' },
] as const;

const noSubscribe = () => () => {};

/**
 * Arrow keys for a group of role="radio" buttons, as a screen reader tells its user to expect: they move to the
 * next choice and pick it. Each button also takes tabIndex 0 only when it's the one chosen.
 */
function radioKeys(event: React.KeyboardEvent<HTMLElement>) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
  if (!step) return;
  const radios = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')];
  const next =
    radios[(radios.indexOf(document.activeElement as HTMLButtonElement) + step + radios.length) % radios.length];
  if (!next) return;
  event.preventDefault();
  next.focus();
  next.click();
}
function read(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    // Storage is blocked (private browsing, say); start fresh.
    return '';
  }
}
function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Blocked storage only means the next visit starts fresh.
  }
}

const NO_ITEMS: OwnedItems = { weapons: [], bases: [], charms: [] };
const isEmpty = (items: OwnedItems) => KINDS.every(({ key }) => items[key].length === 0);
const sameItems = (a: OwnedItems, b: OwnedItems) =>
  KINDS.every(({ key }) => a[key].length === b[key].length && a[key].every((type) => b[key].includes(type)));

/** The saved list, and whether the search was down to it. The list is kept while every item is searched. */
function parseOwned(stored: string): { items: OwnedItems; mineOnly: boolean } | null {
  try {
    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== 'object') return null;
    const list = (key: string) => {
      const entry = (value as Record<string, unknown>)[key];
      return Array.isArray(entry) ? entry.filter((item): item is string => typeof item === 'string') : [];
    };
    return {
      items: { weapons: list('weapons'), bases: list('bases'), charms: list('charms') },
      mineOnly: (value as Record<string, unknown>).all !== true,
    };
  } catch {
    // Nothing saved, or something else under the key.
    return null;
  }
}

/** Items in a link (own_weapons=a,b&own_bases=…), for MouseHunt Improved or a bookmarklet to send a hunter's own. */
function ownedFromParams(params: URLSearchParams): OwnedItems | null {
  const list = (param: string) => (params.get(param) ?? '').split(',').filter(Boolean);
  const items = { weapons: list('own_weapons'), bases: list('own_bases'), charms: list('own_charms') };
  // A link with the parameters but nothing in them isn't a list to switch to.
  return isEmpty(items) ? null : items;
}

interface Settings {
  setup: Setup;
  goal: Goal;
  tryCharms: boolean;
}

function settingsFromParams(params: URLSearchParams): Settings {
  const target = params.get('target');
  return {
    setup: setupFromParams(params),
    goal: target ? { kind: 'mouse', mouse: target } : { kind: 'catches' },
    tryCharms: params.get('try_charms') === '1',
  };
}

function settingsToParams({ setup, goal, tryCharms }: Settings): URLSearchParams {
  // The weapon and base are what Best Setup finds, so they don't go in its link.
  const params = setupToParams({ ...setup, weapon: '', base: '' });
  if (goal.kind === 'mouse') params.set('target', goal.mouse);
  if (tryCharms) params.set('try_charms', '1');
  return params;
}

/** A shared link wins; without one, pick up where this device left off. */
export function BestSetupFromUrl() {
  const params = useSearchParams();
  const storedSetup = useSyncExternalStore(
    noSubscribe,
    () => read(SETUP_KEY),
    () => ON_SERVER,
  );
  const storedOwned = useSyncExternalStore(
    noSubscribe,
    () => read(OWNED_KEY),
    () => ON_SERVER,
  );
  const link = new URLSearchParams(params.toString());
  const linked = link.has('location');
  const ready = storedSetup !== ON_SERVER;
  // A link that names only the place (a location page's "Best setup here") keeps the hunter's charm, shield and
  // bonuses; the tool's own links always carry a cheese. A link from elsewhere on the site that does name a
  // cheese, such as a mouse page's, asks for the same with keep=1.
  const keepsSettings = linked && ready && (!link.has('cheese') || link.get('keep') === '1');
  const initial = linked
    ? settingsFromParams(keepsSettings ? overlayOnSaved(storedSetup, link) : link)
    : ready && storedSetup
      ? settingsFromParams(new URLSearchParams(storedSetup))
      : undefined;
  const linkedItems = ownedFromParams(link);
  const saved = ready ? parseOwned(storedOwned) : null;
  return (
    <BestSetup
      key={ready ? 'ready' : 'server'}
      initial={initial}
      initialItems={linkedItems ?? saved?.items}
      initialMineOnly={linkedItems ? true : (saved?.mineOnly ?? false)}
      importedItems={Boolean(linkedItems)}
      replacedItems={linkedItems && saved && !sameItems(linkedItems, saved.items) ? saved.items : undefined}
      itemsInAddress={KINDS.some(({ param }) => link.has(param))}
      syncUrl={ready}
    />
  );
}

/** A list to go back to: the one a link replaced, or the one before every tick was set or cleared at once. */
interface Undo {
  items: OwnedItems;
  of: 'link' | 'all';
}

export function BestSetup({
  initial,
  initialItems = NO_ITEMS,
  initialMineOnly = false,
  importedItems = false,
  replacedItems,
  itemsInAddress = false,
  syncUrl,
}: {
  initial?: Settings;
  initialItems?: OwnedItems;
  initialMineOnly?: boolean;
  /** The list came in the link that was opened. */
  importedItems?: boolean;
  /** The saved list the link's took the place of, when it was a different one. */
  replacedItems?: OwnedItems;
  /** The address still carries a list, to take out once it's saved. */
  itemsInAddress?: boolean;
  syncUrl: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { catalog, failed } = useCatchRateCatalog();
  const [settings, setSettings] = useState<Settings>(
    initial ?? { setup: { ...EMPTY_SETUP }, goal: { kind: 'catches' }, tryCharms: false },
  );
  // The hunter's ticked items, and whether the search is down to them. The two are kept apart so that looking at
  // every item and coming back doesn't cost them the list.
  const [items, setItems] = useState<OwnedItems>(initialItems);
  const [mineOnly, setMineOnly] = useState(initialMineOnly);
  const [undo, setUndo] = useState<Undo | null>(replacedItems ? { items: replacedItems, of: 'link' } : null);
  // The address is cleaned of the list once it's saved, so remember here that it came from a link.
  const [imported] = useState(importedItems);

  // Remember the settings and the item list for the next visit, including ones that came in a link.
  useEffect(() => {
    if (syncUrl) write(SETUP_KEY, settingsToParams(settings).toString());
  }, [settings, syncUrl]);
  useEffect(() => {
    if (!syncUrl) return;
    // Nothing ticked and nothing saved before: leave storage alone.
    if (!mineOnly && isEmpty(items) && !read(OWNED_KEY)) return;
    write(OWNED_KEY, JSON.stringify(mineOnly ? items : { ...items, all: true }));
  }, [items, mineOnly, syncUrl]);
  // Items sent in a link are saved above; take them out of the address so it can be shared.
  useEffect(() => {
    if (!syncUrl || !itemsInAddress) return;
    const params = new URLSearchParams(window.location.search);
    for (const { param } of KINDS) params.delete(param);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [syncUrl, itemsInAddress, router, pathname]);

  const update = (next: Settings) => {
    setSettings(next);
    if (!syncUrl) return;
    const query = settingsToParams(next).toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Settings picked up from the last visit, or filled out from a link that kept them, aren't in the address yet.
  // Put them there once, so the address can be copied and shared without touching the form first.
  const addressed = useRef(false);
  useEffect(() => {
    if (!syncUrl || addressed.current || itemsInAddress) return;
    addressed.current = true;
    const query = settingsToParams(settings).toString();
    if (query && query !== window.location.search.slice(1)) {
      window.history.replaceState(null, '', `${pathname}?${query}`);
    }
  }, [syncUrl, settings, pathname, itemsInAddress]);

  // A link may name only a location; fill in a valid stage and cheese. Memoised so the search below runs when the
  // settings change and not on every render (each address update re-renders this).
  const complete = useMemo(() => {
    if (!catalog || !settings.setup.location) return settings;
    let setup = applyChanges(catalog, settings.setup, {});
    let goal = settings.goal;
    if (goal.kind === 'mouse') {
      const target = goal.mouse;
      const attracts = (candidate: Setup) =>
        findPopulation(candidate, catalog)?.mice.some((entry) => entry.type === target) ?? false;
      // A link aims for a mouse, and the saved charm it's laid over can bring its own set of mice without that
      // one. Then the charm gives way; if the mouse still isn't there, there's nothing to aim for.
      if (!attracts(setup)) {
        if (setup.charm && attracts({ ...setup, charm: '' })) setup = { ...setup, charm: '' };
        else goal = { kind: 'catches' };
      }
    }
    return { ...settings, setup, goal };
  }, [catalog, settings]);

  if (!catalog) return <CatalogStatus failed={failed} />;
  return (
    <BestSetupForm
      catalog={catalog}
      settings={complete}
      onChange={update}
      items={items}
      mineOnly={mineOnly}
      onMineOnly={setMineOnly}
      onItems={(next, all) => {
        // Ticking or clearing everything at once can be taken back; a single tick after that settles it.
        setUndo(all ? { items, of: 'all' } : null);
        setItems(next);
      }}
      imported={imported}
      undo={undo}
      onUndo={() => {
        if (!undo) return;
        setItems(undo.items);
        setUndo(null);
      }}
    />
  );
}

function BestSetupForm({
  catalog,
  settings,
  onChange,
  items,
  mineOnly,
  onMineOnly,
  onItems,
  imported,
  undo,
  onUndo,
}: {
  catalog: Catalog;
  settings: Settings;
  onChange: (settings: Settings) => void;
  items: OwnedItems;
  mineOnly: boolean;
  onMineOnly: (mineOnly: boolean) => void;
  onItems: (items: OwnedItems, all?: boolean) => void;
  imported: boolean;
  undo: Undo | null;
  onUndo: () => void;
}) {
  const { setup, goal, tryCharms } = settings;
  // Null while every item in the game is being searched.
  const owned = mineOnly ? items : null;
  const options = useItemOptions(catalog, setup);
  const setSetup = (next: Setup) => {
    const population = findPopulation(next, catalog);
    // A target mouse that isn't attracted here any more falls back to most catches.
    const keepsTarget = goal.kind === 'mouse' && population?.mice.some((mouse) => mouse.type === goal.mouse);
    onChange({ ...settings, setup: next, goal: keepsTarget ? goal : { kind: 'catches' } });
  };
  const setExtra = <K extends keyof Extras>(key: K, value: Extras[K]) =>
    setSetup({ ...setup, extras: { ...setup.extras, [key]: value } });

  const candidates = useMemo(() => {
    const known = (list: string[], map: Map<string, unknown>) => list.filter((type) => map.has(type));
    return {
      weapons: owned ? known(owned.weapons, catalog.weapons) : [...catalog.weapons.keys()],
      bases: owned ? known(owned.bases, catalog.bases) : [...catalog.bases.keys()],
      charms: tryCharms ? (owned ? known(owned.charms, catalog.charms) : [...catalog.charms.keys()]) : [],
    };
  }, [catalog, owned, tryCharms]);
  // Item details (an Isle Idol skin, a Golem charge…) only ask about items the hunter has ticked as their own.
  // Searching every item, those use their defaults rather than filling the form with questions.
  const ownItems = useMemo(
    () => ({ weapons: new Set(owned?.weapons ?? []), bases: new Set(owned?.bases ?? []) }),
    [owned],
  );

  const population = setup.location && setup.cheese ? findPopulation(setup, catalog) : undefined;
  // Trying every pair takes long enough to feel on a phone, so the search runs behind the form: a keystroke shows
  // at once, and the results catch up.
  const wanted = useMemo(() => ({ setup, candidates, goal }), [setup, candidates, goal]);
  const searched = useDeferredValue(wanted);
  const results = useMemo(
    () =>
      searched.setup.location && searched.setup.cheese && findPopulation(searched.setup, catalog)
        ? bestSetups(searched.setup, catalog, searched.candidates, searched.goal)
        : [],
    [searched, catalog],
  );
  const searching = searched !== wanted;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <form className="min-w-0 space-y-4" aria-label="What to search" onSubmit={(event) => event.preventDefault()}>
        <WhereFields catalog={catalog} setup={setup} onChange={(next) => setSetup(next)} />

        <fieldset className={clsx(cardClasses, 'space-y-4')}>
          <legend className="sr-only">What to aim for</legend>
          <div
            role="radiogroup"
            aria-label="Aim for"
            tabIndex={-1}
            onKeyDown={radioKeys}
            className="grid grid-cols-2 gap-2"
          >
            {(
              [
                ['catches', 'Most catches', 'Everything the cheese attracts'],
                ['mouse', 'One mouse', 'For a map or a tricky catch'],
              ] as const
            ).map(([kind, title, blurb]) => (
              <button
                key={kind}
                type="button"
                role="radio"
                aria-checked={goal.kind === kind}
                tabIndex={goal.kind === kind ? 0 : -1}
                disabled={kind === 'mouse' && !population}
                onClick={() =>
                  onChange({
                    ...settings,
                    goal:
                      kind === 'catches'
                        ? { kind }
                        : { kind, mouse: goal.kind === 'mouse' ? goal.mouse : (population?.mice[0]?.type ?? '') },
                  })
                }
                className={clsx(
                  'rounded-xl px-3 py-2 text-left ring-1 transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50',
                  goal.kind === kind
                    ? 'bg-pink-50 ring-2 ring-pink-600 dark:bg-pink-950/50 dark:ring-pink-400'
                    : 'bg-white ring-zinc-200 hover:ring-zinc-300 dark:bg-white/5 dark:ring-zinc-700',
                )}
              >
                <span className="block text-sm font-semibold text-zinc-900 dark:text-white">{title}</span>
                <span className="block text-xs text-zinc-600 dark:text-zinc-400">{blurb}</span>
              </button>
            ))}
          </div>
          {goal.kind === 'mouse' && population && (
            <label className={labelClasses}>
              Mouse
              <select
                className={fieldClasses}
                value={goal.mouse}
                onChange={(event) => onChange({ ...settings, goal: { kind: 'mouse', mouse: event.target.value } })}
              >
                {[...population.mice]
                  .map((mouse) => ({ type: mouse.type, name: catalog.mice.get(mouse.type)?.name ?? mouse.type }))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((mouse) => (
                    <option key={mouse.type} value={mouse.type}>
                      {mouse.name}
                    </option>
                  ))}
              </select>
            </label>
          )}
        </fieldset>

        <fieldset className={clsx(cardClasses, 'space-y-4')}>
          <legend className="sr-only">Charm and bonuses</legend>
          <ItemPicker
            label="Charm"
            options={options.charms}
            value={setup.charm}
            onChange={(charm) => setSetup(applyChanges(catalog, setup, { charm }))}
            placeholder="No charm"
            clearable
            clearLabel="No charm"
          />
          <Toggle checked={tryCharms} onChange={(next) => onChange({ ...settings, tryCharms: next })}>
            Also try {owned ? 'each of my charms' : 'every charm'}{' '}
            <span className={hintClasses}>(on the 50 strongest traps)</span>
          </Toggle>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Toggle checked={setup.goldenShield} onChange={(goldenShield) => setSetup({ ...setup, goldenShield })}>
              Golden Shield
            </Toggle>
            <Toggle checked={setup.riftstalker} onChange={(riftstalker) => setSetup({ ...setup, riftstalker })}>
              Riftstalker Codex
            </Toggle>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Extra power bonus"
              hint="%"
              value={setup.bonusPower || undefined}
              min={-100}
              max={10000}
              onChange={(value) => setSetup({ ...setup, bonusPower: value ?? 0 })}
            />
            <NumberField
              label="Extra luck"
              value={setup.bonusLuck || undefined}
              min={-100}
              max={1000}
              onChange={(value) => setSetup({ ...setup, bonusLuck: value ?? 0 })}
            />
          </div>
          <p className={hintClasses}>For auras and anything else your camp adds that isn’t on the items.</p>
        </fieldset>

        <ExtrasCard catalog={catalog} setup={setup} onExtra={setExtra} items={ownItems} />

        {/* "Only mine" lists every weapon in the game as a checkbox; this is the way past them to the results. */}
        <a
          href="#results"
          className="sr-only focus:not-sr-only focus:inline-block focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-pink-700 focus:ring-2 focus:ring-pink-500 dark:focus:bg-zinc-900 dark:focus:text-pink-300"
        >
          Skip to the results
        </a>
        <OwnedItemsCard
          catalog={catalog}
          items={items}
          mineOnly={mineOnly}
          onMineOnly={onMineOnly}
          onItems={onItems}
          imported={imported}
          undo={undo}
          onUndo={onUndo}
        />
        {setup.location && (
          <button
            type="button"
            onClick={() => onChange({ setup: { ...EMPTY_SETUP }, goal: { kind: 'catches' }, tryCharms: false })}
            className={startOverClasses}
          >
            Start over
          </button>
        )}
        <JumpToResults target="results" />
      </form>

      <section
        id="results"
        aria-labelledby="best-heading"
        className={clsx('min-w-0 scroll-mt-4 transition-opacity', searching && 'opacity-60')}
      >
        <h2 id="best-heading" className="sr-only">
          Best setups
        </h2>
        <Announce>
          {results.length > 0
            ? `Best setup: ${catalog.weapons.get(results[0].weapon)?.name ?? 'a weapon'} with ${
                catalog.bases.get(results[0].base)?.name ?? 'a base'
              }${results[0].charm ? ` and ${catalog.charms.get(results[0].charm)?.name ?? 'a charm'}` : ''}. ${formatNumber(results.length)} setups ranked.`
            : population
              ? 'No weapons or bases to try.'
              : ''}
        </Announce>
        <Results
          catalog={catalog}
          setup={searched.setup}
          goal={searched.goal}
          results={results}
          hasPopulation={Boolean(population)}
          cheese={catalog.cheeseName.get(setup.cheese) ?? 'This cheese'}
          charmsWithData={options.charms.filter((charm) => charm.hint).map((charm) => charm.name)}
        />
      </section>
    </div>
  );
}

/** Which items to search: everything in the game, or the hunter's own, kept on this device. */
function OwnedItemsCard({
  catalog,
  items,
  mineOnly,
  onMineOnly,
  onItems,
  imported,
  undo,
  onUndo,
}: {
  catalog: Catalog;
  items: OwnedItems;
  mineOnly: boolean;
  onMineOnly: (mineOnly: boolean) => void;
  /** `all` when every tick shown was set or cleared at once, which can be undone. */
  onItems: (items: OwnedItems, all?: boolean) => void;
  imported: boolean;
  undo: Undo | null;
  onUndo: () => void;
}) {
  const [kind, setKind] = useState<(typeof KINDS)[number]['key']>('weapons');
  const [query, setQuery] = useState('');
  const all = { weapons: catalog.weapons, bases: catalog.bases, charms: catalog.charms };
  const list = [...all[kind].values()];
  const needle = query.trim().toLowerCase();
  const shown = needle ? list.filter((item) => item.name.toLowerCase().includes(needle)) : list;
  const mine = new Set(items[kind]);
  const set = (types: string[], everyShown = false) => onItems({ ...items, [kind]: types }, everyShown);
  const linkClasses =
    'font-medium text-pink-700 underline decoration-pink-700/30 underline-offset-2 hover:text-pink-900 hover:decoration-pink-900 dark:text-pink-300 dark:decoration-pink-300/40 dark:hover:text-pink-200';

  return (
    <fieldset className={clsx(cardClasses, 'space-y-4')}>
      <legend className="sr-only">Your items</legend>
      <div>
        <p className="text-sm font-medium text-zinc-950 dark:text-white">Your items</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {mineOnly
            ? `Searching your ${formatNumber(items.weapons.length)} weapons, ${formatNumber(items.bases.length)} bases and ${formatNumber(items.charms.length)} charms.`
            : isEmpty(items)
              ? 'Searching every weapon and base in the game. Tick the ones you own to see what you can use today.'
              : 'Searching every weapon and base in the game.'}
          {imported && mineOnly ? ' These came from the link you opened.' : ''}
          {undo?.of === 'link' && mineOnly && (
            <>
              {' '}
              <button type="button" className={linkClasses} onClick={onUndo}>
                Use my saved items instead
              </button>
            </>
          )}
        </p>
      </div>
      <div
        className="grid grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="Which items"
        tabIndex={-1}
        onKeyDown={radioKeys}
      >
        {(
          [
            [false, 'Every item'],
            [true, 'Only mine'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={mineOnly === value}
            tabIndex={mineOnly === value ? 0 : -1}
            onClick={() => onMineOnly(value)}
            className={clsx(
              'rounded-xl px-3 py-2 text-sm font-medium ring-1 transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500',
              mineOnly === value
                ? 'bg-pink-50 text-pink-900 ring-2 ring-pink-600 dark:bg-pink-950/50 dark:text-pink-100 dark:ring-pink-400'
                : 'bg-white text-zinc-800 ring-zinc-200 hover:ring-zinc-300 dark:bg-white/5 dark:text-zinc-200 dark:ring-zinc-700',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mineOnly && (
        <div className="space-y-3">
          <div className="inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" role="group" aria-label="Item kind">
            {KINDS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={kind === key}
                onClick={() => setKind(key)}
                className={clsx(
                  'rounded-md px-3 py-1 text-sm font-medium transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500',
                  kind === key
                    ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white',
                )}
              >
                {label} <span className="tabular-nums text-xs font-normal">{formatNumber(items[key].length)}</span>
              </button>
            ))}
          </div>
          <input
            type="search"
            aria-label={`Find ${kind}`}
            placeholder={`Find ${kind}`}
            className={fieldClasses}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex gap-3 text-sm">
            <button
              type="button"
              className="font-medium text-pink-700 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200"
              onClick={() => set([...new Set([...mine, ...shown.map((item) => item.type)])], true)}
            >
              Tick all{needle ? ' shown' : ''}
            </button>
            <button
              type="button"
              className="font-medium text-pink-700 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200"
              onClick={() =>
                set(
                  [...mine].filter((type) => !shown.some((item) => item.type === type)),
                  true,
                )
              }
            >
              Untick all{needle ? ' shown' : ''}
            </button>
            {undo?.of === 'all' && (
              <button type="button" className={clsx(linkClasses, 'ml-auto')} onClick={onUndo}>
                Undo
              </button>
            )}
          </div>
          <ul className="max-h-80 space-y-0.5 overflow-y-auto rounded-xl bg-zinc-50 p-1.5 dark:bg-white/5">
            {shown.map((item) => (
              <li key={item.type}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-zinc-800 hover:bg-white dark:text-zinc-200 dark:hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={mine.has(item.type)}
                    onChange={(event) =>
                      set(event.target.checked ? [...mine, item.type] : [...mine].filter((type) => type !== item.type))
                    }
                    className="size-4 rounded border-zinc-300 text-pink-600 focus:ring-pink-500 dark:border-zinc-600"
                  />
                  <GameImage
                    src={itemImageUrl(item.type)}
                    width={24}
                    height={24}
                    className="size-6 shrink-0 rounded object-contain"
                  />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                </label>
              </li>
            ))}
            {shown.length === 0 && (
              <li className="px-2 py-2 text-sm text-zinc-600 dark:text-zinc-400">Nothing matches.</li>
            )}
          </ul>
        </div>
      )}
    </fieldset>
  );
}

function Results({
  catalog,
  setup,
  goal,
  results,
  hasPopulation,
  cheese,
  charmsWithData,
}: {
  catalog: Catalog;
  setup: Setup;
  goal: Goal;
  results: RankedSetup[];
  hasPopulation: boolean;
  cheese: string;
  /** Charms that have their own attraction data for this location and cheese. */
  charmsWithData: string[];
}) {
  const [shown, setShown] = useState(PAGE);
  if (setup.location && !hasPopulation) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-base font-medium text-zinc-900 dark:text-white">No attraction data for this cheese here</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          <NoDataHint cheese={cheese} charmsWithData={charmsWithData} />
        </p>
      </div>
    );
  }
  if (!setup.location) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-base font-medium text-zinc-900 dark:text-white">Pick where you’re hunting</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          The best weapon and base for the location and cheese show up here.
        </p>
      </div>
    );
  }
  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-base font-medium text-zinc-900 dark:text-white">No weapons or bases to try</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Tick at least one weapon and one base under Your items.
        </p>
      </div>
    );
  }

  const targetName = goal.kind === 'mouse' ? catalog.mice.get(goal.mouse)?.name : undefined;
  const name = (map: Map<string, { name: string }>, type: string) => map.get(type)?.name ?? type;
  const tied = tiedForBest(results, goal);

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        {goal.kind === 'mouse'
          ? `The setups that catch the most ${targetName ?? 'of that mouse'} per 100 hunts.`
          : 'The setups that catch the most mice per 100 hunts.'}
        {tied > 1 &&
          ` ${tied === results.length ? 'Every setup listed catches' : `The first ${tied} catch`} the same, so any of them will do.`}
      </p>
      <ol className="space-y-2">
        {results.slice(0, shown).map((result, index) => {
          const link = setupToParams({ ...setup, weapon: result.weapon, base: result.base, charm: result.charm });
          return (
            <li
              key={`${result.weapon}|${result.base}|${result.charm}`}
              className={clsx(
                'flex flex-col gap-3 rounded-2xl p-4 shadow-xs ring-1 sm:flex-row sm:items-center',
                index === 0
                  ? 'bg-linear-to-br from-pink-50 via-white to-amber-50 ring-pink-200 dark:from-pink-950/30 dark:via-zinc-900 dark:to-amber-950/20 dark:ring-pink-900'
                  : 'bg-white ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800',
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                {(
                  [
                    [result.weapon, name(catalog.weapons, result.weapon)],
                    [result.base, name(catalog.bases, result.base)],
                    ...(result.charm ? [[result.charm, name(catalog.charms, result.charm)]] : []),
                  ] as [string, string][]
                ).map(([type, itemName]) => (
                  <p
                    key={type}
                    className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    <GameImage
                      src={itemImageUrl(type)}
                      width={24}
                      height={24}
                      className="size-6 shrink-0 rounded object-contain"
                    />
                    <span className="truncate">{itemName}</span>
                  </p>
                ))}
                <p className="text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                  {formatNumber(result.trap.power)} {powerTypeLabel(result.trap.powerType)} power,{' '}
                  {formatNumber(result.trap.luck)} luck, {result.trap.attraction}% attraction bonus
                </p>
              </div>
              <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end">
                <p className="text-right">
                  <span className="block text-2xl font-semibold tabular-nums text-zinc-950 dark:text-white">
                    {(goal.kind === 'mouse' ? (result.target?.catches ?? 0) : result.catches).toFixed(
                      goal.kind === 'mouse' ? 2 : 1,
                    )}
                  </span>
                  <span className="block text-xs text-zinc-600 dark:text-zinc-400">
                    {goal.kind === 'mouse'
                      ? `per 100 hunts, ${((result.target?.catchRate ?? 0) * 100).toFixed(1)}% catch rate`
                      : `per 100 hunts, ${(result.catchRate * 100).toFixed(1)}% caught`}
                  </span>
                </p>
                <Link
                  href={`/catch-rate-estimator?${link.toString()}`}
                  className="inline-block py-0.5 text-sm font-medium whitespace-nowrap text-pink-700 underline decoration-pink-700/30 underline-offset-2 hover:text-pink-900 hover:decoration-current dark:text-pink-300 dark:decoration-pink-300/40 dark:hover:text-pink-200"
                >
                  See each mouse
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
      {results.length > shown && (
        <button
          type="button"
          onClick={() => setShown(shown + PAGE)}
          className="w-full rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 hover:ring-zinc-300 hover:text-zinc-950 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:text-white"
        >
          Show {Math.min(PAGE, results.length - shown)} more
        </button>
      )}
    </div>
  );
}
