'use client';

import { ArrowUpRightIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useMemo, useState } from 'react';

import { formatGold, formatSb } from '@/utils';
import { SectionHeading } from '@/components/section-heading';

export interface PricePoint {
  date: string;
  price: number;
  sb_price: number;
  volume: number | null;
}

interface MarkethuntResponse {
  item_info?: { item_id: number; name: string; currently_tradeable: boolean };
  market_data?: PricePoint[];
}

type State =
  | { status: 'loading' }
  | { status: 'ready'; data: MarkethuntResponse }
  | { status: 'empty' }
  | { status: 'error' };

const RANGES = [
  { key: '90d', label: '90d', days: 90, period: 'over 90 days' },
  { key: '1y', label: '1y', days: 365, period: 'over the past year' },
  { key: 'all', label: 'All', days: Number.POSITIVE_INFINITY, period: null },
] as const;

type RangeKey = (typeof RANGES)[number]['key'];

function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Markethunt's YYYY-MM-DD as "Oct 14, 2026". Read as UTC so the day doesn't shift with the visitor's time zone. */
export function formatPriceDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : dateFormat.format(parsed);
}
const formatDate = formatPriceDate;

/** Markethunt only has a price for days an item traded. Past this, the latest one is history, not today's price. */
const CURRENT_PRICE_DAYS = 14;

/** Whether a Markethunt date is recent enough to call its price current. */
export function isCurrentPrice(date: string, now: number): boolean {
  const time = new Date(`${date}T00:00:00Z`).getTime();
  return Number.isFinite(time) && now - time <= CURRENT_PRICE_DAYS * 86_400_000;
}

/** A day's entry with the fields the card needs, whatever else the response holds. */
function isPricePoint(point: unknown): point is PricePoint {
  if (!point || typeof point !== 'object') return false;
  const { date, price } = point as Record<string, unknown>;
  return typeof date === 'string' && typeof price === 'number' && Number.isFinite(price);
}

// Chart geometry (SVG user units; the element itself is responsive).
const W = 640;
const H = 220;
const PRICE_TOP = 10;
const PRICE_BOTTOM = 168;
const VOL_TOP = 178;
const VOL_BOTTOM = 214;

export function PriceChart({ points }: { points: PricePoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const series = useMemo(() => {
    // Downsample long series so the path stays light; always keep the last point.
    if (points.length <= 400) return points;
    const stride = Math.ceil(points.length / 400);
    const sampled = points.filter((_, index) => index % stride === 0);
    if (sampled[sampled.length - 1] !== points[points.length - 1]) {
      sampled.push(points[points.length - 1]);
    }
    return sampled;
  }, [points]);

  const geometry = useMemo(() => {
    const prices = series.map((point) => point.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const step = series.length > 1 ? W / (series.length - 1) : W;
    const xFor = (index: number) => index * step;
    const yFor = (price: number) => PRICE_BOTTOM - ((price - min) / range) * (PRICE_BOTTOM - PRICE_TOP);

    const line = series
      .map((point, index) => `${index === 0 ? 'M' : 'L'}${xFor(index).toFixed(1)},${yFor(point.price).toFixed(1)}`)
      .join(' ');
    const area = `${line} L${W},${PRICE_BOTTOM} L0,${PRICE_BOTTOM} Z`;

    const maxVolume = Math.max(...series.map((point) => point.volume ?? 0), 1);
    const up = series[series.length - 1].price >= series[0].price;

    return { min, max, xFor, yFor, line, area, maxVolume, up };
  }, [series]);

  const hovered = hoverIndex !== null ? series[hoverIndex] : null;

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = (event.clientX - rect.left) / rect.width;
    const index = Math.round(fraction * (series.length - 1));
    setHoverIndex(Math.min(series.length - 1, Math.max(0, index)));
  };

  const stroke = geometry.up ? '#059669' : '#e11d48';
  // Screen readers get the shape of the chart as a sentence, since the chart itself is visual only.
  const first = series[0];
  const last = series[series.length - 1];
  const summary = `Price history from ${formatDate(first.date)} to ${formatDate(last.date)}: ${formatGold(first.price)} to ${formatGold(
    last.price,
  )} gold, ranging ${formatGold(geometry.min)} to ${formatGold(geometry.max)}.`;

  return (
    <div>
      {/* Hover readout. Holds its height when empty so the chart doesn't jump. */}
      <div className="flex h-5 items-center justify-end gap-3 text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
        {hovered && (
          <>
            <span>{formatDate(hovered.date)}</span>
            <span className="font-medium text-zinc-700 dark:text-zinc-200">{formatGold(hovered.price)} gold</span>
            <span>{formatSb(hovered.sb_price)} SUPER|brie+</span>
            <span>{hovered.volume != null ? `${formatCompact(hovered.volume)} traded` : ''}</span>
          </>
        )}
      </div>
      <div className="mt-1 flex">
        {/* Y-axis labels sit in their own gutter so the line never runs over them. Text lives in HTML,
            not the SVG: the SVG stretches to fit, which would distort it. */}
        <div aria-hidden="true" className="relative w-11 shrink-0">
          {[geometry.max, (geometry.max + geometry.min) / 2, geometry.min].map((value, i) => (
            <span
              key={i}
              className="pointer-events-none absolute right-2 -translate-y-1/2 text-[11px] tabular-nums text-zinc-600 dark:text-zinc-400"
              style={{ top: `${(geometry.yFor(value) / H) * 100}%` }}
            >
              {formatCompact(value)}
            </span>
          ))}
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="min-w-0 flex-1"
          preserveAspectRatio="none"
          role="img"
          aria-label={summary}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {/* Gridlines at min / mid / max */}
          {[geometry.max, (geometry.max + geometry.min) / 2, geometry.min].map((value, i) => (
            <g key={i}>
              <line
                x1={0}
                x2={W}
                y1={geometry.yFor(value)}
                y2={geometry.yFor(value)}
                className="stroke-zinc-200 dark:stroke-zinc-800"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </g>
          ))}

          <path d={geometry.area} fill={stroke} opacity={0.08} />
          <path
            d={geometry.line}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Volume bars */}
          {series.map((point, index) => {
            const volume = point.volume ?? 0;
            if (volume <= 0) return null;
            const height = (volume / geometry.maxVolume) * (VOL_BOTTOM - VOL_TOP);
            return (
              <rect
                key={index}
                x={geometry.xFor(index) - 1}
                y={VOL_BOTTOM - height}
                width={Math.max(2, W / series.length - 1)}
                height={height}
                className="fill-zinc-300 dark:fill-zinc-700"
              />
            );
          })}

          {/* Hover crosshair */}
          {hovered && hoverIndex !== null && (
            <g>
              <line
                x1={geometry.xFor(hoverIndex)}
                x2={geometry.xFor(hoverIndex)}
                y1={PRICE_TOP}
                y2={VOL_BOTTOM}
                className="stroke-zinc-400 dark:stroke-zinc-500"
                strokeWidth={1}
              />
              <circle cx={geometry.xFor(hoverIndex)} cy={geometry.yFor(hovered.price)} r={3.5} fill={stroke} />
            </g>
          )}
        </svg>
      </div>
      <div
        aria-hidden="true"
        className="mt-1 ml-11 flex justify-between text-[11px] tabular-nums text-zinc-600 dark:text-zinc-400"
      >
        <span>{formatDate(series[0].date)}</span>
        <span>{formatDate(series[series.length - 1].date)}</span>
      </div>
    </div>
  );
}

export function MarketPrice({ itemId }: { itemId: number }) {
  const [result, setResult] = useState<{ itemId: number; attempt: number; state: State } | null>(null);
  const [attempt, setAttempt] = useState(0);
  // Don't leave the previous item's chart up while this one loads.
  const state: State = result?.itemId === itemId && result.attempt === attempt ? result.state : { status: 'loading' };

  useEffect(() => {
    let active = true;
    const setState = (next: State) => setResult({ itemId, attempt, state: next });
    // Without a limit, a request that stalls leaves the loading block pulsing with no "Try again".
    fetch(`https://api.markethunt.win/items/${itemId}`, { signal: AbortSignal.timeout(15_000) })
      .then((res) => (res.ok ? (res.json() as Promise<MarkethuntResponse>) : Promise.reject()))
      .then((data) => {
        if (!active) return;
        // Markethunt isn't ours: keep only the days that read as a date and a price, so a change on their side
        // shows as no chart rather than breaking the page.
        const points = Array.isArray(data?.market_data) ? data.market_data.filter(isPricePoint) : [];
        if (points.length === 0) {
          setState({ status: 'empty' });
        } else {
          setState({ status: 'ready', data: { ...data, market_data: points } });
        }
      })
      .catch(() => active && setState({ status: 'error' }));
    return () => {
      active = false;
    };
  }, [itemId, attempt]);

  // Items with no marketplace history get no section at all.
  if (state.status === 'empty') return null;

  return (
    <section className="mt-10">
      <SectionHeading>Marketplace price</SectionHeading>

      {state.status === 'loading' && attempt === 0 && (
        <div className="mt-4 h-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      )}

      {/* While a retry is under way the message stays, with its button, so the keyboard isn't left on nothing. */}
      {(state.status === 'error' || (state.status === 'loading' && attempt > 0)) && (
        <p className="mt-4 rounded-2xl ring-1 ring-zinc-200 px-4 py-3 text-sm text-zinc-700 dark:ring-zinc-800 dark:text-zinc-300">
          Couldn&rsquo;t load prices from Markethunt.{' '}
          <button
            type="button"
            aria-disabled={state.status === 'loading'}
            onClick={() => state.status === 'error' && setAttempt((n) => n + 1)}
            className="font-medium text-pink-700 underline underline-offset-2 hover:text-pink-900 aria-disabled:text-zinc-500 aria-disabled:no-underline dark:text-pink-300 dark:hover:text-pink-200 dark:aria-disabled:text-zinc-400"
          >
            {state.status === 'loading' ? 'Trying again…' : 'Try again'}
          </button>{' '}
          or{' '}
          <a
            href={`https://markethunt.win/?item_id=${itemId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-pink-700 underline underline-offset-2 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200"
          >
            open it on Markethunt
          </a>
          .
        </p>
      )}

      {state.status === 'ready' && <MarketCard itemId={itemId} data={state.data} />}
    </section>
  );
}

function MarketCard({ itemId, data }: { itemId: number; data: MarkethuntResponse }) {
  const series = data.market_data!;
  const [range, setRange] = useState<RangeKey>('90d');
  const [showTable, setShowTable] = useState(false);

  const latest = series[series.length - 1];
  const latestTime = new Date(latest.date).getTime();
  // Read once: the card is drawn after the prices arrive in the browser, so there's no server render to match.
  const [now] = useState(() => Date.now());
  const current = isCurrentPrice(latest.date, now);

  const selected = RANGES.find((option) => option.key === range)!;
  const window = useMemo(() => {
    const days = RANGES.find((option) => option.key === range)!.days;
    if (!Number.isFinite(days)) return series;
    const cutoff = latestTime - days * 86400000;
    const sliced = series.filter((point) => new Date(point.date).getTime() >= cutoff);
    return sliced.length > 1 ? sliced : series.slice(-2);
  }, [series, range, latestTime]);

  // The trend figure covers the same span as the chart, so it changes with the range buttons.
  const start = window[0];
  const change = start.price ? ((latest.price - start.price) / start.price) * 100 : 0;
  const up = change >= 0;
  const period = selected.period ?? `since ${formatDate(start.date)}`;

  const high = window.reduce((best, point) => (point.price > best.price ? point : best), window[0]);
  const low = window.reduce((best, point) => (point.price < best.price ? point : best), window[0]);

  return (
    <div className="mt-4 rounded-2xl shadow-xs ring-1 ring-zinc-200 bg-white p-4 sm:p-5 dark:ring-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-semibold tabular-nums text-zinc-900 dark:text-white">
            {formatGold(latest.price)}
            <span className="ml-1.5 text-base font-normal text-zinc-600 dark:text-zinc-400">gold</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {current ? (
              <span
                className={
                  up
                    ? 'font-medium text-emerald-700 dark:text-emerald-400'
                    : 'font-medium text-rose-700 dark:text-rose-400'
                }
              >
                <span aria-hidden="true">{up ? '▲' : '▼'}</span>
                <span className="sr-only">{up ? 'Up' : 'Down'}</span> {Math.abs(change).toFixed(1)}% {period}
              </span>
            ) : (
              // An item that hasn't traded lately: the date matters more than a trend that ended back then.
              <span className="font-medium text-amber-800 dark:text-amber-300">
                Last traded {formatDate(latest.date)}
              </span>
            )}
            {/* SUPER|brie+ priced in itself is always 1 SB; skip the noise. */}
            {Math.abs(latest.sb_price - 1) > 0.001 && (
              <span className="text-zinc-600 dark:text-zinc-400">{formatSb(latest.sb_price)} SUPER|brie+</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            role="group"
            aria-label="Chart range"
            className="flex items-center gap-1 rounded-2xl ring-1 ring-zinc-200 p-0.5 dark:ring-zinc-800"
          >
            {RANGES.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setRange(option.key)}
                aria-pressed={range === option.key}
                className={`min-h-9 min-w-11 rounded-md px-3 text-sm font-medium transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 ${
                  range === option.key
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
            <div>
              High {formatCompact(high.price)} on {formatDate(high.date)}
            </div>
            <div>
              Low {formatCompact(low.price)} on {formatDate(low.date)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <PriceChart points={window} />
      </div>

      {/* Hovering the chart reads out a day's price, which a keyboard or a screen reader can't do. The same days,
          newest first, as a table; its rows are only made once it's opened. */}
      <details className="mt-3" onToggle={(event) => setShowTable(event.currentTarget.open)}>
        <summary className="cursor-pointer py-1 text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white">
          Show these prices as a table
        </summary>
        {showTable && (
          <div className="mt-2 max-h-72 overflow-y-auto rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
            <table className="w-full text-sm">
              <caption className="sr-only">Price and amount traded for each day in the chart</caption>
              <thead className="sticky top-0 bg-zinc-50 text-left text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Day
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Price
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Traded
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[...window].reverse().map((point) => (
                  <tr key={point.date}>
                    <th scope="row" className="px-3 py-1.5 text-left font-normal text-zinc-700 dark:text-zinc-300">
                      {formatDate(point.date)}
                    </th>
                    <td className="px-3 py-1.5 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
                      {formatGold(point.price)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                      {point.volume != null ? formatGold(point.volume) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-t border-zinc-100 pt-3 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        <span>
          <span className="block tabular-nums">
            {latest.volume != null && `${formatGold(latest.volume)} traded, `}as of {formatDate(latest.date)}
          </span>
        </span>
        <a
          href={`https://markethunt.win/?item_id=${itemId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-pink-700 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200"
        >
          Price history on Markethunt
          <span className="sr-only"> (opens in a new tab)</span>
          <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
