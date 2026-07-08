import { notFound } from 'next/navigation';
import React from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Heading } from '@/components/heading';
import { MouseGrid } from '@/components/mouse-grid';

import { getAllMiceGroups, getMiceForGroup, getMiceGroupBySlug } from '@/lib/game-data';
import { ogCard, pageMetadata } from '@/seo';
import { cleanDescription } from '@/utils';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllMiceGroups().map((group) => ({ slug: group.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = getMiceGroupBySlug(slug);
  if (!group) return { title: 'Not Found' };

  return pageMetadata({
    title: `${group.name} — MouseHunt Mice`,
    description:
      cleanDescription(group.description).slice(0, 160) ||
      `Every mouse in the ${group.name} group in MouseHunt.`,
    path: `/groups/${slug}`,
    image: ogCard({
      title: group.name,
      eyebrow: 'Mouse group',
      subtitle: `${group.mouse_ids.length} mice`,
      accent: 'emerald',
    }),
  });
}

export default async function GroupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = getMiceGroupBySlug(slug);
  if (!group) notFound();

  const mice = getMiceForGroup(group);

  return (
    <div className="mx-auto max-w-4xl">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Groups', href: '/groups' },
          { name: group.name },
        ]}
      />

      {group.banner && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={group.banner}
          alt=""
          className="mb-6 h-40 w-full rounded-2xl object-cover ring-1 ring-zinc-950/5 dark:ring-white/10"
        />
      )}

      <Heading>{group.name}</Heading>
      {group.description && (
        <p className="mt-4 max-w-2xl text-base/7 text-pretty text-zinc-600 dark:text-zinc-300">
          {cleanDescription(group.description)}
        </p>
      )}

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
        {mice.length} mice in this group
      </h2>
      <div className="mt-4">
        <MouseGrid mice={mice} />
      </div>
    </div>
  );
}
