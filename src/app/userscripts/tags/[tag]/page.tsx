import { notFound } from 'next/navigation';

import React from 'react';

import { SwatchIcon } from '@heroicons/react/20/solid';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';
import { pageMetadata } from '@/seo';

import { getItemsByCategory } from '@/data';
import { MouseRipItem } from '@/types';

function getUserscriptsByTag(tag: string): MouseRipItem[] {
  return getItemsByCategory('userscript').filter((item) => item.tags?.includes(tag));
}

export function generateStaticParams() {
  const tags = new Set<string>();
  getItemsByCategory('userscript').forEach((item) => item.tags?.forEach((tag) => tags.add(tag)));
  return [...tags].map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);

  return pageMetadata({
    title: `MouseHunt userscripts tagged “${decoded}”`,
    description: `A collection of MouseHunt userscripts tagged “${decoded}”.`,
    path: `/userscripts/tags/${tag}`,
  });
}

export default async function UserscriptTagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const items = getUserscriptsByTag(decoded);

  if (!items.length) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Userscripts', href: '/userscripts' },
          { name: `Tagged “${decoded}”` },
        ]}
      />

      <PageHeader
        title={`Tagged “${decoded}”`}
        description={`Userscripts tagged “${decoded}”.`}
        count={items.length}
        countLabel={items.length === 1 ? 'userscript' : 'userscripts'}
        icon={SwatchIcon}
        iconClassName="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
      />

      <ItemList items={items} showtags />
    </>
  );
}
