import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full px-4 mx-auto mt-6 max-w-container sm:px-6 lg:px-8">
      <div className="py-10">
        <p className="mt-3 text-sm leading-6 text-center text-slate-500">
          <span className="text-2xl font-extrabold tracking-tight text-sky-500 hover:text-sky-600">
            <Link href="/">
							mouse.rip
            </Link>
          </span>
        </p>
        <div className="flex items-center justify-center mt-1 space-x-4 text-sm font-semibold leading-6 text-slate-700">
          <span className="text-sky-800 hover:text-sky-400">
            <Link href="https://github.com/MHCommunity/mouse.rip">
							GitHub
            </Link>
          </span>
          <div className="w-px h-4 bg-slate-500/20" />
          <span className="text-sky-800 hover:text-sky-400">
            <Link href="https://discordapp.com/invite/Ya9zEdk">
							Discord
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
