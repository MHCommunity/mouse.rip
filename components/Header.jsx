import Link from 'next/link';

export default function Header({ text, main, className }) {
  return (
    <div className="pt-10 pb-6 bg-gray-100">
      <h1 className="text-3xl font-bold tracking-tight text-center text-gray-700 sm:text-4xl">
        <span className={className}>{text}</span> for MouseHunt
      </h1>
      <div className="mt-4 text-center">
        { ! main && (
          <Link href="/">
            <a className="text-sm font-light text-sky-600 hover:text-sky-800"><span aria-hidden="true">← </span> back to main page</a>
          </Link>
        )}
      </div>
    </div>
  );
}
