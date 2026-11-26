import { expect, test } from 'bun:test';

import { mapName } from '@/app/mice/[slug]/mouse-data';

test('retired map versions read as dates', () => {
  expect(mapName('Elite Map (-09.2022)')).toBe('Elite Map (until Sep 2022)');
  expect(mapName('Lantern Lighter Event Map (-2022)')).toBe('Lantern Lighter Event Map (until 2022)');
  expect(mapName('Toxic Spill Map (Hero)')).toBe('Toxic Spill Map (Hero)');
});
