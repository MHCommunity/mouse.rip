import type { MetadataRoute } from 'next';

import { getItemsByCategory, getLocations, getOnSiteGuides } from '@/data';
import {
  getAllGameItems,
  getAllMice,
  getAllMiceGroups,
  itemSlug,
  mouseSlug,
} from '@/lib/game-data';

const BASE_URL = 'https://mouse.rip';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/guides',
    '/tools',
    '/spreadsheets',
    '/extensions',
    '/userscripts',
    '/locations',
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
    }))
  );

  const userscriptRoutes = getItemsByCategory('userscript').map((item) => ({
    url: `${BASE_URL}/userscripts/${item.id}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const mouseRoutes = getAllMice().map((mouse) => ({
    url: `${BASE_URL}/mice/${mouseSlug(mouse.type)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const groupRoutes = getAllMiceGroups().map((group) => ({
    url: `${BASE_URL}/groups/${group.id}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const itemRoutes = getAllGameItems().map((item) => ({
    url: `${BASE_URL}/items/${itemSlug(item.type)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...guideRoutes,
    ...locationRoutes,
    ...userscriptRoutes,
    ...mouseRoutes,
    ...groupRoutes,
    ...itemRoutes,
  ];
}
