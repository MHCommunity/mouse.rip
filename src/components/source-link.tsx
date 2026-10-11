import React from 'react';

const sources = {
  mhct: { name: 'MHCT', href: 'https://mhct.win' },
  'mh-tools': { name: 'MH-Tools', href: 'https://github.com/tsitu/MH-Tools' },
};

/** A link crediting where a table's data comes from. */
export function SourceLink({ source }: { source: keyof typeof sources }) {
  const { name, href } = sources[source];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-200"
    >
      {name}
    </a>
  );
}
