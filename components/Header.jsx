import clsx from 'clsx'
import Link from 'next/link'
import { ArrowSmallLeftIcon } from '@heroicons/react/24/solid'

export default function Header({ title, main, className }) {
	return (
		<div className='bg-gray-100 pt-10 pb-6'>
			<h1 className='text-3xl text-center font-bold tracking-tight text-gray-700 sm:text-4xl'>
				<span className={clsx('text-sky-500 hover:text-sky-700', className)}>{title}</span> for MouseHunt
			</h1>
			<div className='mt-4 text-center'>
			{ ! main && (
					<Link href='/'>
						<a className='font-light text-sm text-sky-600 hover:text-sky-800'><span aria-hidden='true'>← </span> back to main page</a>
					</Link>
				)}
			</div>
		</div>
	)

	return (
		<div className='pb-6'>
			<nav className='bg-slate-800'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						<Link href='/'>
							<a className='flex-shrink-0'>
								<h1 className='text-3xl font-thin text-white'>mouse.rip</h1>
							</a>
						</Link>
						<div className='hidden md:block'>
							<div className='flex items-end space-x-4'>
								<Link href='/'>
									<a className='bg-slate-300 hover:bg-slate-400 text-slate-900 block px-3 py-2 rounded-md text-xs font-medium' aria-current='page'>Home</a>
								</Link>
								<Link href='https://guide.mouse.rip/'>
									<a className='text-white hover:bg-pink-500 block px-3 py-2 rounded-md text-xs font-light'>Guide</a>
								</Link>
								<Link href='/userscripts'>
									<a className='text-white hover:bg-purple-500 block px-3 py-2 rounded-md text-xs font-light'>Userscripts</a>
								</Link>
								<Link href='/tools'>
									<a className='text-white hover:bg-green-500 block px-3 py-2 rounded-md text-xs font-light'>Tools</a>
								</Link>
								<Link href='/api-docs'>
									<a className='text-white hover:bg-red-500 block px-3 py-2 rounded-md text-xs font-light'>API</a>
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className='md:hidden' id='mobile-menu'>
					<div className='space-y-1 px-2 pt-2 pb-3 sm:px-3'>
						<Link href='/'>
							<a className='bg-slate-300 hover:bg-slate-400 text-slate-900 block px-3 py-2 rounded-md text-base font-medium' aria-current='page'>Home</a>
						</Link>
						<Link href='https://guide.mouse.rip/'>
							<a className='text-white hover:bg-pink-500 block px-3 py-2 rounded-md text-base font-medium'>Guide</a>
						</Link>
						<Link href='/userscripts'>
							<a className='text-white hover:bg-purple-500 block px-3 py-2 rounded-md text-base font-medium'>Userscripts</a>
						</Link>
						<Link href='/tools'>
							<a className='text-white hover:bg-green-500 block px-3 py-2 rounded-md text-base font-medium'>Tools</a>
						</Link>
						<Link href='/api-docs'>
							<a className='text-white hover:bg-red-500 block px-3 py-2 rounded-md text-base font-medium'>API</a>
						</Link>
					</div>
				</div>
			</nav>

			<header className='bg-white shadow'>
				<div className='mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8'>

					<h1 className='text-3xl font-bold leading-tight tracking-tight text-gray-900 text-center'>
						<span className={clsx('text-sky-500', className)}>{title}</span> for MouseHunt
					</h1>
				</div>
			</header>
		</div>
	)
}
