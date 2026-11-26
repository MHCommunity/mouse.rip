import clsx from 'clsx';

import { ArrowUpRightIcon } from '@heroicons/react/20/solid';
import { Link } from 'next-view-transitions';
import { Badge } from '@/components/badge';
import { isOurUrl, isInternalPath } from '@/utils';

import { Resource } from '@/types';
import { userscriptTagName } from '@/lib/userscript-tags';

interface ItemProps {
  item: Resource;
  showtags?: boolean;
  /** Heading level for the row's title; use 3 when the list sits under a section h2. */
  headingLevel?: 2 | 3;
  /** The category badge only helps in mixed lists; a page of one category hides it. */
  showCategory?: boolean;
}

/** The focus ring takes the section's colour, matching the sidebar. */
const focusStyles: Record<string, string> = {
  guide: 'focus-visible:ring-pink-500',
  extension: 'focus-visible:ring-cyan-500',
  spreadsheet: 'focus-visible:ring-blue-500',
  tool: 'focus-visible:ring-green-500',
  userscript: 'focus-visible:ring-purple-500',
};

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * One resource as a row in a list: the name and what it does on the left, and
 * where it leads on the right when that's another site. The whole row is the link.
 */
export function Item({ item, showtags = false, headingLevel = 2, showCategory = true }: ItemProps) {
  const Title = `h${headingLevel}` as const;
  // Userscripts always resolve to their on-site detail page.
  const href = item.category === 'userscript' ? `/userscripts/${item.id}` : item.url;

  const internal = isInternalPath(href); // client-routable within this app
  // guide.mouse.rip and the like still leave this app, so they say where they go.
  const opensNewTab = !internal && !isOurUrl(href);
  const destination = internal ? null : (item.source ?? hostnameOf(href));

  const className = clsx(
    'group flex flex-col gap-1 px-4 py-3.5 transition-colors hover:bg-zinc-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset sm:flex-row sm:items-start sm:gap-6 dark:hover:bg-white/5',
    focusStyles[item.category],
  );

  const body = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Title className="text-base/6 font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</Title>
          {item.category && showCategory && <Badge color={`${item.category}Badge`}>{item.category}</Badge>}
        </div>
        <p className="mt-0.5 text-sm/6 text-pretty text-zinc-600 dark:text-zinc-400">{item.description}</p>
        {item.tags && showtags && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[...new Set(item.tags)].map((tag) => (
              <Badge key={tag} color="tag">
                {userscriptTagName(tag)}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {destination && (
        <span className="flex shrink-0 items-center gap-1 text-sm/6 text-zinc-500 group-hover:text-zinc-800 sm:pt-px dark:text-zinc-400 dark:group-hover:text-zinc-100">
          {destination}
          {opensNewTab && (
            <>
              <span className="sr-only"> (opens in a new tab)</span>
              <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
            </>
          )}
        </span>
      )}
    </>
  );

  // Internal app routes use the client router (with view transitions); outbound
  // links open in a new tab.
  if (internal) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <a href={href} {...(opensNewTab ? { target: '_blank', rel: 'noreferrer noopener' } : {})} className={className}>
      {body}
    </a>
  );
}
