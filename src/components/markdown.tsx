import clsx from 'clsx';
import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const components: Components = {
  h1: ({ className, ...props }) => (
    <h1 {...props} className={clsx(className, 'mt-10 mb-4 text-3xl font-semibold tracking-tight text-balance text-zinc-950 first:mt-0 dark:text-white')} />
  ),
  h2: ({ className, ...props }) => (
    <h2 {...props} className={clsx(className, 'mt-10 mb-3 border-b border-zinc-200 pb-2 text-2xl font-semibold tracking-tight text-zinc-950 first:mt-0 dark:border-zinc-800 dark:text-white')} />
  ),
  h3: ({ className, ...props }) => (
    <h3 {...props} className={clsx(className, 'mt-8 mb-2 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white')} />
  ),
  h4: ({ className, ...props }) => (
    <h4 {...props} className={clsx(className, 'mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100')} />
  ),
  p: ({ className, ...props }) => (
    <p {...props} className={clsx(className, 'my-4 text-base/7 text-zinc-700 dark:text-zinc-300')} />
  ),
  a: ({ className, href, ...props }) => {
    const external = !!href && /^https?:\/\//.test(href);
    return (
      <a
        {...props}
        href={href}
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        className={clsx(className, 'font-medium text-pink-600 transition-colors hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200')}
      />
    );
  },
  ul: ({ className, ...props }) => (
    <ul {...props} className={clsx(className, 'my-4 list-disc space-y-1.5 pl-6 text-base/7 text-zinc-700 marker:text-zinc-400 dark:text-zinc-300')} />
  ),
  ol: ({ className, ...props }) => (
    <ol {...props} className={clsx(className, 'my-4 list-decimal space-y-1.5 pl-6 text-base/7 text-zinc-700 marker:text-zinc-400 dark:text-zinc-300')} />
  ),
  li: ({ className, ...props }) => (
    <li {...props} className={clsx(className, 'pl-1 [&>ul]:my-1.5 [&>ol]:my-1.5')} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote {...props} className={clsx(className, 'my-4 border-l-4 border-pink-300 pl-4 text-zinc-600 italic dark:border-pink-700 dark:text-zinc-400')} />
  ),
  code: ({ className, ...props }) => (
    <code {...props} className={clsx(className, 'rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-pink-700 dark:bg-zinc-800 dark:text-pink-300')} />
  ),
  pre: ({ className, ...props }) => (
    <pre {...props} className={clsx(className, 'my-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100 dark:bg-zinc-950 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-zinc-100')} />
  ),
  hr: ({ className, ...props }) => (
    <hr {...props} className={clsx(className, 'my-8 border-zinc-200 dark:border-zinc-800')} />
  ),
  img: ({ className, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={alt ?? ''} className={clsx(className, 'my-6 h-auto max-w-full rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-800')} />
  ),
  table: ({ className, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table {...props} className={clsx(className, 'min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-700')} />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead {...props} className={clsx(className, 'bg-zinc-50 dark:bg-zinc-800')} />
  ),
  tbody: ({ className, ...props }) => (
    <tbody {...props} className={clsx(className, 'divide-y divide-zinc-200 dark:divide-zinc-800')} />
  ),
  th: ({ className, ...props }) => (
    <th {...props} className={clsx(className, 'px-3 py-2 text-left font-semibold text-zinc-900 dark:text-zinc-100')} />
  ),
  td: ({ className, ...props }) => (
    <td {...props} className={clsx(className, 'px-3 py-2 text-zinc-700 dark:text-zinc-300')} />
  ),
  strong: ({ className, ...props }) => (
    <strong {...props} className={clsx(className, 'font-semibold text-zinc-900 dark:text-zinc-100')} />
  ),
};

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={clsx(className, 'max-w-none')}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
