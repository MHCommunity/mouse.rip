import { describe, expect, test } from 'bun:test';

import items from '@/data/generated/game-items.json';
import effects from '@/data/trap-effects.json';
import { matchEffectItems } from '@/lib/trap-effect-items';

const equipment = (items as { type: string; name: string; classification: string }[]).filter((item) =>
  ['weapon', 'base', 'trinket', 'bait'].includes(item.classification),
);
const names = (name: string) => matchEffectItems(name, equipment).map((item) => item.name);

describe('matchEffectItems', () => {
  test('reads the sheet’s shorthand', () => {
    expect(names('Black Widow Base')).toEqual(['Black Widow Base']);
    expect(names('SLAC (II)')).toEqual(['S.L.A.C.', 'S.L.A.C. II']);
    expect(names('Zugzwang’s Ultimate')).toEqual(['Zugzwang’s Ultimate Move'.replace('’', "'")]);
    expect(names('Glacier Gatler / Ice Blaster')).toEqual(['Glacier Gatler', 'Ice Blaster']);
  });

  test('an optional upgrade in brackets links the plain item and the upgrade', () => {
    expect(names('(Maniacal) Brain Extractor')).toEqual(['Brain Extractor', 'Maniacal Brain Extractor']);
    expect(names('Rift (Super) Vacuum Charm')).toEqual(['Rift Vacuum Charm', 'Rift Super Vacuum Charm']);
  });

  test('a group of items links nothing rather than guessing', () => {
    expect(names('Any Drillbot')).toEqual([]);
    expect(names('Nothing Like This Exists')).toEqual([]);
  });

  test('links most of the sheet', () => {
    const all = [
      ...new Set((effects as { effects: { name: string }[] }[]).flatMap((l) => l.effects.map((e) => e.name))),
    ];
    const linked = all.filter((name) => matchEffectItems(name, equipment).length > 0);
    expect(linked.length / all.length).toBeGreaterThan(0.85);
  });
});
