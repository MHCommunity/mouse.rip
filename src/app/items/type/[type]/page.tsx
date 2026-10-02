import { notFound } from 'next/navigation';
import React from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { Link } from 'next-view-transitions';

import { getAllGameItems, itemSlug } from '@/lib/game-data';
import { CLASSIFICATION_DESCRIPTIONS, classificationLabel, orderClassifications } from '@/lib/item-classifications';
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
        {CLASSIFICATION_DESCRIPTIONS[type] ?? `Every ${label.toLowerCase()} in MouseHunt.`} {formatNumber(items.length)}{' '}
        in total — open any one for its stats, where it drops, and what&rsquo;s inside it.
      </p>

      <ul className="mt-8 columns-2 gap-x-6 sm:columns-3 lg:columns-4">
        {items.map((item) => {
          const slug = itemSlug(item.type);
          return (
            <li key={item.id} className="break-inside-avoid">
              <Link
                href={`/items/${slug}`}
                className="flex items-center gap-2 py-1 text-sm text-zinc-600 transition hover:text-blue-700 dark:text-zinc-400 dark:hover:text-blue-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={itemImageUrl(slug)} alt="" loading="lazy" className="size-5 shrink-0 rounded" />
                <span className="truncate">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
