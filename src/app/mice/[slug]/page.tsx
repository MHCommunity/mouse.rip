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
} from '@/lib/power-types';
import { JsonLd } from '@/components/json-ld';
import { mouseJsonLd, mouseSeo } from '@/lib/entity-seo';
import { ogCard, pageMetadata } from '@/seo';
import { mouseImageUrl } from '@/lib/image-urls';

import { MouseData } from './mouse-data';

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
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">{sub}</div>}
    </div>
  );
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

  // Power-type rows: show any type that is effective or has a minluck.
  const eff = mouse.effectivenesses ?? {};
  const minlucks = mouse.minlucks ?? {};
  const typeRows = POWER_TYPES.map((type) => ({
    type,
    effectiveness: (eff as Record<string, number | undefined>)[type] ?? 0,
    minluck: (minlucks as Record<string, number | undefined>)[type] ?? 0,
  }))
    .filter((row) => row.effectiveness > 0 || row.minluck > 0)
    .sort((a, b) => b.effectiveness - a.effectiveness);
  const immuneTypes = POWER_TYPES.filter((type) => ((eff as Record<string, number | undefined>)[type] ?? 0) === 0);

  const attraction = getMouseAttraction(mouse.id);

  return (
    <div>
      <JsonLd data={mouseJsonLd(mouse, attraction, slug)} />

      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Mice', href: '/mice' }, { name: mouse.name }]} />

      <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={mouse.name}
            className={`h-40 shrink-0 rounded-2xl object-cover ring-1 ring-zinc-950/5 dark:ring-white/10 ${
              mouse.images?.is_landscape ? 'w-full sm:w-72' : 'w-40'
            }`}
          />
        )}
        <div className="min-w-0">
          <Heading>{mouse.name}</Heading>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
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
              <span className="text-xs text-zinc-400 dark:text-zinc-500">Weak to</span>
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
          <div className="mt-4 grid grid-cols-3 gap-3">
            <StatChip
              label="Points"
              value={mouse.points_formatted ?? mouse.points.toLocaleString()}
              sub={rankOf(ranks?.points)}
            />
            <StatChip
              label="Gold"
              value={mouse.gold_formatted ?? mouse.gold.toLocaleString()}
              sub={rankOf(ranks?.gold)}
            />
            <StatChip label="Wisdom" value={mouse.wisdom.toLocaleString()} sub={rankOf(ranks?.wisdom)} />
          </div>
        </div>
      </header>

      {paragraphs.length > 0 && (
        <div className="mt-8 space-y-3 text-base/7 text-pretty text-zinc-600 dark:text-zinc-300">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      {typeRows.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Power types
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Effectiveness and the minimum luck needed to guarantee a catch with each type.
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Power type</th>
                  <th className="px-4 py-2 text-right font-medium">Effectiveness</th>
                  <th className="px-4 py-2 text-right font-medium">Minluck</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {typeRows.map((row) => (
                  <tr key={row.type}>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${POWER_TYPE_CHIP[row.type] ?? ''}`}
                      >
                        {powerTypeLabel(row.type)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                      {row.effectiveness}%
                    </td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums text-zinc-900 dark:text-white">
                      {row.minluck > 0 ? row.minluck : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {immuneTypes.length > 0 && (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              No effect: {immuneTypes.map((type) => powerTypeLabel(type)).join(', ')} traps can&rsquo;t catch this
              mouse.
            </p>
          )}
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            See the{' '}
            <Link
              href="/minlucks"
              className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              full minluck table
            </Link>{' '}
            for every mouse.
          </p>
        </section>
      )}

      <MouseData attraction={attraction} maps={getMouseMaps(mouse.id)} />

      {relatedMice.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            More {mouse.group} mice
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {relatedMice.map((other) => {
              const otherSlug = mouseSlug(other.type);
              return (
                <li key={other.id}>
                  <Link
                    href={`/mice/${otherSlug}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-emerald-800 dark:hover:text-emerald-300"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mouseImageUrl(otherSlug)} alt="" loading="lazy" className="size-6 shrink-0 rounded" />
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
                  All {group.mouse_ids.length} {mouse.group} mice →
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
