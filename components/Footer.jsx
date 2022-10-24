import Link from 'next/link'

export default function Footer() {
	return (
		<footer className='mx-auto mt-6 w-full max-w-container px-4 sm:px-6 lg:px-8'>
			<div className='py-10'>
				<p className='mt-3 text-center text-sm leading-6 text-slate-500'>
					<span className='text-sky-500 hover:text-sky-600 text-2xl font-extrabold tracking-tight'>
						<Link href='/'>
							mouse.rip
						</Link>
					</span>
				</p>
				<div className='mt-1 flex items-center justify-center space-x-4 text-sm font-semibold leading-6 text-slate-700'>
					<span className='text-sky-800 hover:text-sky-400'>
						<Link href='https://github.com/MHCommunity/mouse.rip'>
							GitHub
						</Link>
					</span>
					<div className='h-4 w-px bg-slate-500/20' />
					<span className='text-sky-800 hover:text-sky-400'>
						<Link href='https://discordapp.com/invite/Ya9zEdk'>
							Discord
						</Link>
					</span>
				</div>
			</div>
		</footer>
	)
}
