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
import { MIN_SAMPLE, bestAttractionRow } from '@/lib/attraction';
import type { AttractionRow } from '@/types';
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
      subtitle: `${mouse.points_formatted ?? mouse.points.toLocaleString()} points, ${mouse.gold_formatted ?? mouse.gold.toLocaleString()} gold`,
      image: mouseImageUrl(slug),
      accent: 'emerald',
    }),
  });
}

const accentLink = 'font-medium text-pink-700 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200';

/** Same location, stage, and cheese. */
function sameSetup(a: AttractionRow, b: AttractionRow): boolean {
  return a.location === b.location && (a.stage ?? '') === (b.stage ?? '') && a.cheese === b.cheese;
}

/** MHCT reports rates in hundredths of a percent. */
function formatRate(rate: number): string {
  return `${(rate / 100).toFixed(1)}%`;
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

  const attraction = getMouseAttraction(mouse.id);
  const bestSpot = bestAttractionRow(attraction);
  // The headline needs no charm. Mention a charm only when a well-sampled one actually does better.
  const betterWithCharm =
    bestSpot && !bestSpot.charm
      ? attraction
          .filter((row) => row.charm && row.rate > bestSpot.rate && (row.total_hunts ?? 0) >= MIN_SAMPLE)
          .reduce<AttractionRow | undefined>((top, row) => (!top || row.rate > top.rate ? row : top), undefined)
      : undefined;

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
              mouse.images?.is_landscape ? 'h-20 w-32 sm:h-36 sm:w-64' : 'size-20 sm:size-36'
            }`}
          />
        )}
        <div className="min-w-0">
          <Heading>{mouse.name}</Heading>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {groupSlug ? (
              <Link href={`/groups/${groupSlug}`} className={accentLink}>
                {mouse.group}
              </Link>
            ) : (
              mouse.group
            )}
            {mouse.subgroup ? ` (${mouse.subgroup})` : ''}
          </p>
          {best.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Weak to</span>
              {best.map((type) => (
                <Link
                  key={type}
                  href={`/mice?weakto=${type}`}
                  title={`All mice weak to ${powerTypeLabel(type)}`}
                  className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium transition hover:ring-2 hover:ring-pink-400 ${POWER_TYPE_CHIP[type] ?? ''}`}
                >
                  {powerTypeLabel(type)}
                </Link>
              ))}
            </div>
          )}
          {/* Each number links to every mouse ranked by it, scrolled to this one. */}
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {(
              [
                ['points', 'Points', mouse.points_formatted ?? mouse.points.toLocaleString()],
                ['gold', 'Gold', mouse.gold_formatted ?? mouse.gold.toLocaleString()],
                ['wisdom', 'Wisdom', mouse.wisdom.toLocaleString()],
              ] as const
            ).map(([key, label, value]) => (
              <div key={key} className="flex items-baseline gap-1.5">
                <dt className="text-zinc-600 dark:text-zinc-400">{label}</dt>
                <dd>
                  <Link
                    href={`/mice/rankings?by=${key}&mouse=${slug}`}
                    title={
                      ranks ? `#${ranks[key].toLocaleString()} of ${ranks.total.toLocaleString()} mice` : undefined
                    }
                    className="font-semibold tabular-nums text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:text-pink-700 hover:decoration-pink-400 dark:text-white dark:decoration-zinc-600 dark:hover:text-pink-300"
                  >
                    {value}
                  </Link>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {(typeRows.length > 0 || bestSpot) && (
        <section
          aria-labelledby="how-to-catch-heading"
          className="mt-8 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 id="how-to-catch-heading" className="sr-only">
            How to catch it
          </h2>

          <div className="px-4 py-4 sm:px-5">
            <p className="text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
              Where to hunt
            </p>
            {bestSpot ? (
              <>
                <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-base text-zinc-900 dark:text-zinc-100">
                    <LocationCell location={bestSpot.location} stage={bestSpot.stage} />
                    <span className="text-zinc-600 dark:text-zinc-400"> with </span>
                    <CheeseCell cheese={bestSpot.cheese} />
                    {bestSpot.charm && (
                      <>
                        <span className="text-zinc-600 dark:text-zinc-400"> and </span>
                        {bestSpot.charm}
                      </>
                    )}
                  </p>
                  <p className="text-2xl font-semibold tabular-nums text-zinc-950 dark:text-white">
                    {formatRate(bestSpot.rate)}
                  </p>
                </div>
                {betterWithCharm && (
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                    {sameSetup(betterWithCharm, bestSpot) ? (
                      <>
                        {betterWithCharm.charm} raises it to{' '}
                        <span className="font-semibold tabular-nums">{formatRate(betterWithCharm.rate)}</span>.
                      </>
                    ) : (
                      <>
                        Up to <span className="font-semibold tabular-nums">{formatRate(betterWithCharm.rate)}</span> at{' '}
                        <LocationCell location={betterWithCharm.location} stage={betterWithCharm.stage} /> with{' '}
                        <CheeseCell cheese={betterWithCharm.cheese} /> and {betterWithCharm.charm}.
                      </>
                    )}
                  </p>
                )}
                <p className="mt-1 text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                  {bestSpot.total_hunts
                    ? `Attraction rate from ${formatNumber(bestSpot.total_hunts)} hunts on MHCT.`
                    : 'Attraction rate from MH-Tools.'}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">No attraction data for this mouse yet.</p>
            )}
          </div>

          {typeRows.length > 0 && (
            <div className="border-t border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <caption className="sr-only">Minluck and effectiveness by power type</caption>
                <thead className="text-left text-xs text-zinc-600 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 pt-3 pb-1.5 font-medium sm:px-5">Power type</th>
                    <th className="px-4 pt-3 pb-1.5 text-right font-medium sm:px-5">Effectiveness</th>
                    <th className="px-4 pt-3 pb-1.5 text-right font-medium sm:px-5">Minluck</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {typeRows.map((row) => (
                    <tr key={row.types.join('-')}>
                      <td className="px-4 py-2 sm:px-5">
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
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-700 sm:px-5 dark:text-zinc-300">
                        {row.effectiveness}%
                      </td>
                      <td className="px-4 py-2 text-right sm:px-5">
                        {row.minluck > 0 ? <ColorScaleBadge value={row.minluck} /> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-zinc-100 px-4 py-3 text-sm text-zinc-600 sm:px-5 dark:border-zinc-800 dark:text-zinc-400">
                {immuneTypes.length > 0 && (
                  <>{immuneTypes.map((type) => powerTypeLabel(type)).join(', ')} traps can&rsquo;t catch this mouse. </>
                )}
                Minluck is the luck that guarantees a catch, and the{' '}
                <Link href="/minlucks" className={accentLink}>
                  minluck table
                </Link>{' '}
                has it for every mouse.
              </p>
            </div>
          )}
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
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition hover:border-pink-300 hover:text-pink-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-pink-800 dark:hover:text-pink-300"
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
                <Link href={`/groups/${group.id}`} className={`text-sm ${accentLink}`}>
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
