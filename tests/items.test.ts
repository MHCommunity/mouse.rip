import { describe, expect, test } from 'bun:test';

import itemIndex from '@/data/generated/game-items-search.json';
import {
  CLASSIFICATION_DESCRIPTIONS,
  CLASSIFICATION_ORDER,
  OTHER_SUBGROUP,
  SUBGROUPS,
  classificationLabel,
  classificationName,
  itemSubgroup,
  orderClassifications,
  subgroupLabel,
  subgroupsPresent,
} from '@/lib/item-classifications';
import type { IndexedItem } from '@/lib/client-index';

const items = itemIndex as IndexedItem[];

describe('names', () => {
  test.each([
    ['trinket', 'Charm', 'Charms'],
    ['stat', 'Special', 'Special Items'],
    ['crafting_item', 'Crafting Item', 'Crafting Items'],
    ['weapon', 'Weapon', 'Weapons'],
    ['map_piece', 'Map Piece', 'Map Pieces'],
  ])('%p is %p, plural %p', (key, name, label) => {
    expect(classificationName(key)).toBe(name);
    expect(classificationLabel(key)).toBe(label);
  });

  test('orderClassifications puts the friendly ones first, then the rest alphabetically', () => {
    expect(orderClassifications(['zeta', 'stat', 'weapon', 'alpha', 'bait'])).toEqual([
      'weapon',
      'bait',
      'stat',
      'alpha',
      'zeta',
    ]);
  });
});

describe('sub-groups', () => {
  test('an item goes in the first group it matches, by tag or by name', () => {
    expect(itemSubgroup({ classification: 'stat', tags: ['codex', 'currency'], name: 'X' })).toBe('currency');
    expect(itemSubgroup({ classification: 'convertible', name: 'Rift Supply Kit' })).toBe('kits');
    expect(itemSubgroup({ classification: 'convertible', name: 'Lucky Gift Basket' })).toBe('gifts');
    expect(itemSubgroup({ classification: 'convertible', name: 'Mystery Thing' })).toBe(OTHER_SUBGROUP);
  });

  test('types that are not split up have no sub-group', () => {
    expect(itemSubgroup({ classification: 'weapon', name: 'Trap' })).toBeUndefined();
  });

  test('labels', () => {
    expect(subgroupLabel('stat', 'codex')).toBe('Codices');
    expect(subgroupLabel('stat', OTHER_SUBGROUP)).toBe('Other');
  });

  test('subgroupsPresent keeps the defined order and puts Other last', () => {
    expect(subgroupsPresent('stat', ['other', 'vintage', 'currency'])).toEqual(['currency', 'vintage', 'other']);
  });

  test('group ids are unique within each type', () => {
    for (const [type, groups] of Object.entries(SUBGROUPS)) {
      expect(new Set(groups.map((g) => g.id)).size, type).toBe(groups.length);
    }
  });
});

describe('the real items', () => {
  test('the main types are the ones with a description, and they are all in the data', () => {
    // The browser lists types with a description as its main chips, and the rest under "Other types".
    expect(Object.keys(CLASSIFICATION_DESCRIPTIONS).sort()).toEqual([...CLASSIFICATION_ORDER].sort());
    const present = new Set(items.map((item) => item.classification));
    expect(CLASSIFICATION_ORDER.filter((key) => !present.has(key))).toEqual([]);
  });

  test('every type has a readable name', () => {
    const names = [...new Set(items.map((item) => item.classification))].map(classificationLabel);
    expect(names.filter((name) => /_|^[a-z]/.test(name))).toEqual([]);
  });

  test('every defined group has items in it', () => {
    const empty: string[] = [];
    for (const [type, groups] of Object.entries(SUBGROUPS)) {
      const used = new Set(items.filter((item) => item.classification === type).map(itemSubgroup));
      for (const group of groups) if (!used.has(group.id)) empty.push(`${type}/${group.id}`);
    }
    expect(empty).toEqual([]);
  });

  test('"Other" stays a minority in each split type, so the split is worth having', () => {
    for (const type of Object.keys(SUBGROUPS)) {
      const ofType = items.filter((item) => item.classification === type);
      const other = ofType.filter((item) => itemSubgroup(item) === OTHER_SUBGROUP).length;
      expect(other / ofType.length, type).toBeLessThan(0.5);
    }
  });

  test('kits and gifts matched by name are not obviously something else', () => {
    // Words in a name that mean the item isn't a kit or a gift, despite matching one of their words.
    const wrong = items
      .filter((item) => item.classification === 'convertible')
      .filter((item) => ['kits', 'gifts'].includes(itemSubgroup(item) ?? ''))
      .filter((item) => /\b(egg|chest|scroll case)\b/i.test(item.name) && !item.tags?.length);
    expect(wrong.map((item) => item.name)).toEqual([]);
  });

  test('item ids and types are unique', () => {
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    expect(new Set(items.map((item) => item.type)).size).toBe(items.length);
  });
});
