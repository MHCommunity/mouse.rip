import clsx from 'clsx';

import { ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/react/20/solid';
import { Link } from 'next-view-transitions';
import { Badge } from '@/components/badge';
import { isOurUrl, isInternalPath } from '@/utils';

import { Resource } from '@/types';

interface ItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  item: Resource;
  showtags?: boolean;
  /** Heading level for the card title; use 3 when the list sits under a section h2. */
  headingLevel?: 2 | 3;
  /** The category badge only helps in mixed lists; a page of one category hides it. */
  showCategory?: boolean;
  /** A smaller, flatter card for a short list beneath a page's main content. */
  compact?: boolean;
}

const cardStyles: Record<string, string> = {
  guide: 'hover:border-pink-300 focus-visible:ring-pink-500 dark:hover:border-pink-800',
  extension: 'hover:border-cyan-300 focus-visible:ring-cyan-500 dark:hover:border-cyan-800',
  spreadsheet: 'hover:border-blue-300 focus-visible:ring-blue-500 dark:hover:border-blue-800',
  tool: 'hover:border-green-300 focus-visible:ring-green-500 dark:hover:border-green-800',
  userscript: 'hover:border-purple-300 focus-visible:ring-purple-500 dark:hover:border-purple-800',
};

export function Item({
  item,
  showtags = false,
  headingLevel = 2,
  showCategory = true,
  compact = false,
  ...props
}: ItemProps) {
  const Title = `h${headingLevel}` as const;
  // Userscripts always resolve to their on-site detail page.
  const href = item.category === 'userscript' ? `/userscripts/${item.id}` : item.url;

  // "Ours" = a mouse.rip page (relative path or a mouse.rip host). Those get an
  // "Open" affordance; everything else is an outbound link.
  const ours = isOurUrl(href);
  const internal = isInternalPath(href); // client-routable within this app
  const linkLabel = ours ? 'Open' : item.source ? `View on ${item.source}` : 'View';
  const ArrowIcon = ours ? ArrowRightIcon : ArrowUpRightIcon;
  const opensNewTab = !internal && !ours;

  const className = clsx(
    'group flex rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 shadow-sm transition duration-200 focus:outline-none focus-visible:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300',
    compact
      ? 'w-full rounded-lg hover:shadow-md'
      : 'hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-sm motion-reduce:transform-none',
    cardStyles[item.category],
  );

  const body = (
    <div className={clsx('flex h-full flex-1 flex-col', compact ? 'gap-1 p-4' : 'gap-2 p-5')}>
      <Title
        className={clsx(
          'font-semibold tracking-tight text-zinc-900 dark:text-zinc-100',
          compact ? 'text-base' : 'text-lg',
        )}
      >
        {item.name}
      </Title>
      <div className="text-sm/6 font-normal text-pretty text-zinc-600 dark:text-zinc-400">{item.description}</div>
      {item.tags && showtags && (
        <div className="flex flex-wrap items-end gap-x-2">
          {[...new Set(item.tags)].map((tag) => (
            <Badge key={tag} color="tag">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      <div className={clsx('mt-auto flex items-end justify-between', compact ? 'pt-3' : 'pt-2')}>
        {item.category && showCategory && (
          <Badge key={item.category} id={`${item.id}-${item.category}`} color={`${item.category}Badge`}>
            {item.category}
          </Badge>
        )}
        <span
          className={clsx(
            'ml-auto flex items-center text-sm font-semibold whitespace-nowrap transition-colors',
            ours
              ? 'text-pink-600 group-hover:text-pink-700 dark:text-pink-400 dark:group-hover:text-pink-300'
              : 'text-zinc-500 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-100',
          )}
        >
          {linkLabel}
          {opensNewTab && <span className="sr-only"> (opens in a new tab)</span>}
          <ArrowIcon
            className={clsx(
              'ml-1 inline-block size-4 transition-transform duration-200',
              ours ? 'group-hover:translate-x-1' : 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
            )}
            aria-hidden="true"
          />
        </span>
      </div>
    </div>
  );

  // Internal app routes use the client router (with view transitions); outbound
  // links open in a new tab.
  if (internal) {
    return (
      <Link href={href} className={className} {...props}>
        {body}
      </Link>
    );
  }

  return (
    <a
      href={href}
      {...(opensNewTab ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      className={className}
      {...props}
    >
      {body}
    </a>
  );
}
