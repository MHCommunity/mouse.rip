'use client';

import React, { useEffect, useState } from 'react';

import { Link } from '@/components/link';
import { locationImageUrl } from '@/lib/image-urls';
import { HEADLINE_PANEL } from '@/components/panel';

/** What the card needs of api.mouse.rip's answer. */
interface Sighting {
  id: string;
  name: string;
  hasImage: boolean;
  /** When a hunter last reported her there, as "20 minutes ago"; empty when the API doesn't say. */
  seen: string;
}

type State =
  | { status: 'loading' }
  | { status: 'found'; sighting: Sighting }
  | { status: 'unknown' }
  | { status: 'error' };

/** She moves once a day, so an open tab checks again this often while it's in view. */
const REFRESH_MS = 10 * 60_000;

const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

/** "20 minutes ago", "3 hours ago", "yesterday". */
function ago(iso: unknown, now: number): string {
  const time = typeof iso === 'string' ? Date.parse(iso) : Number.NaN;
  if (!Number.isFinite(time)) return '';
  const minutes = Math.max(0, Math.round((now - time) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return relative.format(-minutes, 'minute');
  const hours = Math.round(minutes / 60);
  return hours < 24 ? relative.format(-hours, 'hour') : relative.format(-Math.round(hours / 24), 'day');
}

function readSighting(data: unknown, now: number): Sighting | null {
  const { id, name, image, last_seen } = (data ?? {}) as Record<string, unknown>;
  if (typeof id !== 'string' || typeof name !== 'string' || id === 'unknown' || !name) return null;
  return { id, name, hasImage: Boolean(image), seen: ago(last_seen, now) };
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className={`relative overflow-hidden ${HEADLINE_PANEL}`} role="status" aria-live="polite">
      <div className="flex items-stretch">
        <div className="relative w-24 shrink-0 self-stretch overflow-hidden border-r border-pink-100 bg-white/60 dark:border-zinc-800 dark:from-zinc-100 dark:to-zinc-200 sm:w-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/relic-hunter.jpg"
            alt="The Relic Hunter"
            className="absolute inset-0 size-full object-cover object-top"
          />
        </div>
        <div className="min-w-0 flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}

export function RelicHunterLive({ locationIds }: { locationIds: string[] }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let lastFetch = 0;

    const load = () => {
      lastFetch = Date.now();
      fetch('https://api.mouse.rip/relic-hunter', { signal: AbortSignal.timeout(10_000) })
        .then((res) => (res.ok ? (res.json() as Promise<unknown>) : Promise.reject()))
        .then((data) => {
          if (!active) return;
          const sighting = readSighting(data, Date.now());
          setState(sighting ? { status: 'found', sighting } : { status: 'unknown' });
        })
        .catch(() => {
          // A refresh that fails leaves where she was on screen; only a first load with no answer is an error.
          if (active) setState((current) => (current.status === 'found' ? current : { status: 'error' }));
        });
    };
    load();

    // A tab left open overnight would go on naming yesterday's location. Check again when it comes back into
    // view, and every so often while it stays there.
    const refresh = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastFetch > REFRESH_MS) load();
    };
    const interval = window.setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [attempt]);

  if (state.status === 'loading') {
    return (
      <Card>
        <div className="flex items-center gap-4">
          <div className="size-12 shrink-0 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-5 w-44 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      </Card>
    );
  }

  if (state.status === 'found') {
    const { sighting } = state;
    const slug = sighting.id.replaceAll('_', '-');
    return (
      <Card>
        <div className="flex items-center gap-4">
          {sighting.hasImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={locationImageUrl(sighting.id)}
              alt=""
              className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-zinc-950/5 dark:ring-white/10"
            />
          )}
          <div className="min-w-0">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Currently hiding in</div>
            <div className="mt-0.5 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              {locationIds.includes(slug) ? (
                <Link
                  href={`/locations/${slug}`}
                  className="underline decoration-zinc-300 underline-offset-4 hover:text-pink-700 hover:decoration-pink-700 dark:decoration-zinc-600 dark:hover:text-pink-300 dark:hover:decoration-pink-300"
                >
                  {sighting.name}
                </Link>
              ) : (
                sighting.name
              )}
            </div>
            {sighting.seen && (
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Last seen there {sighting.seen}</div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {state.status === 'unknown' ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We&rsquo;re not tracking the Relic Hunter&rsquo;s location right now. Check back soon.
        </p>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Couldn&rsquo;t load her current location.{' '}
          <button
            type="button"
            onClick={() => {
              setState({ status: 'loading' });
              setAttempt((n) => n + 1);
            }}
            className="font-medium text-pink-700 underline underline-offset-2 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200"
          >
            Try again
          </button>
        </p>
      )}
    </Card>
  );
}
