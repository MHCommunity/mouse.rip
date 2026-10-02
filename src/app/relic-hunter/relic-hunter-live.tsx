'use client';

import React, { useEffect, useState } from 'react';

import { Environment } from '@/types';
import { locationImageUrl } from '@/lib/image-urls';

type State =
  | { status: 'loading' }
  | { status: 'found'; environment: Environment }
  | { status: 'unknown' }
  | { status: 'error' };

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-stretch">
        <div className="relative w-24 shrink-0 self-stretch overflow-hidden border-r border-zinc-200 bg-gradient-to-b from-zinc-50 to-white dark:border-zinc-800 dark:from-zinc-100 dark:to-zinc-200 sm:w-32">
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

export function RelicHunterLive() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    fetch('https://api.mouse.rip/relic-hunter')
      .then((res) => res.json() as Promise<Environment>)
      .then((data) => {
        if (!active) return;
        if (!data || data.id === 'unknown' || !data.name) {
          setState({ status: 'unknown' });
        } else {
          setState({ status: 'found', environment: data });
        }
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });

    return () => {
      active = false;
    };
  }, []);

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
    const { environment } = state;
    return (
      <Card>
        <div className="flex items-center gap-4">
          {environment.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={locationImageUrl(environment.id)}
              alt=""
              className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-zinc-950/5 dark:ring-white/10"
            />
          )}
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              Currently hiding in
            </div>
            <div className="mt-0.5 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              {environment.name}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const message =
    state.status === 'unknown'
      ? "We're not tracking the Relic Hunter's location right now — check back soon."
      : "Couldn't reach the tracker just now. Give it a moment and try again.";

  return (
    <Card>
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
        Relic Hunter
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
    </Card>
  );
}
