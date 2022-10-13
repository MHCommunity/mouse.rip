import clsx from 'clsx'
import Link from 'next/link';

export default function UserscriptListItem({ name, description, url, icon, color, labels }) {
	let linkColor = '';
	switch (color) {
		case 'blue':
			linkColor = 'text-blue-500 hover:text-blue-800'
			break;
		case 'green':
			linkColor = 'text-green-500 hover:text-green-800'
			break;
		case 'pink':
			linkColor = 'text-pink-500 hover:text-pink-800'
			break;
		case 'red':
			linkColor = 'text-red-500 hover:text-red-800'
			break;
		case 'yellow':
			linkColor = 'text-yellow-500 hover:text-yellow-800'
			break;
		case 'purple':
			linkColor = 'text-purple-500 hover:text-purple-900'
			break;
		default:
			linkColor = 'text-pink-500 hover:text-pink-800'
			break;
	}

	labels = labels || [];

	return (
		<li className="relative flex items-start py-6 space-x-4 ">
			<div className="flex-shrink-0">
				<span className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50">
					{icon}
				</span>
			</div>
			<div className="flex-1 min-w-0 group">
				<h3 className={clsx('text-base font-medium', linkColor)}>
					<span className="rounded-sm">
						<Link href={url}>
							<a className="focus:outline-none">
								<span className="absolute inset-0" aria-hidden="true" />
								{name}
							</a>
						</Link>
					</span>
				</h3>
				<p className="text-base text-gray-500 group-hover:text-gray-800">{description}</p>
				<div className="flex mt-3 -mb-3">
					{labels.map((label) => (
						<span key={label} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-600 mr-2">
							{label}
						</span>
					))}
				</div>
			</div>
			<div className="self-center flex-shrink-0">
				<svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
				</svg>
			</div>
		</li>
	)
}
