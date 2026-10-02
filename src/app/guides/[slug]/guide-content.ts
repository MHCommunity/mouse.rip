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
