import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mx-auto mt-32 w-full max-w-container px-4 sm:px-6 lg:px-8">
      <div className="border-t border-slate-900/5 py-10">
        <p className="mt-5 text-center text-2xl tracking-tight font-extralight text-sky-500">
          <Link href="/">mouse.rip</Link>
        </p>
        <div className="mt-2 flex items-center justify-center space-x-2 text-sm font-light leading-6 text-sky-600">
          <Link href="https://github.com/MHCommunity/mouse.rip">GitHub</Link>
          <div className="h-4 w-px bg-slate-500/20"></div>
          <Link href="https://discordapp.com/invite/Ya9zEdk">Discord</Link>
        </div>
      </div>
    </footer>
  )
}
