import clsx from 'clsx';

/** Minluck bands, easiest to hardest. Each band reads in both themes. */
export const MINLUCK_BANDS = [
  { max: 9, label: 'Under 10', className: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200' },
  { max: 39, label: '10–39', className: 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200' },
  { max: 99, label: '40–99', className: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200' },
  { max: 300, label: '100–300', className: 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200' },
  { max: Infinity, label: 'Over 300', className: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200' },
] as const;

function bandFor(value: number) {
  return MINLUCK_BANDS.find((band) => value <= band.max) ?? MINLUCK_BANDS[MINLUCK_BANDS.length - 1];
}

export function ColorScaleBadge({ value = 0, className = '' }: { value?: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span
      className={clsx(
        'inline-block min-w-9 rounded-md px-1.5 py-1 text-center text-sm font-medium tabular-nums',
        bandFor(rounded).className,
        className,
      )}
    >
      {rounded}
    </span>
  );
}

/** A compact key for the minluck colour bands. */
export function MinluckLegend({ className }: { className?: string }) {
  return (
    <ul
      className={clsx(
        'flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-600 dark:text-zinc-400',
        className,
      )}
    >
      <li className="font-medium text-zinc-700 dark:text-zinc-300">Minluck</li>
      {MINLUCK_BANDS.map((band) => (
        <li key={band.label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={clsx('size-3 rounded-sm', band.className)} />
          {band.label}
        </li>
      ))}
    </ul>
  );
}
