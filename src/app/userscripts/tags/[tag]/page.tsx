import { notFound } from 'next/navigation';

import React from 'react';

import { SwatchIcon } from '@heroicons/react/20/solid';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';
import { pageMetadata } from '@/seo';

import { getResourcesByCategory } from '@/lib/site-data';
import { Resource } from '@/types';
import { UserscriptTagBar } from '@/components/userscript-tag-bar';
import { userscriptTagName } from '@/lib/userscript-tags';

function getUserscriptsByTag(tag: string): Resource[] {
  return getResourcesByCategory('userscript').filter((item) => item.tags?.includes(tag));
}

export function generateStaticParams() {
  const tags = new Set<string>();
  getResourcesByCategory('userscript').forEach((item) => item.tags?.forEach((tag) => tags.add(tag)));
  // Next encodes params when it builds the paths, so pass the tags as-is.
  return [...tags].map((tag) => ({ tag }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);

  return pageMetadata({
    title: `MouseHunt ${userscriptTagName(decoded)} userscripts`,
    description: `MouseHunt userscripts for ${userscriptTagName(decoded).toLowerCase()}.`,
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
          { name: userscriptTagName(decoded) },
        ]}
      />

      <PageHeader
        title={`${userscriptTagName(decoded)} userscripts`}
        count={items.length}
        countLabel={items.length === 1 ? 'userscript' : 'userscripts'}
        icon={SwatchIcon}
        iconClassName="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
      />

      <UserscriptTagBar scripts={getResourcesByCategory('userscript')} current={decoded} />
      <ItemList items={items} showCategory={false} showtags />
    </>
  );
}
