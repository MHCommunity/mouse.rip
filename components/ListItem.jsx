import clsx from 'clsx'
import Link from 'next/link'

import Badge from './Badge'
import Icon from './Icon'

export default function ListItem({ name, description, icon, badgeType, href, ringClassName, textClassName }) {
  return (
    <Link href={href}>
      <a className={clsx('bg-white dark:bg-zinc-900 dark:border-zinc-800 border-2 rounded-lg border-slate-100 hover:ring-1', ringClassName)}>
        <div className="flex items-start px-6 py-4">
          <div className="mt-2 shrink-0">
            <Icon icon={icon} className={clsx('h-9 w-9', textClassName)} />
          </div>
          <div className="ml-4">
            <h3 className={clsx('mb-1 text-lg font-light', textClassName)}>{name}</h3>
            {badgeType && <Badge type={badgeType} />}
            <p className="text-sm text-gray-700 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </a>
    </Link>
  )
}
