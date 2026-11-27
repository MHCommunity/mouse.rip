import { describe, expect, test } from 'bun:test';

import { getGuideBody, guideSections } from '@/app/guides/[slug]/guide-content';
import { headingId } from '@/components/markdown';

describe('guide contents', () => {
  test('a long guide lists its sections, with the ids its headings get', () => {
    const sections = guideSections(getGuideBody('kings-gauntlet')!, headingId);
    expect(sections[0]).toEqual({ id: 'how-to-read-this', title: 'How to read this' });
    expect(sections).toHaveLength(9);
  });

  test('a guide that writes its own contents, or a short one, gets none', () => {
    expect(guideSections(getGuideBody('fort-rox')!, headingId)).toEqual([]);
    expect(guideSections(getGuideBody('shellnut-checklist')!, headingId)).toEqual([]);
  });

  test('headings inside a code block, and link and emphasis markup, are handled', () => {
    const body = `${'x'.repeat(4000)}\n## **One**\n## [Two](/x)\n\`\`\`\n## Not a heading\n\`\`\`\n## Three\n## Four`;
    expect(guideSections(body, headingId).map((section) => section.title)).toEqual(['One', 'Two', 'Three', 'Four']);
  });
});
