import Link from 'next/link';

export function PageLink({ href, children }) {
  return (
    <Link href={href} className="text-sky-600 dark:text-sky-200 hover:text-sky-700 dark:hover:text-sky-300">
      {children}
    </Link>
  );
};
