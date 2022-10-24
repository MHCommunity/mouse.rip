import Link from 'next/link'
import Icon from './Icon'
import userscripts from '../data/userscripts.json'

export default function Userscripts({ tag = 'all' }) {
	const tags = [
		{
			name: 'All',
			key: 'all',
		},
		{
			name: 'Event',
			key: 'event',
		},
		{
			name: 'Location',
			key: 'location',
		},
		{
			name: 'Maps',
			key: 'maps',
		},
		{
			name: 'Quality of Life',
			key: 'quality-of-life',
		},
		{
			name: 'Stats',
			key: 'stats',
		},
		{
			name: 'UI',
			key: 'ui',
		},
	];

	return (
		<div className='px-3 mx-auto max-w-3xl'>
			<div className='mx-auto mt-6 text-center'>
				{tags.map((tag) => (
					<Link key={tag.key} href={`/userscripts/${tag.key}`}>
						<a className='inline-flex items-center px-3 py-2 m-1 text-xs font-medium leading-4 text-purple-700 bg-purple-100 border border-transparent rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'>
							{tag.name}
						</a>
					</Link>
				))}
			</div>
			<div role='list' className='grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2'>
				{userscripts
					.filter((userscript) => {
						if (tag === 'all') {
							return true;
						}

						return userscript.tags.includes(tag);
					})
					.map((userscript) => (
						<Link key={userscript.name} href={userscript.url}>
							<a className="bg-white border-2 rounded-lg  border-slate-100 hover:ring-1 ring-purple-600 group">
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
