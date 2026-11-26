import { describe, expect, test } from 'bun:test';

import { itemJsonLd, itemSeo, mouseJsonLd, mouseSeo } from '@/lib/entity-seo';
import {
  getAllGameItems,
  getAllMice,
  getConvertibleContents,
  getItemDrops,
  getMouseAttraction,
  itemSlug,
  mouseSlug,
} from '@/lib/game-data';

const BROKEN = /\b(undefined|null|NaN|Infinity)\b|\[object Object\]/;

describe('mouse pages', () => {
  const mice = getAllMice();

  test('every title and description reads cleanly and fits a search result', () => {
    const problems: string[] = [];
    for (const mouse of mice) {
      const { title, description } = mouseSeo(mouse, getMouseAttraction(mouse.id));
      if (!description || description.length > 160) problems.push(`${mouse.name}: ${description.length} chars`);
      if (BROKEN.test(title) || BROKEN.test(description)) problems.push(`${mouse.name}: ${description}`);
      if (/<[^>]+>/.test(description)) problems.push(`${mouse.name}: HTML in description`);
    }
    expect(problems.slice(0, 10)).toEqual([]);
  });

  test('leads with where to catch it, when there is attraction data', () => {
    const glazy = mice.find((m) => m.type === 'glazed');
    expect(glazy).toBeDefined();
    if (!glazy) return;
    const { description } = mouseSeo(glazy, getMouseAttraction(glazy.id));
    expect(description).toMatch(/^Best caught in .+ with .+, at a \d+\.\d\d% attraction rate\./);
  });

  test('a long description is cut at a word, with an ellipsis', () => {
    const mouse = { ...mice[0], description: 'word '.repeat(80), points: 0, gold: 0, minlucks: {} };
    const { description } = mouseSeo(mouse, []);
    expect(description.length).toBeLessThanOrEqual(159);
    expect(description.endsWith('word…')).toBe(true);
  });

  test('structured data names the page’s own URL and image', () => {
    const mouse = mice[0];
    const slug = mouseSlug(mouse.type);
    const data = mouseJsonLd(mouse, getMouseAttraction(mouse.id), slug);
    expect(data.url).toBe(`https://mouse.rip/mice/${slug}`);
    expect(data.image).toContain(`/${slug}.png`);
    expect(JSON.stringify(data)).not.toMatch(BROKEN);
  });
});

describe('item pages', () => {
  test('every title and description reads cleanly and fits a search result', () => {
    const problems: string[] = [];
    for (const item of getAllGameItems()) {
      const context = { contents: getConvertibleContents(item.id), drops: getItemDrops(item.id) };
      const { title, description } = itemSeo(item, context);
      if (!description || description.length > 160) problems.push(`${item.name}: ${description.length} chars`);
      if (BROKEN.test(title) || BROKEN.test(description)) problems.push(`${item.name}: ${title} / ${description}`);
      if (/<[^>]+>/.test(description)) problems.push(`${item.name}: HTML in description`);
      const data = itemJsonLd(item, context, itemSlug(item.type));
      // Leave out the item's own name and slug: "Null Gauntlet" is a real item.
      const rest = JSON.stringify(data).replaceAll(item.name, '').replaceAll(itemSlug(item.type), '');
      if (BROKEN.test(rest)) problems.push(`${item.name}: structured data`);
    }
    expect(problems.slice(0, 10)).toEqual([]);
  });
});
