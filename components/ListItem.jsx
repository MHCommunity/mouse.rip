import clsx from 'clsx';
import Link from 'next/link';
import Icon from './Icon';

export default function ListItem({ name, description, url, icon, className }) {
  return (
    <Link href={url} target="_blank" rel="noopener noreferrer">
      <a className="relative block p-6 mb-6 border rounded-lg shadow group border-slate-200 hover:border-green-400">
        <div className="flex">
          <Icon icon={icon} className={clsx('h-8 w-8 mr-1', className)} />
          <div>
            <h3 className={clsx('text-xl font-light', className)}>{name}</h3>
            <p className="flex-1 mt-2 text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </a>
    </Link>
  )
}
