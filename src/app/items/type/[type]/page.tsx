import { notFound } from 'next/navigation';
import React from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { Link } from 'next-view-transitions';

import { getAllGameItems, itemSlug } from '@/lib/game-data';
import {
  CLASSIFICATION_DESCRIPTIONS,
  classificationLabel,
  itemSubgroup,
  orderClassifications,
  subgroupLabel,
  subgroupsPresent,
} from '@/lib/item-classifications';
import { pageMetadata, ogCard } from '@/seo';
import { formatNumber } from '@/utils';
import { itemImageUrl } from '@/lib/image-urls';

export const dynamicParams = false;

/**
 * A page per item type, listing every item in it.
 *
 * These exist for crawlers as much as for people: /items is a grid of type cards
 * whose item list is a client-side filter, so without these hubs the only route
 * to the 4,033 item pages is the sitemap — which gets them indexed but passes
 * them no internal link equity. This gives every item page a real link from a
 * real page.
 */
export function generateStaticParams() {
  const present = new Set(getAllGameItems().map((item) => item.classification || 'other'));
  return orderClassifications(present).map((type) => ({ type }));
}

function itemsOfType(type: string) {
  return getAllGameItems()
    .filter((item) => (item.classification || 'other') === type)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const items = itemsOfType(type);
  if (items.length === 0) return { title: 'Not Found' };

  const label = classificationLabel(type);
  const blurb = CLASSIFICATION_DESCRIPTIONS[type];

  return pageMetadata({
    title: `All MouseHunt ${label}`,
    description: `All ${formatNumber(items.length)} ${label.toLowerCase()} in MouseHunt.${blurb ? ` ${blurb}` : ''} Stats, drop rates, and where to get each one.`,
    path: `/items/type/${type}`,
    image: ogCard({
      title: label,
      eyebrow: 'MouseHunt items',
      subtitle: `${formatNumber(items.length)} items`,
      accent: 'blue',
    }),
  });
}

export default async function ItemTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const items = itemsOfType(type);
  if (items.length === 0) notFound();

  const label = classificationLabel(type);

  // The big types are split into the groups the game uses, each its own section.
  const byGroup = new Map<string, typeof items>();
  for (const item of items) {
    const id = itemSubgroup(item);
    if (id) byGroup.set(id, [...(byGroup.get(id) ?? []), item]);
  }
  const groups =
    byGroup.size > 1 ? subgroupsPresent(type, byGroup.keys()).map((id) => ({ id, items: byGroup.get(id)! })) : null;

  return (
    <div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `MouseHunt ${label}`,
          numberOfItems: items.length,
          // Capped: a 1,380-entry list helps no one, and Google reads the first
          // page of it anyway. The links themselves are all in the markup below.
          itemListElement: items.slice(0, 100).map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            url: `https://mouse.rip/items/${itemSlug(item.type)}`,
          })),
        }}
      />

      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Items', href: '/items' }, { name: label }]} />

      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">{label}</h1>
      <p className="mt-2 max-w-2xl text-pretty text-zinc-500 dark:text-zinc-400">
        {CLASSIFICATION_DESCRIPTIONS[type] ?? `All ${label.toLowerCase()} in MouseHunt.`} {formatNumber(items.length)}{' '}
        in total.
      </p>

      {groups ? (
        <>
          <nav aria-label={`${label} by group`} className="mt-6 flex flex-wrap gap-2">
            {groups.map(({ id, items: inGroup }) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 transition hover:bg-pink-50 hover:text-pink-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-pink-950/40 dark:hover:text-pink-300"
              >
                {subgroupLabel(type, id)}
                <span className="ml-1.5 text-xs font-normal tabular-nums">{formatNumber(inGroup.length)}</span>
              </a>
            ))}
          </nav>
          <div className="mt-10 space-y-10">
            {groups.map(({ id, items: inGroup }) => (
              <section key={id} id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20">
                <h2
                  id={`${id}-heading`}
                  className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white"
                >
                  {subgroupLabel(type, id)}
                  <span className="ml-2 text-xs font-normal tabular-nums text-zinc-500 dark:text-zinc-400">
                    {formatNumber(inGroup.length)}
                  </span>
                </h2>
                <ItemColumns items={inGroup} />
              </section>
            ))}
          </div>
        </>
      ) : (
        <ItemColumns items={items} className="mt-8" />
      )}
    </div>
  );
}

function ItemColumns({ items, className }: { items: ReturnType<typeof itemsOfType>; className?: string }) {
  return (
    <ul className={`${className ?? 'mt-3'} columns-2 gap-x-6 sm:columns-3 lg:columns-4`}>
      {items.map((item) => {
        const slug = itemSlug(item.type);
        return (
          <li key={item.id} className="break-inside-avoid">
            <Link
              href={`/items/${slug}`}
              className="flex items-center gap-2 py-1 text-sm text-zinc-600 transition hover:text-pink-700 dark:text-zinc-400 dark:hover:text-pink-300"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={itemImageUrl(slug)} alt="" loading="lazy" className="size-5 shrink-0 rounded" />
              <span className="line-clamp-2" title={item.name}>
                {item.name}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
