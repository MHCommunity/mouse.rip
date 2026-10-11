import React from 'react';

/** JSON for an inline <script>: escapes `<` so a value can't close the tag. */
export function scriptJson(data: unknown): string {
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}

/** Emits a schema.org JSON-LD block. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: scriptJson(data) }} />;
}
