import { notFound } from 'next/navigation';
import React from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Heading } from '@/components/heading';
import { MouseGrid } from '@/components/mouse-grid';

import { getAllMiceGroups, getMiceForGroup, getMiceGroupBySlug } from '@/lib/game-data';
import { ogCard, pageMetadata } from '@/seo';
import { cleanDescription } from '@/utils';
import { mouseGroupImageUrl } from '@/lib/image-urls';
import { SectionHeading } from '@/components/section-heading';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllMiceGroups().map((group) => ({ slug: group.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = getMiceGroupBySlug(slug);
  if (!group) return { title: 'Not Found' };

  return pageMetadata({
    title: `${group.name}: MouseHunt Mouse Group`,
    description:
      cleanDescription(group.description).slice(0, 160) || `Every mouse in the ${group.name} group in MouseHunt.`,
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
  // Groups like the Gauntlet or the seasons split into subgroups; show each under its own heading, in game order.
  const sections: { name: string; mice: typeof mice }[] = [];
  for (const mouse of mice) {
    const name = mouse.subgroup || group.name;
    const section = sections.find((entry) => entry.name === name);
    if (section) section.mice.push(mouse);
    else sections.push({ name, mice: [mouse] });
  }

  return (
    <div>
      {/* The group index lives on /mice ("Browse by group") — /groups only redirects there. */}
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Mice', href: '/mice' }, { name: group.name }]} />

      {group.banner && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mouseGroupImageUrl(group.id)}
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

      <SectionHeading className="mt-10">
        {mice.length} {mice.length === 1 ? 'mouse' : 'mice'}
      </SectionHeading>
      {sections.length > 1 ? (
        sections.map((section) => (
          <section key={section.name} className="mt-6">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {section.name} <span className="font-normal text-zinc-500 dark:text-zinc-400">{section.mice.length}</span>
            </h3>
            <div className="mt-3">
              <MouseGrid mice={section.mice} showSubgroup={false} />
            </div>
          </section>
        ))
      ) : (
        <div className="mt-4">
          <MouseGrid mice={mice} />
        </div>
      )}
    </div>
  );
}
