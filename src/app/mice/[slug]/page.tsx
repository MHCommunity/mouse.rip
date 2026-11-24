import { notFound } from 'next/navigation';
import React from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { ExternalRefs } from '@/components/external-refs';
import { Heading } from '@/components/heading';
import { Link } from 'next-view-transitions';

import {
  getAllMice,
  getMiceForGroup,
  getMiceGroupBySlug,
  getMouseAttraction,
  getMouseBySlug,
  getMouseMaps,
  getMouseRanks,
  groupSlugForName,
  mouseSlug,
} from '@/lib/game-data';
import {
  POWER_TYPES,
  POWER_TYPE_CHIP,
  bestPowerTypes,
  descriptionToParagraphs,
  powerTypeLabel,
  powerTypeSetLabel,
} from '@/lib/power-types';
import { JsonLd } from '@/components/json-ld';
import { mouseJsonLd, mouseSeo } from '@/lib/entity-seo';
import { ogCard, pageMetadata } from '@/seo';
import { mouseImageUrl } from '@/lib/image-urls';
import { bestAttractionRow } from '@/lib/attraction';
import { formatNumber } from '@/utils';

import { MouseData } from './mouse-data';
import { SectionHeading } from '@/components/section-heading';
import { ColorScaleBadge } from '@/components/color-scale-badge';
import { CheeseCell, LocationCell } from '@/components/mhct-cells';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllMice().map((mouse) => ({ slug: mouseSlug(mouse.type) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mouse = getMouseBySlug(slug);
  if (!mouse) return { title: 'Not Found' };

  const { title, description } = mouseSeo(mouse, getMouseAttraction(mouse.id));
  return pageMetadata({
    title,
    description,
    path: `/mice/${slug}`,
    image: ogCard({
      title: mouse.name,
      eyebrow: mouse.group,
      subtitle: `${mouse.points_formatted ?? mouse.points.toLocaleString()} points · ${mouse.gold_formatted ?? mouse.gold.toLocaleString()} gold`,
      image: mouseImageUrl(slug),
      accent: 'emerald',
    }),
  });
}

function StatChip({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</div>
      <div className="mt-0.5 text-base font-semibold tabular-nums text-zinc-900 sm:text-lg dark:text-white">
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs tabular-nums text-zinc-600 dark:text-zinc-400">{sub}</div>}
    </div>
  );
}

/** MHCT reports rates in hundredths of a percent. */
function formatRate(rate: number): string {
  return `${(rate / 100).toFixed(2)}%`;
}

export default async function MousePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mouse = getMouseBySlug(slug);
  if (!mouse) notFound();

  const paragraphs = descriptionToParagraphs(mouse.description);
  const image = mouse.images ? mouseImageUrl(slug, 'large') : undefined;
  const groupSlug = groupSlugForName(mouse.group);
  const best = bestPowerTypes(mouse.effectivenesses as Record<string, number | undefined>);
  const ranks = getMouseRanks(mouse.id);
  const rankOf = (rank?: number) =>
    rank && ranks ? `#${rank.toLocaleString()} of ${ranks.total.toLocaleString()}` : undefined;

  // Other mice in the same group (same subgroup first, when it's big enough to fill the strip).
  const group = groupSlug ? getMiceGroupBySlug(groupSlug) : undefined;
  const groupMice = group ? getMiceForGroup(group).filter((other) => other.id !== mouse.id) : [];
  const subgroupMice = mouse.subgroup ? groupMice.filter((other) => other.subgroup === mouse.subgroup) : [];
  const relatedMice = (subgroupMice.length >= 4 ? subgroupMice : groupMice).slice(0, 8);

  // Power-type rows: any type that is effective or has a minluck. Types that share
  // both numbers collapse into one row, so a mouse every type catches equally reads
  // as one line, not eight identical ones.
  const eff = (mouse.effectivenesses ?? {}) as Record<string, number | undefined>;
  const minlucks = (mouse.minlucks ?? {}) as Record<string, number | undefined>;
  const typeRowMap = new Map<string, { types: string[]; effectiveness: number; minluck: number }>();
  for (const type of POWER_TYPES) {
    const effectiveness = eff[type] ?? 0;
    const minluck = minlucks[type] ?? 0;
    if (effectiveness <= 0 && minluck <= 0) continue;
    const key = `${effectiveness}:${minluck}`;
    const row = typeRowMap.get(key) ?? { types: [], effectiveness, minluck };
    row.types.push(type);
    typeRowMap.set(key, row);
  }
  const typeRows = [...typeRowMap.values()].sort((a, b) => b.effectiveness - a.effectiveness);
  const immuneTypes = POWER_TYPES.filter((type) => (eff[type] ?? 0) === 0);

  // The answer most visitors came for: the lowest minlucks and the best place to hunt.
  const catchRows = typeRows.filter((row) => row.minluck > 0).sort((a, b) => a.minluck - b.minluck);

  const attraction = getMouseAttraction(mouse.id);
  const bestSpot = bestAttractionRow(attraction);

  return (
    <div>
      <JsonLd data={mouseJsonLd(mouse, attraction, slug)} />

      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Mice', href: '/mice' }, { name: mouse.name }]} />

      <header className="flex items-start gap-4 sm:gap-6">
        {image && (
          // The game's mouse art is drawn on white, so it sits on a white plate in
          // both themes instead of turning into a bright square on dark.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className={`shrink-0 rounded-xl bg-white object-contain p-1.5 ring-1 ring-zinc-950/10 dark:ring-white/15 ${
              mouse.images?.is_landscape ? 'h-20 w-32 sm:h-40 sm:w-72' : 'size-20 sm:size-40'
            }`}
          />
        )}
        <div className="min-w-0">
          <Heading>{mouse.name}</Heading>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {groupSlug ? (
              <Link
                href={`/groups/${groupSlug}`}
                className="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
              >
                {mouse.group}
              </Link>
            ) : (
              mouse.group
            )}
            {mouse.subgroup ? ` · ${mouse.subgroup}` : ''}
          </p>
          {best.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Weak to</span>
              {best.map((type) => (
                <Link
                  key={type}
                  href={`/mice?weakto=${type}`}
                  title={`All mice weak to ${powerTypeLabel(type)}`}
                  className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium transition hover:ring-2 hover:ring-emerald-400 ${POWER_TYPE_CHIP[type] ?? ''}`}
                >
                  {powerTypeLabel(type)}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {(catchRows.length > 0 || bestSpot) && (
        <section
          aria-label="How to catch it"
          className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60"
        >
          <dl className="grid divide-y divide-zinc-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-zinc-800">
            {catchRows.length > 0 && (
              <div className="px-4 py-3">
                <dt className="text-sm text-zinc-600 dark:text-zinc-400">Minluck</dt>
                <dd className="mt-1.5 space-y-1">
                  {catchRows.slice(0, 3).map((row) => (
                    <div key={row.types.join('-')} className="flex items-center gap-2">
                      <ColorScaleBadge value={row.minluck} />
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {powerTypeSetLabel(row.types)}
                      </span>
                    </div>
                  ))}
                </dd>
              </div>
            )}
            {bestSpot && (
              <div className="px-4 py-3">
                <dt className="text-sm text-zinc-600 dark:text-zinc-400">Best attraction rate</dt>
                <dd className="mt-1 text-sm">
                  <span className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
                    {formatRate(bestSpot.rate)}
                  </span>
                  <span className="mt-0.5 block">
                    <LocationCell location={bestSpot.location} stage={bestSpot.stage} />
                    <span className="text-zinc-600 dark:text-zinc-400"> with </span>
                    <CheeseCell cheese={bestSpot.cheese} />
                    {bestSpot.charm && (
                      <>
                        <span className="text-zinc-600 dark:text-zinc-400"> and </span>
                        <span className="text-zinc-700 dark:text-zinc-300">{bestSpot.charm}</span>
                      </>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                    {bestSpot.total_hunts ? `From ${formatNumber(bestSpot.total_hunts)} hunts` : 'From MH-Tools'}
                  </span>
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <StatChip
          label="Points"
          value={mouse.points_formatted ?? mouse.points.toLocaleString()}
          sub={rankOf(ranks?.points)}
        />
        <StatChip label="Gold" value={mouse.gold_formatted ?? mouse.gold.toLocaleString()} sub={rankOf(ranks?.gold)} />
        <StatChip label="Wisdom" value={mouse.wisdom.toLocaleString()} sub={rankOf(ranks?.wisdom)} />
      </div>

      {typeRows.length > 0 && (
        <section className="mt-10">
          <SectionHeading>Power types</SectionHeading>
          <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-2 sm:px-4 font-medium">Power type</th>
                  <th className="px-3 py-2 sm:px-4 text-right font-medium">Effectiveness</th>
                  <th className="px-3 py-2 sm:px-4 text-right font-medium">Minluck</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {typeRows.map((row) => (
                  <tr key={row.types.join('-')}>
                    <td className="px-3 py-2 sm:px-4">
                      {row.types.length > 3 ? (
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {powerTypeSetLabel(row.types)}
                        </span>
                      ) : (
                        <span className="flex flex-wrap gap-1">
                          {row.types.map((type) => (
                            <span
                              key={type}
                              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${POWER_TYPE_CHIP[type] ?? ''}`}
                            >
                              {powerTypeLabel(type)}
                            </span>
                          ))}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 sm:px-4 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                      {row.effectiveness}%
                    </td>
                    <td className="px-3 py-2 sm:px-4 text-right font-medium tabular-nums text-zinc-900 dark:text-white">
                      {row.minluck > 0 ? row.minluck : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {immuneTypes.length > 0 && (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              {immuneTypes.map((type) => powerTypeLabel(type)).join(', ')} traps can&rsquo;t catch this mouse.
            </p>
          )}
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            See the{' '}
            <Link
              href="/minlucks"
              className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              full minluck table
            </Link>{' '}
            for every mouse.
          </p>
        </section>
      )}

      <MouseData attraction={attraction} maps={getMouseMaps(mouse.id)} />

      {paragraphs.length > 0 && (
        <section className="mt-10">
          <SectionHeading>From the game</SectionHeading>
          <div className="mt-3 max-w-prose space-y-3 text-base/7 text-pretty text-zinc-700 dark:text-zinc-300">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {relatedMice.length > 0 && (
        <section className="mt-10">
          <SectionHeading>More from {mouse.group}</SectionHeading>
          <ul className="mt-4 flex flex-wrap gap-2">
            {relatedMice.map((other) => {
              const otherSlug = mouseSlug(other.type);
              return (
                <li key={other.id}>
                  <Link
                    href={`/mice/${otherSlug}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-emerald-800 dark:hover:text-emerald-300"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mouseImageUrl(otherSlug)} alt="" loading="lazy" className="size-6 shrink-0" />
                    {other.name}
                  </Link>
                </li>
              );
            })}
            {group && groupMice.length > relatedMice.length && (
              <li className="flex items-center">
                <Link
                  href={`/groups/${group.id}`}
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                >
                  See all {group.mouse_ids.length}
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}

      <ExternalRefs name={mouse.name} kind="mice" id={mouse.id} />
    </div>
  );
}
