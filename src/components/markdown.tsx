import clsx from 'clsx';
import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

/** The plain text of a heading's children. */
function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

/** "Treasure chests & the Heart of the Meteor" → "treasure-chests-the-heart-of-the-meteor", for #links within a guide. */
export function headingId(children: React.ReactNode): string | undefined {
  const id = textOf(children)
    .toLowerCase()
    .replace(/&amp;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return id || undefined;
}

// react-markdown hands each override the syntax-tree `node` it was made from. Left in the props it reaches the HTML
// as node="[object Object]" and is serialised whole into the page's payload, which doubled the size of a guide.
// Every override takes it out.
const components: Components = {
  h1: ({ node: _node, className, ...props }) => (
    <h1
      {...props}
      className={clsx(
        className,
        'mt-10 mb-4 text-3xl font-semibold tracking-tight text-balance text-zinc-950 first:mt-0 dark:text-white',
      )}
    />
  ),
  // Headings get ids from their text, so a guide's contents can link to its sections.
  h2: ({ node: _node, className, children, ...props }) => (
    <h2
      {...props}
      id={props.id ?? headingId(children)}
      className={clsx(
        className,
        'mt-10 mb-3 scroll-mt-20 border-b border-zinc-200 pb-2 text-2xl font-semibold tracking-tight text-zinc-950 first:mt-0 dark:border-zinc-800 dark:text-white',
      )}
    >
      {children}
    </h2>
  ),
  h3: ({ node: _node, className, children, ...props }) => (
    <h3
      {...props}
      id={props.id ?? headingId(children)}
      className={clsx(
        className,
        'mt-8 mb-2 scroll-mt-20 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white',
      )}
    >
      {children}
    </h3>
  ),
  h4: ({ node: _node, className, ...props }) => (
    <h4 {...props} className={clsx(className, 'mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100')} />
  ),
  p: ({ node: _node, className, ...props }) => (
    <p {...props} className={clsx(className, 'my-4 text-base/7 text-zinc-700 dark:text-zinc-300')} />
  ),
  a: ({ node: _node, className, href, children, ...props }) => {
    const external = !!href && /^https?:\/\//.test(href);
    return (
      <a
        {...props}
        href={href}
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        className={clsx(
          className,
          // Underlined: in a paragraph, colour alone doesn't mark a link for everyone.
          'font-medium text-pink-600 underline decoration-pink-600/30 underline-offset-2 transition-colors hover:text-pink-800 hover:decoration-current dark:text-pink-400 dark:decoration-pink-400/40 dark:hover:text-pink-200',
        )}
      >
        {children}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  },
  ul: ({ node: _node, className, ...props }) => (
    <ul
      {...props}
      className={clsx(
        className,
        'my-4 list-disc space-y-1.5 pl-6 text-base/7 text-zinc-700 marker:text-zinc-400 dark:text-zinc-300',
      )}
    />
  ),
  ol: ({ node: _node, className, ...props }) => (
    <ol
      {...props}
      className={clsx(
        className,
        'my-4 list-decimal space-y-1.5 pl-6 text-base/7 text-zinc-700 marker:text-zinc-400 dark:text-zinc-300',
      )}
    />
  ),
  li: ({ node: _node, className, ...props }) => (
    <li {...props} className={clsx(className, 'pl-1 [&>ul]:my-1.5 [&>ol]:my-1.5')} />
  ),
  blockquote: ({ node: _node, className, ...props }) => (
    <blockquote
      {...props}
      className={clsx(
        className,
        'my-4 max-w-prose border-l-2 border-zinc-300 pl-4 text-zinc-700 italic dark:border-zinc-600 dark:text-zinc-300',
      )}
    />
  ),
  code: ({ node: _node, className, ...props }) => (
    <code
      {...props}
      className={clsx(
        className,
        'rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-pink-700 dark:bg-zinc-800 dark:text-pink-300',
      )}
    />
  ),
  pre: ({ node: _node, className, ...props }) => (
    <pre
      {...props}
      className={clsx(
        className,
        'my-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100 dark:bg-zinc-950 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-zinc-100',
      )}
    />
  ),
  hr: ({ node: _node, className, ...props }) => (
    <hr {...props} className={clsx(className, 'my-8 border-zinc-200 dark:border-zinc-800')} />
  ),
  img: ({ node: _node, className, alt, ...props }) =>
    // class="icon" is a small picture beside text, such as an item in a table; anything else is a screenshot.
    className?.split(' ').includes('icon') ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...props}
        alt={alt ?? ''}
        width={24}
        height={24}
        loading="lazy"
        className="mr-1.5 inline-block size-6 object-contain align-middle"
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...props}
        alt={alt ?? ''}
        className={clsx(
          className,
          'my-6 h-auto max-w-full rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-800',
        )}
      />
    ),
  table: ({ node: _node, className, ...props }) => (
    <div className="scroll-shadows my-6 overflow-x-auto rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800">
      <table
        {...props}
        className={clsx(className, 'min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-700')}
      />
    </div>
  ),
  thead: ({ node: _node, className, ...props }) => (
    <thead {...props} className={clsx(className, 'bg-zinc-50 dark:bg-zinc-800')} />
  ),
  tbody: ({ node: _node, className, ...props }) => (
    <tbody {...props} className={clsx(className, 'divide-y divide-zinc-200 dark:divide-zinc-800')} />
  ),
  th: ({ node: _node, className, ...props }) => (
    <th {...props} className={clsx(className, 'px-3 py-2 text-left font-semibold text-zinc-900 dark:text-zinc-100')} />
  ),
  td: ({ node: _node, className, ...props }) => (
    <td {...props} className={clsx(className, 'px-3 py-2 text-zinc-700 dark:text-zinc-300')} />
  ),
  strong: ({ node: _node, className, ...props }) => (
    <strong {...props} className={clsx(className, 'font-semibold text-zinc-900 dark:text-zinc-100')} />
  ),
};

const DISALLOWED_ELEMENTS = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form'];

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={clsx(className, '[&>:is(p,ul,ol,h1,h2,h3,h4)]:max-w-prose [&_p]:text-pretty')}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
        // Guides use raw HTML for layout (a styled div, a sized image). Nothing in one needs to run script, load
        // a frame or redirect the page, so a guide pasted in from elsewhere can't bring those along.
        disallowedElements={DISALLOWED_ELEMENTS}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
