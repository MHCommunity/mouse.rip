import { notFound } from 'next/navigation';
import React from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { ExternalRefs } from '@/components/external-refs';
import { Heading } from '@/components/heading';
import { Link } from 'next-view-transitions';

import { getLocations } from '@/data';
import {
  getAllGameItems,
  getConvertibleContents,
  getConvertiblesContaining,
  getGameItemBySlug,
  getItemDrops,
  getMapRelationsForItem,
  itemSlug,
  itemSlugForId,
} from '@/lib/game-data';
import { descriptionToParagraphs, powerTypeLabel, POWER_TYPE_CHIP } from '@/lib/power-types';
import type { GameItem, GameItemStats, MapRelation } from '@/types';
import { JsonLd } from '@/components/json-ld';
import { itemJsonLd, itemSeo } from '@/lib/entity-seo';
import { itemImageUrl } from '@/lib/image-urls';
import { ogCard, pageMetadata } from '@/seo';
import { formatNumber, titleCase } from '@/utils';
import { ItemData } from './item-data';
import { MarketPrice } from './market-price';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllGameItems().map((item) => ({ slug: itemSlug(item.type) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getGameItemBySlug(slug);
  if (!item) return { title: 'Not Found' };

  const { title, description } = itemSeo(item, {
    contents: item.classification === 'convertible' ? getConvertibleContents(item.id) : [],
    drops: getItemDrops(item.id),
  });
  const cardImage = pickImage(item);
  const stats = item.has_stats && typeof item.has_stats === 'object' ? item.has_stats : null;
  const cardSubtitle = stats
    ? [
        stats.power_type ? powerTypeLabel(stats.power_type) : null,
        stats.has_power && stats.power ? `${stats.power_formatted ?? stats.power} power` : null,
        stats.has_luck && stats.luck ? `${stats.luck_formatted ?? stats.luck} luck` : null,
        stats.has_cheese_effect && stats.cheese_effect ? stats.cheese_effect : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';
  return pageMetadata({
    title,
    description,
    path: `/items/${slug}`,
    image: ogCard({
      title: item.name,
      eyebrow: titleCase(item.classification),
      subtitle: cardSubtitle || undefined,
      image: cardImage,
      accent: 'blue',
    }),
  });
}

/**
 * Slugs for just the ids in this item's map relations — a handful, versus the
 * ~158 KB of a full id → slug map, which a client prop would inline into every
 * one of the 4,033 prerendered item pages.
 */
function slugsForRelations(relations: MapRelation[]): Record<number, string> {
  const slugs: Record<number, string> = {};
  for (const relation of relations) {
    for (const id of [relation.scrollCase.id, ...relation.chests.map((chest) => chest.id)]) {
      const slug = itemSlugForId(id);
      if (slug) slugs[id] = slug;
    }
  }
  return slugs;
}

function pickImage(item: ReturnType<typeof getGameItemBySlug>): string | undefined {
  return item?.images ? itemImageUrl(item.type, 'large') : undefined;
}

/** How this item's power and luck rank among comparable items (same classification,
 *  and same power type for weapons). */
function rankNote(item: GameItem, stats: GameItemStats): string | null {
  if (item.classification !== 'weapon' && item.classification !== 'base') return null;

  const peers = getAllGameItems().filter((peer) => {
    if (peer.classification !== item.classification) return false;
    if (!peer.has_stats || typeof peer.has_stats !== 'object') return false;
    if (item.classification === 'weapon' && peer.has_stats.power_type !== stats.power_type) return false;
    return true;
  });

  const rank = (key: 'power' | 'luck') => {
    const value = stats[key] ?? 0;
    if (!value) return null;
    const higher = peers.filter((peer) => ((peer.has_stats as GameItemStats)[key] ?? 0) > value).length;
    return higher + 1;
  };

  const powerRank = rank('power');
  const luckRank = rank('luck');
  const parts = [powerRank ? `#${powerRank} by power` : null, luckRank ? `#${luckRank} by luck` : null].filter(Boolean);
  if (parts.length === 0) return null;

  const peerLabel =
    item.classification === 'weapon'
      ? `${stats.power_type ? `${powerTypeLabel(stats.power_type)} ` : ''}weapons`
      : 'bases';
  return `${parts.join(' · ')} of ${peers.length} ${peerLabel}`;
}

/** Locations this item can be used in, linked to their pages when we have one. */
function itemEnvironments(item: GameItem): { id: string | null; name: string }[] {
  const environments = item.environment ?? [];
  if (environments.length === 0) return [];

  const locationNames = new Map(
    getLocations().flatMap((region) => region.locations.map((location) => [location.id, location.name] as const)),
  );

  return environments
    .filter((env) => !/^\d+$/.test(env))
    .map((env) => {
      const id = env.replaceAll('_', '-');
      const name = locationNames.get(id);
      if (name) return { id, name };
      return { id: null, name: titleCase(env) };
    });
}

/** For a skin, the weapon it applies to (the item whose skin list contains it). */
function skinTarget(item: GameItem): GameItem | undefined {
  if (!item.is_skin) return undefined;
  return getAllGameItems().find(
    (peer) => peer.has_stats && typeof peer.has_stats === 'object' && peer.has_stats.skins?.includes(item.type),
  );
}

/** Items of the same classification that share the most tags with this one. */
function relatedItems(item: GameItem): GameItem[] {
  const tags = new Set((item.tags ?? []).filter((tag) => tag !== item.classification));
  if (tags.size === 0) return [];

  return getAllGameItems()
    .filter((peer) => peer.id !== item.id && peer.classification === item.classification)
    .map((peer) => ({
      peer,
      shared: (peer.tags ?? []).filter((tag) => tags.has(tag)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || a.peer.name.localeCompare(b.peer.name))
    .slice(0, 8)
    .map(({ peer }) => peer);
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm font-medium tabular-nums text-zinc-900 dark:text-white">{value}</span>
    </div>
  );
}

function StatsTable({ stats }: { stats: GameItemStats }) {
  const rows: React.ReactNode[] = [];

  if (stats.power_type) {
    rows.push(
      <StatRow
        key="power_type"
        label="Power type"
        value={
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${POWER_TYPE_CHIP[stats.power_type] ?? ''}`}
          >
            {powerTypeLabel(stats.power_type)}
          </span>
        }
      />,
    );
  }
  if (stats.has_power) rows.push(<StatRow key="power" label="Power" value={stats.power_formatted ?? stats.power} />);
  if (stats.has_power_bonus && stats.power_bonus)
    rows.push(<StatRow key="power_bonus" label="Power bonus" value={stats.power_bonus_formatted} />);
  if (stats.has_attraction_bonus && stats.attraction_bonus)
    rows.push(<StatRow key="attraction_bonus" label="Attraction bonus" value={stats.attraction_bonus_formatted} />);
  if (stats.has_luck && stats.luck)
    rows.push(<StatRow key="luck" label="Luck" value={stats.luck_formatted ?? stats.luck} />);
  if (stats.has_cheese_effect && stats.cheese_effect)
    rows.push(
      <StatRow
        key="cheese_effect"
        label="Cheese effect"
        value={
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
              stats.cheese_effect.includes('Fresh')
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : stats.cheese_effect.includes('Stale')
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {stats.cheese_effect}
          </span>
        }
      />,
    );
  if (stats.has_min_title && stats.min_title)
    rows.push(
      <StatRow
        key="min_title"
        label="Minimum title"
        value={stats.min_title.charAt(0).toUpperCase() + stats.min_title.slice(1)}
      />,
    );

  if (rows.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">Trap stats</h2>
      <div className="mt-2 divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {rows}
      </div>
    </section>
  );
}

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getGameItemBySlug(slug);
  if (!item) notFound();

  const paragraphs = descriptionToParagraphs(item.description);
  const image = pickImage(item);
  const stats = item.has_stats && typeof item.has_stats === 'object' ? item.has_stats : null;

  // `is_convertible` is false on every item in the catalog, so the classification
  // is the only reliable signal that this opens into something.
  const isConvertible = item.classification === 'convertible';

  // Perks read as green; constraints read as amber, so "Limited edition" doesn't
  // look like a feature.
  const flags: { label: string; limit?: boolean }[] = [
    item.is_tradable ? { label: 'Tradable' } : null,
    item.is_givable ? { label: 'Givable' } : null,
    isConvertible ? { label: 'Openable' } : null,
    item.is_limited_edition ? { label: 'Limited edition', limit: true } : null,
    item.is_quantity_limited
      ? {
          label:
            item.quantity_limit === 1
              ? 'One per hunter'
              : item.quantity_limit
                ? `Limited to ${formatNumber(item.quantity_limit)}`
                : 'Limited quantity',
          limit: true,
        }
      : null,
  ].filter(Boolean) as { label: string; limit?: boolean }[];

  const ranks = stats ? rankNote(item, stats) : null;
  const environments = itemEnvironments(item);
  const mapRelations = getMapRelationsForItem(item.id);
  const contents = isConvertible ? getConvertibleContents(item.id) : [];
  const drops = getItemDrops(item.id);
  const related = relatedItems(item);
  const skinFor = skinTarget(item);
  const skins = (stats?.has_skins && stats.skins ? stats.skins : [])
    .map((skinType) => getGameItemBySlug(itemSlug(skinType)))
    .filter((skin): skin is GameItem => Boolean(skin));

  return (
    <div>
      <JsonLd data={itemJsonLd(item, { contents, drops }, slug, image)} />

      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Items', href: '/items' }, { name: item.name }]} />

      <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={item.name}
            className="h-40 w-40 shrink-0 rounded-2xl bg-white object-contain p-2 ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10"
          />
        )}
        <div className="min-w-0">
          <Heading>{item.name}</Heading>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={`/items/type/${item.classification}`}
              title={`All ${titleCase(item.classification).toLowerCase()}s`}
              className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 transition hover:ring-2 hover:ring-blue-400 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {titleCase(item.classification)}
            </Link>
            {flags.map((flag) => (
              <span
                key={flag.label}
                className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                  flag.limit
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {flag.label}
              </span>
            ))}
          </div>
          {skinFor && (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              A skin for the{' '}
              <Link
                href={`/items/${itemSlug(skinFor.type)}`}
                className="font-medium text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
              >
                {skinFor.name}
              </Link>
              .
            </p>
          )}
          {stats && <StatsTable stats={stats} />}
          {ranks && <p className="mt-2 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">{ranks}</p>}
        </div>
      </header>

      {item.is_tradable && <MarketPrice itemId={item.id} />}

      <ItemData
        itemId={item.id}
        obtainHint={item.obtain_hint}
        contents={contents}
        drops={drops}
        foundIn={getConvertiblesContaining(item.id)}
        mapRelations={mapRelations}
        itemSlugs={slugsForRelations(mapRelations)}
      />

      {environments.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Where you can use it
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {environments.map((environment) =>
              environment.id ? (
                <Link
                  key={environment.name}
                  href={`/locations/${environment.id}`}
                  className="inline-flex rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-blue-800 dark:hover:text-blue-300"
                >
                  {environment.name}
                </Link>
              ) : (
                <span
                  key={environment.name}
                  className="inline-flex rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  {environment.name}
                </span>
              ),
            )}
          </div>
        </section>
      )}

      {skins.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">Skins</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {skins.map((skin) => (
              <Link
                key={skin.id}
                href={`/items/${itemSlug(skin.type)}`}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-blue-800 dark:hover:text-blue-300"
              >
                {skin.images?.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={itemImageUrl(skin.type)} alt="" loading="lazy" className="size-6 shrink-0 rounded" />
                )}
                {skin.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {paragraphs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            About this item
          </h2>
          <div className="mt-3 max-w-3xl space-y-3 text-base/7 text-pretty text-zinc-600 dark:text-zinc-300">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Related {titleCase(item.classification).toLowerCase()}s
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {related.map((peer) => (
              <li key={peer.id}>
                <Link
                  href={`/items/${itemSlug(peer.type)}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-blue-800 dark:hover:text-blue-300"
                >
                  {peer.images?.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={itemImageUrl(peer.type)} alt="" loading="lazy" className="size-6 shrink-0 rounded" />
                  )}
                  {peer.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ExternalRefs name={item.name} kind="items" id={item.id} tradable={item.is_tradable} />
    </div>
  );
}
