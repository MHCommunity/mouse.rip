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
      subtitle: `${mouse.points_formatted ?? mouse.points.toLocaleString()} points, ${mouse.gold_formatted ?? mouse.gold.toLocaleString()} gold`,
      image: mouseImageUrl(slug),
      accent: 'emerald',
    }),
  });
}

const accentLink = 'font-medium text-pink-700 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200';

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

  return (
    <div>
      <JsonLd data={mouseJsonLd(mouse, attraction, slug)} />

      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Mice', href: '/mice' }, { name: mouse.name }]} />

      <header className="rounded-3xl bg-linear-to-br from-pink-50 via-white to-amber-50 p-4 ring-1 ring-pink-100/80 sm:p-6 dark:from-pink-950/30 dark:via-zinc-900 dark:to-amber-950/20 dark:ring-zinc-800">
        <div className="flex items-start gap-4 sm:gap-6">
          {image && (
            // The game's mouse art is drawn on white, so it sits on a white plate in
            // both themes instead of turning into a bright square on dark.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className={`shrink-0 bg-white object-contain p-2 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 ${
                mouse.images?.is_landscape ? 'h-20 w-32 sm:h-36 sm:w-64' : 'size-20 sm:size-36'
              }`}
            />
          )}
          <div className="min-w-0 flex-1">
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
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium transition hover:ring-2 hover:ring-pink-400 ${POWER_TYPE_CHIP[type] ?? ''}`}
                  >
                    {powerTypeLabel(type)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Each number links to every mouse ranked by it, scrolled to this one. */}
        <dl className="mt-4 grid max-w-lg grid-cols-3 gap-2 sm:mt-5">
          {(
            [
              ['points', 'Points', mouse.points_formatted ?? mouse.points.toLocaleString()],
              ['gold', 'Gold', mouse.gold_formatted ?? mouse.gold.toLocaleString()],
              ['wisdom', 'Wisdom', mouse.wisdom.toLocaleString()],
            ] as const
          ).map(([key, label, value]) => (
            <div
              key={key}
              className="rounded-2xl bg-white/80 px-3 py-2 ring-1 ring-zinc-200/80 dark:bg-white/5 dark:ring-zinc-700/60"
            >
              <dt className="text-xs text-zinc-600 dark:text-zinc-400">{label}</dt>
              <dd className="mt-0.5">
                <Link
                  href={`/mice/rankings?by=${key}&mouse=${slug}`}
                  title={ranks ? `#${ranks[key].toLocaleString()} of ${ranks.total.toLocaleString()} mice` : undefined}
                  className="text-base font-semibold tabular-nums text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:text-pink-700 hover:decoration-pink-400 sm:text-lg dark:text-white dark:decoration-zinc-600 dark:hover:text-pink-300"
                >
                  {value}
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {(typeRows.length > 0 || bestSpot) && (
        <section aria-labelledby="how-to-catch-heading" className="mt-10">
          <SectionHeading id="how-to-catch-heading">How to catch it</SectionHeading>
          {/* Where to hunt and the power types sit side by side once there's room, and stack on a phone. */}
          <div className={`mt-3 grid gap-4 ${bestSpot && typeRows.length > 0 ? 'lg:grid-cols-2' : ''}`}>
            <div className="rounded-2xl bg-white shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 px-4 py-4 sm:px-5">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Best place to hunt</p>
              {bestSpot ? (
                <>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
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
                    <p className="rounded-full bg-pink-50 px-3 py-1 text-lg font-semibold tabular-nums text-pink-800 ring-1 ring-pink-100 dark:bg-pink-950/50 dark:text-pink-200 dark:ring-pink-900/60">
                      {formatRate(bestSpot.rate)}
                    </p>
                  </div>
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
              <div className="overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                <p className="px-4 pt-4 text-sm font-medium text-zinc-600 sm:px-5 dark:text-zinc-400">
                  Power types and minluck
                </p>
                <table className="mt-1 w-full text-sm">
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
                {immuneTypes.length > 0 && (
                  <p className="border-t border-zinc-100 px-4 py-3 text-sm text-zinc-600 sm:px-5 dark:border-zinc-800 dark:text-zinc-400">
                    {immuneTypes.map((type) => powerTypeLabel(type)).join(', ')} traps can&rsquo;t catch this mouse.
                  </p>
                )}
              </div>
            )}
          </div>
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
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {relatedMice.map((other) => {
              const otherSlug = mouseSlug(other.type);
              return (
                <li key={other.id}>
                  <Link
                    href={`/mice/${otherSlug}`}
                    className="group flex h-full flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center shadow-xs ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-pink-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-pink-900"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mouseImageUrl(otherSlug)}
                      alt=""
                      loading="lazy"
                      className="size-14 shrink-0 bg-white object-contain p-1"
                    />
                    <span className="text-sm/5 font-medium text-zinc-800 group-hover:text-pink-700 dark:text-zinc-200 dark:group-hover:text-pink-300">
                      {other.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {group && groupMice.length > relatedMice.length && (
            <p className="mt-3 text-sm">
              <Link href={`/groups/${group.id}`} className={accentLink}>
                See all {group.mouse_ids.length} {mouse.group}
              </Link>
            </p>
          )}
        </section>
      )}

      <ExternalRefs name={mouse.name} kind="mice" id={mouse.id} />
    </div>
  );
}
