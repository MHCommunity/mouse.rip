'use client';

import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Announce } from '@/components/announce';
import { GameImage } from '@/components/game-image';
import { Input } from '@/components/input';
import { Link } from '@/components/link';
import { loadMouseIndex, type IndexedMouse } from '@/lib/client-index';
import { cleanNumber, findMouseByName, rankUp, type RankTitle } from '@/lib/rank-up';
import { formatNumber } from '@/utils';
import { HEADLINE_PANEL } from '@/components/panel';
import { ItemPicker } from '@/components/item-picker';
import { mouseImageUrl } from '@/lib/image-urls';

export type { RankTitle } from '@/lib/rank-up';

/** What the hunter has entered, as it goes in the URL and in local storage. */
interface Entries {
  /** Title ids. */
  title: string;
  target: string;
  progress: string;
  wisdom: string;
  mouse: string;
}

const KEYS = ['title', 'target', 'progress', 'wisdom', 'mouse'] as const;
const STORAGE_KEY = 'mouse.rip:rank-up-calculator';

/** Stands in for local storage while the server renders, where there is none. */
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

/** The last entries on this device, so a returning hunter doesn't type them again. */
function parseEntries(stored: string): Partial<Entries> {
  try {
    const saved: unknown = JSON.parse(stored || '{}');
    if (!saved || typeof saved !== 'object') return {};
    return Object.fromEntries(
      KEYS.flatMap((key) => {
        const value = (saved as Record<string, unknown>)[key];
        return typeof value === 'string' ? [[key, value]] : [];
      }),
    );
  } catch {
    // Something other than our JSON is stored under the key; start fresh.
    return {};
  }
}

function saveEntries(entries: Entries) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Blocked storage only means the next visit starts fresh.
  }
}

/** A shared link's entries win; without one, pick up where this device left off. */
export function RankUpCalculatorFromUrl({ titles }: { titles: RankTitle[] }) {
  const params = useSearchParams();
  // Read after hydration, so the first client render matches the server's.
  const stored = useSyncExternalStore(noSubscribe, readStorage, () => ON_SERVER);
  const linked = KEYS.some((key) => params.has(key));
  const ready = linked || stored !== ON_SERVER;
  const initial = linked
    ? Object.fromEntries(KEYS.flatMap((key) => (params.has(key) ? [[key, params.get(key) ?? '']] : [])))
    : parseEntries(ready ? stored : '');
  // The calculator takes its entries once, so it mounts again when the saved ones arrive.
  return (
    <RankUpCalculator
      key={ready ? 'ready' : 'server'}
      titles={titles}
      initial={initial}
      restored={!linked && ready && Object.keys(initial).length > 0}
      syncUrl
    />
  );
}

const labelClasses = 'flex flex-col gap-1.5 text-sm font-medium text-zinc-950 dark:text-white';
const hintClasses = 'text-xs font-normal text-zinc-600 dark:text-zinc-400';
const selectClasses =
  'w-full rounded-lg border border-zinc-950/45 bg-white px-3 py-2.5 text-base/6 text-zinc-950 shadow-sm hover:border-zinc-950/60 focus:border-pink-500 focus:outline-hidden focus:ring-2 focus:ring-pink-500 sm:py-1.5 sm:text-sm/6 dark:border-white/35 dark:bg-white/5 dark:text-white dark:scheme-dark dark:hover:border-white/45';

export function RankUpCalculator({
  titles,
  initial = {},
  restored = false,
  syncUrl,
}: {
  titles: RankTitle[];
  initial?: Partial<Entries>;
  /** The entries came from the last visit, not from a link, so the address doesn't have them yet. */
  restored?: boolean;
  /** Off for the prerendered fallback, which mustn't rewrite a link it couldn't read. */
  syncUrl: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [entries, setEntries] = useState<Entries>(() => ({
    title: titles[0].id,
    target: titles[1]?.id ?? '',
    progress: '',
    wisdom: '',
    mouse: '',
    ...initial,
  }));
  // Every mouse's wisdom comes from the shared mouse index, fetched only once someone wants catches.
  const [mice, setMice] = useState<IndexedMouse[] | null>(null);

  const titleIndex = (id: string) => titles.findIndex((title) => title.id === id);
  const currentIndex = Math.max(0, titleIndex(entries.title));
  const targetIndex = titleIndex(entries.target);
  const progress = cleanNumber(entries.progress, true);
  const exactWisdom = cleanNumber(entries.wisdom);
  const mouseName = entries.mouse;

  const [wantsMice, setWantsMice] = useState(false);
  // Which try at loading the list last failed, if one did. Using the field again makes a new try.
  const [tries, setTries] = useState(0);
  const [failedTry, setFailedTry] = useState<number | null>(null);
  const miceFailed = failedTry === tries;

  // Fetch the list once the field is used, or when a link or a saved visit arrives with a mouse filled in.
  useEffect(() => {
    if (mice || !(wantsMice || mouseName)) return;
    let current = true;
    loadMouseIndex()
      .then((index) => {
        if (current) {
          setMice(index.filter((m) => (m.wisdom ?? 0) > 0).sort((a, b) => a.name.localeCompare(b.name)));
        }
      })
      .catch(() => {
        // Without the list there's no catches answer. Say so, and let the next use of the field try again.
        if (current) setFailedTry(tries);
      });
    return () => {
      current = false;
    };
  }, [mice, wantsMice, mouseName, tries]);

  // Entries picked up from the last visit go into the address once, so it can be copied and shared as it is.
  const addressed = useRef(false);
  useEffect(() => {
    if (!syncUrl || !restored || addressed.current) return;
    addressed.current = true;
    const params = new URLSearchParams();
    for (const key of KEYS) if (entries[key]) params.set(key, entries[key]);
    const query = params.toString();
    if (query) window.history.replaceState(null, '', `${pathname}?${query}`);
  }, [syncUrl, restored, entries, pathname]);

  const startOver = () => {
    setEntries({ title: titles[0].id, target: titles[1]?.id ?? '', progress: '', wisdom: '', mouse: '' });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Blocked storage has nothing saved to remove.
    }
    if (syncUrl) router.replace(pathname, { scroll: false });
  };
  const started =
    entries.title !== titles[0].id || Boolean(entries.progress || entries.wisdom || entries.mouse) || targetIndex > 1;

  const change = (patch: Partial<Entries>) => {
    const next = { ...entries, ...patch };
    // Keep the target above the current title.
    if (titleIndex(next.target) <= titleIndex(next.title)) next.target = titles[titleIndex(next.title) + 1]?.id ?? '';
    setEntries(next);
    saveEntries(next);
    if (!syncUrl) return;
    const params = new URLSearchParams();
    for (const key of KEYS) if (next[key]) params.set(key, next[key]);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const {
    current,
    currentIndex: fromIndex,
    next,
    target,
    wisdom,
    steps,
    needed,
  } = rankUp(titles, {
    currentIndex,
    targetIndex,
    progress,
    exactWisdom,
  });
  const mouse = findMouseByName(mice, mouseName);
  const mouseOptions = useMemo(
    () => (mice ?? []).map((m) => ({ value: m.name, name: m.name, image: mouseImageUrl(m.type) })),
    [mice],
  );

  return (
    <div className="space-y-8">
      <form className="space-y-5" aria-label="Your title and wisdom" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClasses}>
            Current title
            <select
              className={selectClasses}
              value={currentIndex}
              onChange={(e) => change({ title: titles[Number(e.target.value)].id })}
            >
              {titles.map((title, index) => (
                <option key={title.id} value={index}>
                  {title.name}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasses}>
            Progress to the next title (%)
            <Input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 42.5"
              value={progress}
              disabled={Boolean(exactWisdom) || !next}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                change({ progress: cleanNumber(e.target.value, true) })
              }
            />
          </label>

          <label className={labelClasses}>
            <span>
              Exact wisdom <span className={hintClasses}>(optional, replaces the title and progress)</span>
            </span>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 7,500,000"
              value={exactWisdom ? formatNumber(Number(exactWisdom)) : ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => change({ wisdom: cleanNumber(e.target.value) })}
            />
          </label>

          <label className={labelClasses}>
            Target title
            <select
              className={selectClasses}
              value={target ? titles.indexOf(target) : ''}
              disabled={!next}
              onChange={(e) => change({ target: titles[Number(e.target.value)].id })}
            >
              {titles.slice(fromIndex + 1).map((title) => (
                <option key={title.id} value={titles.indexOf(title)}>
                  {title.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {started && (
          <button
            type="button"
            onClick={startOver}
            className="text-sm font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-950 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-zinc-400 dark:decoration-zinc-600 dark:hover:text-white"
          >
            Start over
          </button>
        )}
      </form>

      <Announce>
        {!target
          ? `${current.name} is the top title.`
          : needed === 0
            ? `You've already reached ${target.name}.`
            : `${formatNumber(needed)} wisdom needed for ${target.name}.${
                mouse ? ` ${formatNumber(Math.ceil(needed / (mouse.wisdom ?? 1)))} catches of ${mouse.name}.` : ''
              }`}
      </Announce>
      <section aria-label="Result" className={`p-5 ${HEADLINE_PANEL}`}>
        {!target ? (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {current.name} is the top title, so there&rsquo;s nowhere left to climb.
          </p>
        ) : needed === 0 ? (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            With {formatNumber(Math.floor(wisdom))} wisdom you&rsquo;ve already reached{' '}
            <strong className="font-semibold text-zinc-950 dark:text-white">{target.name}</strong>.
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Wisdom needed for {target.name}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-zinc-950 dark:text-white">
              {formatNumber(needed)}
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              You have {formatNumber(Math.floor(wisdom))} of the {formatNumber(target.wisdom)} it takes.
            </p>

            <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <div className="max-w-sm">
                <ItemPicker
                  label="In catches of (optional)"
                  options={mouseOptions}
                  value={mouse?.name ?? ''}
                  onChange={(name) => change({ mouse: name })}
                  onUse={() => {
                    setWantsMice(true);
                    if (miceFailed) setTries(tries + 1);
                  }}
                  loading={!mice && !miceFailed}
                  failed={!mice && miceFailed}
                  placeholder="Type a mouse, e.g. Glazy"
                  clearable
                  clearLabel="No mouse"
                />
              </div>
              {mouse && (
                <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <strong className="font-semibold text-zinc-950 dark:text-white">
                    {formatNumber(Math.ceil(needed / (mouse.wisdom ?? 1)))}
                  </strong>{' '}
                  catches of{' '}
                  <Link
                    href={`/mice/${mouse.type.replaceAll('_', '-')}`}
                    className="font-medium text-pink-700 underline decoration-pink-700/30 underline-offset-2 hover:text-pink-900 hover:decoration-current dark:text-pink-300 dark:decoration-pink-300/40"
                  >
                    {mouse.name}
                  </Link>
                  , at {formatNumber(mouse.wisdom ?? 0)} wisdom each.
                </p>
              )}
            </div>
          </>
        )}
      </section>

      {target && needed > 0 && steps.length > 1 && (
        <section aria-labelledby="rank-steps-heading">
          <h2 id="rank-steps-heading" className="text-base/7 font-semibold text-zinc-900 dark:text-white">
            Titles on the way
          </h2>
          <ol className="mt-3 divide-y divide-zinc-100 rounded-2xl shadow-xs ring-1 ring-zinc-200 bg-white dark:divide-zinc-800 dark:ring-zinc-800 dark:bg-zinc-900">
            {steps.map((title) => (
              <li key={title.id} className="flex items-center gap-3 px-4 py-2.5">
                <GameImage src={title.image} width={28} height={28} className="size-7 shrink-0" />
                <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{title.name}</span>
                <span className="text-right text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                  {formatNumber(Math.ceil(title.wisdom - wisdom))} more
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
