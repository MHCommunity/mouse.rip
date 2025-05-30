import clsx from 'clsx';
import Link from 'next/link';

export function PageLink({ href, className, children }) {
  return (
    <Link href={href} className={clsx(
      className,
      'text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-200 transition-colors',
    )}>
      {children}
    </Link>
  );
}
