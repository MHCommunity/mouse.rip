import type { MetadataRoute } from 'next';

import { getItemsByCategory, getLocations, getOnSiteGuides } from '@/data';
import { getAllGameItems, getAllMice, getAllMiceGroups, getDataUpdatedAt, itemSlug, mouseSlug } from '@/lib/game-data';
import { orderClassifications } from '@/lib/item-classifications';

const BASE_URL = 'https://mouse.rip';

export default function sitemap(): MetadataRoute.Sitemap {
  // When the game data was last actually refreshed — not the build time, which
  // would claim every page changed on every deploy and get lastmod ignored.
  const lastModified = getDataUpdatedAt();

  const staticRoutes = [
    '',
    '/guides',
    '/tools',
    '/spreadsheets',
    '/extensions',
    '/userscripts',
    '/mice',
    '/items',
    '/marketplace',
    '/about',
    '/minlucks',
    '/valour-rift-floors',
    '/essence-calculator',
    '/queso-pump-calculator',
    '/titles',
    '/trap-special-effects',
    '/relic-hunter',
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const guideRoutes = getOnSiteGuides().map((guide) => ({
    url: `${BASE_URL}${guide.url}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const locationRoutes = getLocations().flatMap((region) =>
    region.locations.map((location) => ({
      url: `${BASE_URL}/locations/${location.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  );

  const userscriptRoutes = getItemsByCategory('userscript').map((item) => ({
    url: `${BASE_URL}/userscripts/${item.id}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const mouseRoutes = getAllMice().map((mouse) => ({
    url: `${BASE_URL}/mice/${mouseSlug(mouse.type)}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const groupRoutes = getAllMiceGroups().map((group) => ({
    url: `${BASE_URL}/groups/${group.id}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  const items = getAllGameItems();

  const itemRoutes = items.map((item) => ({
    url: `${BASE_URL}/items/${itemSlug(item.type)}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // The per-type hub pages, which are how crawlers reach the item pages at all.
  const itemTypeRoutes = orderClassifications(items.map((item) => item.classification || 'other')).map((type) => ({
    url: `${BASE_URL}/items/type/${type}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...guideRoutes,
    ...locationRoutes,
    ...userscriptRoutes,
    ...mouseRoutes,
    ...groupRoutes,
    ...itemTypeRoutes,
    ...itemRoutes,
  ];
}
