import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full px-4 mx-auto mt-32 max-w-container sm:px-6 lg:px-8">
      <div className="py-10 border-t border-slate-900/5">
        <p className="mt-5 text-2xl tracking-tight text-center font-extralight text-sky-800">
          <Link href="/">mouse.rip</Link>
        </p>
        <div className="flex items-center justify-center mt-2 text-sm font-light space-x-2 leading-6 text-sky-800">
          <Link href="https://github.com/MHCommunity/mouse.rip">GitHub</Link>
          <div className="w-px h-4 bg-slate-500/20"></div>
          <Link href="https://discordapp.com/invite/Ya9zEdk">Discord</Link>
        </div>
      </div>
    </footer>
  )
}
