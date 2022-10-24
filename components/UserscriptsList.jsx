import clsx from 'clsx'
import Link from 'next/link'
import Icon from './Icon'
import userscripts from '../data/userscripts.json'

export default function Userscripts({ tag }) {
	return (
		<div className='max-w-3xl px-3 mx-auto'>
			<div className='mx-auto mt-6 text-center'>
				<Link href={`/userscripts/`}>
					<a className={clsx('inline-flex items-center px-3 py-2 m-1 text-xs font-medium leading-4 text-purple-700 bg-purple-100 border border-transparent rounded-md hover:bg-purple-200', tag === 'all' ? 'bg-purple-200' : '')}>
						All
					</a>
				</Link>
				<Link href={`/userscripts/event`}>
					<a className={clsx('inline-flex items-center px-3 py-2 m-1 text-xs font-medium leading-4 text-purple-700 bg-purple-100 border border-transparent rounded-md hover:bg-purple-200', tag === 'event' ? 'bg-purple-200' : '')}>
						Event
					</a>
				</Link>
				<Link href={`/userscripts/maps`}>
					<a className={clsx('inline-flex items-center px-3 py-2 m-1 text-xs font-medium leading-4 text-purple-700 bg-purple-100 border border-transparent rounded-md hover:bg-purple-200', tag === 'maps' ? 'bg-purple-200' : '')}>
						Maps
					</a>
				</Link>
				<Link href={`/userscripts/quality-of-life`}>
					<a className={clsx('inline-flex items-center px-3 py-2 m-1 text-xs font-medium leading-4 text-purple-700 bg-purple-100 border border-transparent rounded-md hover:bg-purple-200', tag === 'quality-of-life' ? 'bg-purple-200' : '')}>
						Quality of Life
					</a>
				</Link>
				<Link href={`/userscripts/stats`}>
					<a className={clsx('inline-flex items-center px-3 py-2 m-1 text-xs font-medium leading-4 text-purple-700 bg-purple-100 border border-transparent rounded-md hover:bg-purple-200', tag === 'stats' ? 'bg-purple-200' : '')}>
						Stats
					</a>
				</Link>
				<Link href={`/userscripts/travel`}>
					<a className={clsx('inline-flex items-center px-3 py-2 m-1 text-xs font-medium leading-4 text-purple-700 bg-purple-100 border border-transparent rounded-md hover:bg-purple-200', tag === 'travel' ? 'bg-purple-200' : '')}>
						Travel
					</a>
				</Link>
				<Link href={`/userscripts/ui`}>
					<a className={clsx('inline-flex items-center px-3 py-2 m-1 text-xs font-medium leading-4 text-purple-700 bg-purple-100 border border-transparent rounded-md hover:bg-purple-200', tag === 'ui' ? 'bg-purple-200' : '')}>
						UI
					</a>
				</Link>
				<Link href={`/userscripts/utility`}>
					<a className={clsx('inline-flex items-center px-3 py-2 m-1 text-xs font-medium leading-4 text-purple-700 bg-purple-100 border border-transparent rounded-md hover:bg-purple-200', tag === 'utility' ? 'bg-purple-200' : '')}>
						Utility
					</a>
				</Link>
			</div>
			<div role='list' className='grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2'>
				{userscripts
					.filter((userscript) => {
						if (tag === 'all') return true
						return userscript.tags.includes(tag);
					})
					.map((userscript) => (
						<Link key={userscript.name} href={userscript.url}>
							<a className="bg-white border-2 rounded-lg border-slate-100 hover:ring-1 ring-purple-600 group">
								<div className="flex items-start px-6 py-4">
									<div className="mt-2 shrink-0">
										<Icon icon={userscript.icon} className='text-purple-500 h-9 w-9 group-hover:text-purple-900' />
									</div>
									<div className="ml-4">
										<h3 className='pt-1 mb-1 text-lg font-light text-purple-500 group-hover:text-purple-900'>{userscript.name}</h3>
										<p className="text-sm text-gray-700">{userscript.description}</p>
									</div>
								</div>
							</a>
						</Link>
					))}
			</div>
		</div>
	)
}
