/**
 * Every on-site link the site makes leads to a page that exists: the resource lists, the guides, search,
 * the sitemap, and the links written into the pages themselves.
 */
import { describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

import sitemap from '@/app/sitemap';
import miceGroups from '@/data/generated/mice-groups.json';
import itemIndex from '@/data/generated/game-items-search.json';
import titles from '@/data/generated/titles.json';
import { getAllMice, getGameItemBySlug, getMiceGroupBySlug, getMouseBySlug } from '@/lib/game-data';
import { LOCAL_ITEM_ART, itemCdnImageUrl, itemImageUrl, titleImageUrl } from '@/lib/image-urls';
import { getStaticSearchRecords } from '@/lib/search';
import { getGuide, getLocation, getLocations, getResources, getResourcesByCategory } from '@/lib/site-data';
import { isInternalPath } from '@/utils';

const ROOT = path.join(import.meta.dir, '..');
const APP = path.join(ROOT, 'src/app');

/** Pages with no [param] in their path, as URL paths. */
const pageFiles = (fs.readdirSync(APP, { recursive: true, encoding: 'utf8' }) as string[]).filter(
  (file) => /(^|\/)page\.tsx$/.test(file) && !file.includes('['),
);
const urlPath = (file: string) => `/${path.dirname(file)}`.replace(/\/\.$/, '') || '/';
const staticPages = new Set(pageFiles.map(urlPath));
/** Pages that only send visitors somewhere else, which a sitemap leaves out. */
const redirects = new Set(
  pageFiles.filter((file) => /\bredirect\(/.test(fs.readFileSync(path.join(APP, file), 'utf8'))).map(urlPath),
);

const classifications = new Set((itemIndex as { classification: string }[]).map((item) => item.classification));
const regions = new Set(getLocations().map((region) => region.id));
const userscripts = getResourcesByCategory('userscript');
const userscriptTags = new Set(userscripts.flatMap((script) => script.tags ?? []));

/** Whether a link on the site leads somewhere: a page, a generated page that has its data, or a public file. */
function resolves(href: string): boolean {
  const url = new URL(href, 'https://mouse.rip');
  const pathname = decodeURIComponent(url.pathname).replace(/\/$/, '') || '/';
  if (staticPages.has(pathname)) return true;
  if (fs.existsSync(path.join(ROOT, 'public', pathname)) && path.extname(pathname)) return true;

  const [, section, slug, extra] = pathname.split('/');
  if (extra && !(section === 'items' && slug === 'type') && !(section === 'userscripts' && slug === 'tags')) {
    return false;
  }
  switch (section) {
    case 'mice':
      return Boolean(getMouseBySlug(slug));
    case 'items':
      return slug === 'type' ? classifications.has(extra) : Boolean(getGameItemBySlug(slug));
    case 'locations':
      return Boolean(getLocation(slug));
    case 'regions':
      return regions.has(slug);
    case 'groups':
      return Boolean(getMiceGroupBySlug(slug));
    case 'guides':
      return Boolean(getGuide(slug)) && fs.existsSync(path.join(ROOT, 'src/content/guides', `${slug}.md`));
    case 'userscripts':
      return slug === 'tags' ? userscriptTags.has(extra) : userscripts.some((script) => String(script.id) === slug);
    default:
      return false;
  }
}

const broken = (hrefs: Iterable<string>) => [...new Set(hrefs)].filter((href) => !resolves(href));

describe('the link checker', () => {
  test('knows a good link from a bad one', () => {
    expect(resolves('/mice/glazed')).toBe(true);
    expect(resolves('/mice/rankings?by=gold&mouse=glazed')).toBe(true);
    expect(resolves('/items/type/stat')).toBe(true);
    expect(resolves('/locations/meadow')).toBe(true);
    expect(resolves('/images/stats/luck.png')).toBe(true);
    expect(resolves('/mice/not-a-mouse')).toBe(false);
    expect(resolves('/nowhere')).toBe(false);
    expect(resolves('/items/type/nothing')).toBe(false);
  });
});

describe('links that leave the site', () => {
  const external = getResources().filter((resource) => !resource.url.startsWith('/'));

  test('are all https', () => {
    expect(external.filter((resource) => !resource.url.startsWith('https://')).map((resource) => resource.id)).toEqual(
      [],
    );
  });

  // An install button runs someone else's code in a hunter's game session, so where each one points is pinned
  // down here: a changed link has to change this test too, where a reviewer will see it.
  test('every userscript installs from its own Greasy Fork page', () => {
    const scripts = getResources().filter((resource) => resource.category === 'userscript');
    expect(scripts.length).toBeGreaterThan(0);
    const odd = scripts.filter(
      (script) =>
        !/^https:\/\/greasyfork\.org\/en\/scripts\/\d+-[a-z0-9-]+$/.test(script.url) || script.source !== 'GreasyFork',
    );
    expect(odd.map((script) => script.id)).toEqual([]);
  });

  test('extensions install from the browser stores or the project’s own repository', () => {
    const allowed = [
      /^https:\/\/chrome\.google\.com\/webstore\/detail\/[a-z0-9-]+\/[a-p]{32}$/,
      /^https:\/\/addons\.mozilla\.org\/en-US\/firefox\/addon\/[a-z0-9-]+\/$/,
      /^https:\/\/github\.com\/(MHCommunity|m-h-c-t)\/[A-Za-z0-9-]+$/,
    ];
    const extensions = getResources().filter((resource) => resource.category === 'extension');
    expect(extensions.length).toBeGreaterThan(0);
    const urls = extensions.flatMap((extension) => [
      extension.url,
      ...(extension.install ?? []).map((link) => link.url),
    ]);
    expect(urls.filter((url) => !allowed.some((pattern) => pattern.test(url)))).toEqual([]);
  });

  test('a link is only called internal when it stays on the site', () => {
    expect(isInternalPath('/mice/glazed')).toBe(true);
    expect(isInternalPath('//example.com/mice')).toBe(false);
    expect(isInternalPath('https://example.com')).toBe(false);
  });
});

describe('fetched data is safe to build pages from', () => {
  // Ids become page addresses and image file names, so they must be plain. The weekly update runs these tests
  // before it commits, which is the only review that data gets.
  test('mouse and item ids are letters, digits and underscores', () => {
    const plain = /^[A-Za-z0-9_]+$/;
    expect(
      getAllMice()
        .filter((mouse) => !plain.test(mouse.type))
        .map((mouse) => mouse.type),
    ).toEqual([]);
    expect((itemIndex as { type: string }[]).filter((item) => !plain.test(item.type)).map((item) => item.type)).toEqual(
      [],
    );
  });

  // The trap effects come from a spreadsheet anyone in the community may be able to edit.
  test('trap effects carry no links', () => {
    const text = fs.readFileSync(path.join(ROOT, 'src/data/trap-effects.json'), 'utf8');
    expect(text.match(/https?:\/\/\S+|www\.\S+|\b[a-z0-9-]+\.(?:com|net|org|io|rip|gg|ly|co)\b/gi) ?? []).toEqual([]);
  });
});

describe('art kept in this repo', () => {
  const exists = (url: string) => fs.existsSync(path.join(ROOT, 'public', url));

  test('every title has its icon', () => {
    const missing = (titles as { id: string }[]).map((title) => titleImageUrl(title.id)).filter((url) => !exists(url));
    expect(missing).toEqual([]);
  });

  test('every item listed as local has its picture, and the page uses it', () => {
    expect(LOCAL_ITEM_ART.size).toBeGreaterThan(0);
    for (const slug of LOCAL_ITEM_ART) {
      const url = itemImageUrl(slug, 'large');
      expect(url).toBe(`/images/items/large/${slug}.png`);
      expect(exists(url)).toBe(true);
      // The social card still gets the CDN's copy, and so does every other size.
      expect(itemCdnImageUrl(slug, 'large')).toStartWith('https://i.mouse.rip/');
      expect(itemImageUrl(slug)).toStartWith('https://i.mouse.rip/');
    }
  });
});

describe('links', () => {
  test('resources and userscripts that point at the site', () => {
    expect(broken(getResources().flatMap((resource) => (resource.url.startsWith('/') ? [resource.url] : [])))).toEqual(
      [],
    );
  });

  test('links and images in the guides', () => {
    const hrefs: string[] = [];
    for (const file of fs.readdirSync(path.join(ROOT, 'src/content/guides'))) {
      const text = fs.readFileSync(path.join(ROOT, 'src/content/guides', file), 'utf8');
      for (const match of text.matchAll(/\]\((\/[^)\s]*)\)|(?:href|src)="(\/[^"]*)"/g))
        hrefs.push(match[1] ?? match[2]);
    }
    expect(hrefs.length).toBeGreaterThan(0);
    expect(broken(hrefs)).toEqual([]);
  });

  test('search results', () => {
    const records = getStaticSearchRecords().filter((record) => !record.external);
    expect(broken(records.map((record) => record.href))).toEqual([]);
  });

  test('every page in the sitemap', () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(5000);
    expect(broken(entries.map((entry) => entry.url))).toEqual([]);
    for (const entry of entries) expect(entry.url.startsWith('https://mouse.rip')).toBe(true);
  });

  test('the sitemap lists every page that has no parameters', () => {
    const listed = new Set(sitemap().map((entry) => new URL(entry.url).pathname.replace(/\/$/, '') || '/'));
    expect([...staticPages].filter((page) => !listed.has(page) && !redirects.has(page))).toEqual([]);
  });

  test('links written into the pages and components', () => {
    const hrefs: string[] = [];
    const files = (fs.readdirSync(path.join(ROOT, 'src'), { recursive: true, encoding: 'utf8' }) as string[]).filter(
      (file) => /\.tsx?$/.test(file),
    );
    for (const file of files) {
      const text = fs.readFileSync(path.join(ROOT, 'src', file), 'utf8');
      // Plain string links only: href="/x", href={'/x'}, href: '/x'.
      for (const match of text.matchAll(/href(?:=|:\s*|=\{)\s*["'](\/[^"'`${}]*)["']/g)) hrefs.push(match[1]);
    }
    expect(hrefs.length).toBeGreaterThan(20);
    expect(broken(hrefs)).toEqual([]);
  });
});

describe('data that links to other data', () => {
  test('every mouse in a group exists', () => {
    const ids = new Set(getAllMice().map((mouse) => mouse.id));
    const missing = (miceGroups as { id: string; mouse_ids: number[] }[]).flatMap((group) =>
      group.mouse_ids.filter((id) => !ids.has(id)).map((id) => `${group.id}: ${id}`),
    );
    expect(missing).toEqual([]);
  });

  test('location ids are unique and every location has its game environment', () => {
    const all = getLocations().flatMap((region) => region.locations);
    expect(new Set(all.map((location) => location.id)).size).toBe(all.length);
    expect(all.filter((location) => !getLocation(location.id)?.environmentId).map((location) => location.name)).toEqual(
      [],
    );
  });
});
