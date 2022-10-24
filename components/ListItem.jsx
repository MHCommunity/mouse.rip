import clsx from 'clsx'
import Link from 'next/link';
import Icon from './Icon';

export default function ListItem({ name, description, url, author, icon, className, labels }) {
	labels = labels || [];


	return (
		<Link href={url} target='_blank' rel='noopener noreferrer'>
			<a className='group relative block rounded-lg border border-slate-200 shadow p-6 mb-6 hover:border-green-400'>
				<div className='flex'>
					<Icon icon={icon} className={clsx('h-8 w-8 mr-1', className)} />
					<div>
						<h3 className={clsx('text-xl font-light', className)}>{name}</h3>
						<p className='mt-2 flex-1 text-sm text-gray-500'>{description}</p>
					</div>
				</div>
			</a>
		</Link>
	)
}
