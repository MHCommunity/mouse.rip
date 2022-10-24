import clsx from 'clsx'
import Link from 'next/link'
import Icon from './Icon'
import userscripts from '../data/userscripts.json'
import tags from '../data/tags.json'

export default function Userscripts({ tag = 'all' }) {
	// if the current page matches the tag, add the active class
	const isActive = (t) => (tag === t.id ? 'text-purple-800 bg-purple-300 hover:text-purple-700' : '')
	return (
		<div className='max-w-3xl px-3 mx-auto'>
			<div className='mx-auto mt-6 text-center'>
				<Link href={`/userscripts/`}>
					<a className={clsx('inline-flex items-center px-3 py-2 m-1 text-xs font-medium leading-4 text-purple-700 bg-purple-100 border border-transparent rounded-md hover:bg-purple-200', isActive({ id: 'all' }))}>
						All
					</a>
				</Link>
					{tags
					.filter((t) => t.id !== 'all')
					.filter((t) => t['show-in-nav'])
					.map((tag) => (
						<Link key={tag.id} href={`/userscripts/${tag.id}`}>
							<a className={clsx('inline-flex items-center px-3 py-2 m-1 text-xs font-medium leading-4 text-purple-700 bg-purple-100 border border-transparent rounded-md hover:bg-purple-200', isActive(tag))}>
								{tag.name}
							</a>
						</Link>
				))}
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
