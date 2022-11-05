import clsx from 'clsx'
import Link from 'next/link'

import ListItem from '../components/ListItem'
import userscripts from '../data/userscripts.json'

const tags = [
  { name: 'All', href: '/userscripts' },
  { name: 'Event', href: '/userscripts/event' },
  { name: 'Maps', href: '/userscripts/maps' },
  { name: 'Quality of Life', href: '/userscripts/quality-of-life' },
  { name: 'Stats', href: '/userscripts/stats' },
  { name: 'Travel', href: '/userscripts/travel' },
  { name: 'UI', href: '/userscripts/ui' },
  { name: 'Utility', href: '/userscripts/utility' },
]

export default function Userscripts({ tag }) {
  return (
    <div className="max-w-3xl px-3 mx-auto">
      <div className="flex flex-wrap justify-center mx-auto mt-6 text-center">
        {tags.map((tagItem) => (
          <Link key={tagItem.name} href={tagItem.href}>
            <a
              className={clsx(
                tagItem.name === tag ? 'bg-purple-200' : '',
                'inline-flex items-center px-3 py-2 m-1 text-xs font-medium leading-4 text-purple-800 bg-purple-100 border border-transparent rounded-md hover:bg-purple-200'
              )}
            >
              {tagItem.name}
            </a>
          </Link>
        ))}
      </div>
      <div role="list" className="mt-6 grid space-y-5">
        {userscripts
          .filter((userscript) => {
            if (tag === 'all') return true
            return userscript.tags.includes(tag)
          })
          .map((userscript) => (
            <ListItem
              key={userscript.name}
              name={userscript.name}
              description={userscript.description}
              icon={userscript.icon}
              href={userscript.url}
              ringClassName="ring-purple-600"
              textClassName="text-purple-600 group-hover:text-purple-900"
            />
          ))}
      </div>
    </div>
  )
}
