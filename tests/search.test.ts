import { beforeAll, describe, expect, test } from 'bun:test';

import {
  getStaticSearchRecords,
  loadGameItemRecords,
  loadMouseRecords,
  normalizeSearchText,
  searchRecords,
  type SearchRecord,
} from '@/lib/search';

let records: SearchRecord[] = [];

beforeAll(async () => {
  records = [...getStaticSearchRecords(), ...(await loadMouseRecords()), ...(await loadGameItemRecords())];
});

const top = (query: string, count = 1) => searchRecords(records, query).slice(0, count);
const titles = (query: string, count = 5) => top(query, count).map((record) => record.title);

describe('normalizeSearchText', () => {
  test.each([
    ['SUPER|brie+', 'super brie'],
    ['Ful’Mina’s Gift', 'ful mina s gift'],
    ['  Café   Crème  ', 'cafe creme'],
    ['Rank-up calculator', 'rank up calculator'],
    ['', ''],
  ])('%p → %p', (input, expected) => {
    expect(normalizeSearchText(input)).toBe(expected);
  });
});

describe('the record set', () => {
  test('has every kind of thing in it', () => {
    const kinds = new Set(records.map((record) => record.kind));
    for (const kind of ['page', 'mouse', 'group', 'location', 'item', 'guide', 'tool', 'title']) {
      expect(kinds.has(kind as SearchRecord['kind'])).toBe(true);
    }
  });

  test('ids are unique', () => {
    const seen = new Set<string>();
    const duplicates = records.filter((record) => seen.size === seen.add(record.id).size).map((record) => record.id);
    expect(duplicates).toEqual([]);
  });

  test('on-site links are paths and off-site ones are marked external', () => {
    const wrong = records.filter((record) => record.external !== /^https?:/.test(record.href) && record.external);
    expect(wrong.map((record) => record.href)).toEqual([]);
    expect(records.filter((record) => !record.external && !record.href.startsWith('/')).map((r) => r.href)).toEqual([]);
  });
});

describe('searchRecords', () => {
  test('nothing to search for finds nothing', () => {
    expect(searchRecords(records, '')).toEqual([]);
    expect(searchRecords(records, '   ')).toEqual([]);
    expect(searchRecords(records, '!!!')).toEqual([]);
  });

  test('respects the limit, keeping room for each kind of result', () => {
    const results = searchRecords(records, 'egg', 12);
    expect(results).toHaveLength(12);
    expect(new Set(results.map((record) => record.group)).size).toBeGreaterThan(1);
  });

  test('dictionary words are just words', () => {
    expect(() => searchRecords(records, 'constructor')).not.toThrow();
    expect(() => searchRecords(records, '__proto__ toString')).not.toThrow();
  });

  test.each([
    // A mouse by its short name, or with "mouse" on the end.
    ['glazy', 'Glazy Mouse'],
    ['glazy mouse', 'Glazy Mouse'],
    ['Abominable Snow', 'Abominable Snow Mouse'],
    ['draconic warden', 'Draconic Warden Mouse'],
    // Apostrophes are optional.
    ["ful'mina", 'Ful’Mina the Mountain Queen'],
    ['fulmina', 'Ful’Mina the Mountain Queen'],
    // A location beats a mouse whose name starts the same way.
    ['valour', 'Valour'],
    ['valour rift', 'Valour Rift'],
    ['floating', 'Floating Islands'],
    ['toxic', 'Toxic Spill'],
    ['gnawnia', 'Gnawnia'],
    ['fort rox', 'Fort Rox'],
    // Community shorthand.
    ['sb', 'SUPER|brie+'],
    ['frox', 'Fort Rox'],
    ['tse', 'Trap and base special effects'],
    // Typos, on longer words.
    ['labyrnth', 'Labyrinth'],
    ['chedar', 'Cheddar Cheese'],
    ['abominabel', 'Abominable Snow Mouse'],
    // A four-letter word gets a near miss only when it matches nothing as typed.
    ['relc hunter', 'Relic Hunter Mouse'],
    ['glzy', 'Glazy Mouse'],
    // Two letters swapped count as one typo.
    ['brei', 'Brie Cheese'],
    // The site's own pages.
    ['minluck', 'Minlucks'],
    ['map planner', 'Treasure map planner'],
    ['rank up', 'Rank-up calculator'],
    ['rankings', 'Mice ranked'],
    ['spreadsheets', 'Spreadsheets'],
    ['relic hunter', 'Relic Hunter'],
    // Saying you're new finds the beginner's guide, not the Beginner's Luck item.
    ['beginner guide', 'MouseHunt Essentials Guide'],
    ['new player', 'MouseHunt Essentials Guide'],
    ['im a new player', 'MouseHunt Essentials Guide'],
    ["i'm new", 'MouseHunt Essentials Guide'],
    ['getting started', 'MouseHunt Essentials Guide'],
    ['coming back', 'Returning Players'],
    // Asking for a kind of thing steers towards it.
    ['vr guide', 'Valour Rift Guide'],
    ['fabled', 'Fabled'],
  ])('%p finds %p first', (query, expected) => {
    // Titles are compared with plain apostrophes, as the data has both kinds.
    expect(titles(query, 1)[0]?.replace(/[‘’]/g, "'")).toBe(expected.replace(/[‘’]/g, "'"));
  });

  test('a short word only matches at the start of a word', () => {
    // "sb" is SUPER|brie+, not every name with "sb" inside it.
    expect(searchRecords(records, 'sb').some((record) => /crossbow/i.test(record.title))).toBe(false);
  });

  test('a four-letter word that matches as typed does not also pull in near misses', () => {
    // "tide" is one letter from "time" and "ride", and "zomb" from "tomb".
    expect(
      searchRecords(records, 'tide').filter((record) => !/tide/i.test(`${record.title} ${record.keywords}`)),
    ).toEqual([]);
    expect(searchRecords(records, 'zomb').some((record) => /\btomb/i.test(record.title))).toBe(false);
  });

  test('every word has to match', () => {
    expect(searchRecords(records, 'glazy zzzzqqq')).toEqual([]);
  });

  test('asking for a guide puts guides first', () => {
    expect(top('valour guide', 3).every((record) => record.kind === 'guide')).toBe(true);
  });

  test('a mouse result carries the answer search shows inline', () => {
    const [glazy] = top('glazy');
    expect(glazy.kind).toBe('mouse');
    expect(glazy.href).toBe('/mice/glazed');
    expect(glazy.mouse?.minlucks.length).toBeGreaterThan(0);
    expect(glazy.badge).toMatch(/^Minluck \d+ \(/);
  });

  test('every mouse can be found by its own name', () => {
    const mice = records.filter((record) => record.kind === 'mouse');
    const missed = mice.filter((mouse) => !searchRecords(records, mouse.title, 40).includes(mouse));
    expect(missed.map((mouse) => mouse.title)).toEqual([]);
  }, 60_000);

  test('every location can be found by its own name, first', () => {
    const locations = records.filter((record) => record.id.startsWith('location-'));
    const missed = locations.filter((location) => searchRecords(records, location.title)[0] !== location);
    expect(missed.map((location) => `${location.title} → ${searchRecords(records, location.title)[0]?.title}`)).toEqual(
      [],
    );
  }, 60_000);

  test('a plural that stems differently still finds the name it is in', () => {
    // "curiosities" stems to "curiosity", which isn't in "curiosities".
    expect(titles('cluttergrin curiosities', 1)).toEqual(['Cluttergrin the Commodore of Curiosities']);
  });
});
