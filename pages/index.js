import { ArrowSmallRightIcon, ArrowTopRightOnSquareIcon, ChatBubbleBottomCenterIcon, HandThumbUpIcon, NewspaperIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import Head from 'next/head'
import Link from 'next/link'

import Layout from '../components/Layout'

const mainNav = [
  {
    name: 'Guide',
    href: 'https://guide.mouse.rip/',
    description: 'From Novice to Fabled, learn the best way to play.',
    external: true,
    boxColor: 'border-pink-400 ring-pink-600',
    linkColor: 'text-pink-600 group-hover:text-pink-800',
  },
  {
    name: 'Userscripts',
    href: '/userscripts',
    description: 'Customize and improve your MouseHunt experience..',
    external: false,
    boxColor: 'border-purple-400 ring-purple-600',
    linkColor: 'text-purple-600 group-hover:text-purple-800',
  },
  {
    name: 'Tools',
    href: '/tools',
    description: 'Calculate and optimize your hunts, weapon, and progresss.',
    external: false,
    boxColor: 'border-green-400 ring-green-600',
    linkColor: 'text-green-600 group-hover:text-green-800',
  },
  {
    name: 'Spreadsheets',
    href: '/spreadsheets',
    description: 'Data, calculations, and more for your hunts.',
    external: false,
    boxColor: 'border-cyan-400 ring-cyan-600',
    linkColor: 'text-cyan-600 group-hover:text-cyan-800',
  },
  {
    name: 'Wiki',
    href: 'https://mhwiki.hitgrab.com/wiki/index.php/MouseHunt_Wiki',
    description: 'Learn about anything in the game. Past events, mice, and more.',
    external: true,
    boxColor: 'border-yellow-400 ring-yellow-600',
    linkColor: 'text-yellow-600 group-hover:text-yellow-800',
  },
  {
    name: 'Discord',
    href: 'https://discord.gg/mousehunt',
    description: 'Join the community, enter giveaways, and hang out.',
    external: true,
    boxColor: 'border-blue-400 ring-blue-600',
    linkColor: 'text-blue-600 group-hover:text-blue-800',
  },
]

const secondaryNav = [
  {
    name: 'About',
    href: '/about',
    icon: NewspaperIcon,
  },
  {
    name: 'Challenges',
    href: '/challenges',
    icon: HandThumbUpIcon,
  },
  {
    name: 'Contributing',
    href: '/contributing',
    icon: ChatBubbleBottomCenterIcon,
  },
]

export default function Home() {
  return (
    <div>
      <Head>
        <title>MouseHunt Guides, Tools, and Resources - mouse.rip</title>
        <meta name="description" content="MouseHunt Guides, Tools, and Resources" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout title="MouseHunt Guides, Tools, and Resources">
        <div className="max-w-3xl px-5 mx-auto md:px-0">
          <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            {mainNav.map((link) => (
              <li key={link.name} className="flex shadow-md col-span-1">
                <Link href={link.href}>
                  <a className={clsx('flex items-start flex-1 p-3 bg-white dark:bg-zinc-900 border rounded-lg hover:ring-1 group', link.boxColor)}>
                    <div className="flex-1 px-4 py-2 text-md">
                      <div className={clsx('pb-3 text-xl font-medium', link.linkColor)}>
                        {link.name}
                        {link.external && <ArrowTopRightOnSquareIcon className="inline w-4 h-4 ml-1 align-baseline" aria-hidden="true" />}
                        {!link.external && <ArrowSmallRightIcon className="inline w-4 h-4 ml-1 align-baseline" aria-hidden="true" />}
                      </div>
                      <p className="font-light text-gray-700 dark:text-gray-400 leading-6">{link.description}</p>
                    </div>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full max-w-xl mx-auto">
          <ul className="flex flex-wrap items-center justify-center mx-2 mt-10">
            {secondaryNav.map((link) => (
              <li key={link.name}>
                <Link href={link.href}>
                  <a className="flex items-center px-3 py-2 m-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 dark:bg-zinc-800 dark:border-gray-700 dark:hover:bg-zinc-700 dark:text-gray-400 transition space-x-2 leading-4 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
                    <link.icon className="w-6 h-6 text-gray-700 dark:text-gray-400" aria-hidden="true" />
                    <span>{link.name}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Layout>
    </div>
  )
}
