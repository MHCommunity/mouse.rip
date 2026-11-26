import { describe, expect, test } from 'bun:test';

import { getAllMice, getMouseRanks, mouseSlug } from '@/lib/game-data';
import { cleanNumber, findMouseByName, rankUp, type RankTitle } from '@/lib/rank-up';
import { rankMice, type RankBy, type RankedMouse } from '@/lib/rankings';
import { getTitles } from '@/lib/site-data';
import { WISDOM_BY_TITLE } from '@/lib/titles';

const titles: RankTitle[] = getTitles()
  .filter((title) => WISDOM_BY_TITLE[title.id] !== undefined)
  .map((title) => ({ id: title.id, name: title.name, wisdom: WISDOM_BY_TITLE[title.id], image: '' }));
const index = (id: string) => titles.findIndex((title) => title.id === id);

describe('titles', () => {
  test('every title in the game has a wisdom threshold', () => {
    expect(
      getTitles()
        .filter((title) => WISDOM_BY_TITLE[title.id] === undefined)
        .map((title) => title.id),
    ).toEqual([]);
  });

  test('every threshold is for a title in the game', () => {
    const ids = new Set(getTitles().map((title) => title.id));
    expect(Object.keys(WISDOM_BY_TITLE).filter((id) => !ids.has(id))).toEqual([]);
  });

  test('thresholds go up with each title', () => {
    expect(titles[0].wisdom).toBe(0);
    for (let i = 1; i < titles.length; i++) expect(titles[i].wisdom).toBeGreaterThan(titles[i - 1].wisdom);
  });
});

describe('cleanNumber', () => {
  test.each([
    ['7,500,000', false, '7500000'],
    ['42.5%', true, '42.5'],
    ['4.2.5', true, '4.25'],
    ['abc', false, ''],
    ['1.5', false, '15'],
  ])('%p (decimal %p) → %p', (input, decimal, expected) => {
    expect(cleanNumber(input, decimal)).toBe(expected);
  });
});

describe('rankUp', () => {
  const baron = index('baron_baroness');
  const count = index('count_countess');

  test('42.5% through Baron to Count needs 4,900,621 wisdom', () => {
    const result = rankUp(titles, { currentIndex: baron, targetIndex: count, progress: '42.5', exactWisdom: '' });
    expect(result.needed).toBe(4_900_621);
    expect(result.steps.map((title) => title.id)).toEqual(['count_countess']);
    // At 3,600 wisdom each, that's 1,362 Glazy Mouse catches.
    expect(Math.ceil(result.needed / 3_600)).toBe(1_362);
  });

  test('progress is a share of the way from this title to the next', () => {
    const start = rankUp(titles, { currentIndex: baron, targetIndex: count, progress: '0', exactWisdom: '' });
    const end = rankUp(titles, { currentIndex: baron, targetIndex: count, progress: '100', exactWisdom: '' });
    expect(start.wisdom).toBe(titles[baron].wisdom);
    expect(end.needed).toBe(0);
  });

  test('progress over 100% counts as 100%', () => {
    const over = rankUp(titles, { currentIndex: baron, targetIndex: count, progress: '250', exactWisdom: '' });
    expect(over.wisdom).toBe(titles[count].wisdom);
  });

  test('exact wisdom wins over the title and progress', () => {
    const result = rankUp(titles, { currentIndex: 0, targetIndex: count, progress: '50', exactWisdom: '10000000' });
    expect(result.wisdom).toBe(10_000_000);
    expect(titles[result.reached].id).toBe('baron_baroness');
    expect(result.needed).toBe(titles[count].wisdom - 10_000_000);
  });

  test('lists each title on the way to a far target', () => {
    const result = rankUp(titles, { currentIndex: 0, targetIndex: 4, progress: '', exactWisdom: '' });
    expect(result.steps.map((title) => title.id)).toEqual(titles.slice(1, 5).map((title) => title.id));
  });

  test('a target at or below the current title moves up to the next one', () => {
    const result = rankUp(titles, { currentIndex: baron, targetIndex: 2, progress: '', exactWisdom: '' });
    expect(result.target?.id).toBe('count_countess');
  });

  test('there is nowhere to go from the top title', () => {
    const top = titles.length - 1;
    const result = rankUp(titles, { currentIndex: top, targetIndex: top, progress: '', exactWisdom: '' });
    expect(result.target).toBeUndefined();
    expect(result.needed).toBe(0);
    expect(result.steps).toEqual([]);
  });

  test('wisdom already past the target needs nothing more', () => {
    const result = rankUp(titles, { currentIndex: 0, targetIndex: 1, progress: '', exactWisdom: '999999999' });
    expect(result.needed).toBe(0);
  });
});

describe('findMouseByName', () => {
  const mice = [
    { name: 'Glazy Mouse', abbreviated_name: 'Glazy' },
    { name: 'Zombie Mouse', abbreviated_name: 'Zombie' },
  ];

  test('by full or short name, in any case, ignoring spaces around it', () => {
    expect(findMouseByName(mice, 'glazy mouse')?.name).toBe('Glazy Mouse');
    expect(findMouseByName(mice, '  GLAZY ')?.name).toBe('Glazy Mouse');
    expect(findMouseByName(mice, 'Zombie')?.name).toBe('Zombie Mouse');
  });

  test('nothing typed, no list yet, or no such mouse', () => {
    expect(findMouseByName(mice, '')).toBeUndefined();
    expect(findMouseByName(null, 'Glazy')).toBeUndefined();
    expect(findMouseByName(mice, 'Glaz')).toBeUndefined();
  });
});

describe('rankMice', () => {
  const mouse = (name: string, points: number): RankedMouse => ({
    slug: name.toLowerCase(),
    name,
    group: 'Test',
    subgroup: '',
    points,
    gold: 0,
    wisdom: 0,
  });

  test('highest first, ties share a rank and are ordered by name', () => {
    const ranked = rankMice([mouse('C', 10), mouse('A', 50), mouse('B', 50), mouse('D', 5)], 'points');
    expect(ranked.map(({ mouse: m, rank }) => `${rank} ${m.name}`)).toEqual(['1 A', '1 B', '3 C', '4 D']);
  });

  test('does not reorder the list it was given', () => {
    const list = [mouse('B', 1), mouse('A', 2)];
    rankMice(list, 'points');
    expect(list.map((m) => m.name)).toEqual(['B', 'A']);
  });

  test('the rankings page agrees with the rank on every mouse page', () => {
    const mice = getAllMice();
    const rows: RankedMouse[] = mice.map((m) => ({
      slug: mouseSlug(m.type),
      name: m.name,
      group: m.group,
      subgroup: m.subgroup ?? '',
      points: m.points,
      gold: m.gold,
      wisdom: m.wisdom,
    }));
    const disagreements: string[] = [];
    for (const by of ['points', 'gold', 'wisdom'] as RankBy[]) {
      const rankBySlug = new Map(rankMice(rows, by).map(({ mouse: m, rank }) => [m.slug, rank]));
      for (const m of mice) {
        const pageRank = getMouseRanks(m.id)?.[by];
        if (pageRank !== rankBySlug.get(mouseSlug(m.type))) {
          disagreements.push(`${m.name} ${by}: page ${pageRank}, rankings ${rankBySlug.get(mouseSlug(m.type))}`);
        }
      }
    }
    expect(disagreements.slice(0, 10)).toEqual([]);
  });
});
