import 'server-only';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const GUIDES_DIR = join(process.cwd(), 'src', 'content', 'guides');

export function getGuideBody(slug: string): string | null {
  // Guard against path traversal — slugs are simple kebab-case ids.
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return null;
  }

  try {
    return readFileSync(join(GUIDES_DIR, `${slug}.md`), 'utf8');
  } catch {
    return null;
  }
}

/** A guide gets a contents list when it has this many sections and is long enough to need one. */
const MIN_SECTIONS = 4;
const MIN_LENGTH = 4000;

/**
 * The guide's sections, from its `##` headings, for a contents list at the top. Empty when the guide is short or
 * writes its own contents. The ids come from the same headingId the rendered headings use, so the links land.
 */
export function guideSections(
  body: string,
  headingId: (text: string) => string | undefined,
): { id: string; title: string }[] {
  if (body.length < MIN_LENGTH || /^\*\*Contents\*\*$/m.test(body)) return [];
  const sections: { id: string; title: string }[] = [];
  let fenced = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('```')) fenced = !fenced;
    if (fenced || !line.startsWith('## ')) continue;
    const title = line
      .slice(3)
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`]/g, '')
      .trim();
    const id = headingId(title);
    if (id) sections.push({ id, title });
  }
  return sections.length >= MIN_SECTIONS ? sections : [];
}
