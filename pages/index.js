import Head from 'next/head'
import Link from 'next/link'

import Header from '../components/Header'
import Footer from '../components/Footer'

import {
  ArrowSmallRightIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/solid'

export default function Home() {
  return (
    <div className="bg-white">
      <Head>
        <title>MouseHunt Guides, Tools, and Resources - mouse.rip</title>
        <meta name="description" content="MouseHunt Guides, Tools, and Resources" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-full px-4 mx-auto max-w-10xl sm:px-6 lg:px-8">
        <div className="max-w-2xl py-16 mx-auto sm:py-24">
          <Header title="Tools, Guides, and Resources" />
          <div>
            <ul role="list" className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6">

              <li className="flex col-span-1 rounded-md shadow-md">
                <Link href="https://guide.mouse.rip/">
                  <a className="flex items-center justify-between flex-1 p-3 bg-white border border-pink-400 rounded-lg hover:ring-1 ring-pink-600 group">
                    <div className="flex-1 px-4 py-2 text-md">
                      <div className="pb-3 text-xl font-medium text-pink-600 group-hover:text-pink-800">
                        Guide <ArrowTopRightOnSquareIcon className="inline w-4 h-4 ml-1 align-baseline" aria-hidden="true" />
                      </div>
                      <p className="font-light leading-6 text-gray-500">From Novice to Fabled, learn the best way to play MouseHunt.</p>
                    </div>
                  </a>
                </Link>
              </li>

              <li className="flex col-span-1 rounded-md shadow-md">
                <Link href="/userscripts">
                  <a className="flex items-center justify-between flex-1 p-3 bg-white border border-purple-400 rounded-lg hover:ring-1 ring-purple-600 group">
                    <div className="flex-1 px-4 py-2 text-md">
                      <div className="pb-3 text-xl font-medium text-purple-600 group-hover:text-purple-800">
                        Userscripts <ArrowSmallRightIcon className="inline w-4 h-4 ml-1 align-baseline" aria-hidden="true" />
                      </div>
                      <p className="font-light leading-6 text-gray-500">Customize and improve your MouseHunt experience.</p>
                    </div>
                  </a>
                </Link>
              </li>

              <li className="flex col-span-1 rounded-md shadow-md">
                <Link href="/tools">
                  <a className="flex items-center justify-between flex-1 p-3 bg-white border border-green-400 rounded-lg hover:ring-1 ring-green-600 group">
                    <div className="flex-1 px-4 py-2 text-md">
                      <div className="pb-3 text-xl font-medium text-green-700 group-hover:text-green-900">
                        Tools <ArrowSmallRightIcon className="inline w-4 h-4 ml-1 align-baseline" aria-hidden="true" />
                      </div>
                      <p className="font-light leading-6 text-gray-500">Calculate and optimize your hunts, weapon, and progresss.</p>
                    </div>
                  </a>
                </Link>
              </li>

              <li className="flex col-span-1 rounded-md shadow-md">
                <Link href="https://mhwiki.hitgrab.com/wiki/index.php/MouseHunt_Wiki">
                  <a className="flex items-center justify-between flex-1 p-3 bg-white border border-rose-400 rounded-lg hover:ring-1 ring-rose-600 group">
                    <div className="flex-1 px-4 py-2 text-md">
                      <div className="pb-3 text-xl font-medium text-rose-700 group-hover:text-rose-800">
                        Spreadsheets <ArrowSmallRightIcon className="inline w-4 h-4 ml-1 align-baseline" aria-hidden="true" />
                      </div>
                      <p className="font-light leading-6 text-gray-500">Plot, graph, calculate, and simulate with numbers!</p>
                    </div>
                  </a>
                </Link>
              </li>
              <li className="flex col-span-1 rounded-md shadow-md">
                <Link href="https://api.mouse.rip">
                  <a className="flex items-center justify-between flex-1 p-3 bg-white border border-red-400 rounded-lg hover:ring-1 ring-red-600 group">
                    <div className="flex-1 px-4 py-2 text-md">
                      <div className="pb-3 text-xl font-medium text-red-600 group-hover:text-red-800">
                        API <ArrowSmallRightIcon className="inline w-4 h-4 ml-1 align-baseline" aria-hidden="true" />
                      </div>
                      <p className="font-light leading-6 text-gray-500">An unofficial MouseHunt API for all you nerds and developers.</p>
                    </div>
                  </a>
                </Link>
              </li>

              <li className="flex col-span-1 rounded-md shadow-md">
                <Link href="https://mhwiki.hitgrab.com/wiki/index.php/MouseHunt_Wiki">
                  <a className="flex items-center justify-between flex-1 p-3 bg-white border border-cyan-400 rounded-lg hover:ring-1 ring-cyan-600 group">
                    <div className="flex-1 px-4 py-2 text-md">
                      <div className="pb-3 text-xl font-medium text-cyan-700 group-hover:text-cyan-800">
                        Miscellaneous <ArrowSmallRightIcon className="inline w-4 h-4 ml-1 align-baseline" aria-hidden="true" />
                      </div>
                      <p className="font-light leading-6 text-gray-500">All the things that don&apos;t fit nicely into a category.</p>
                    </div>
                  </a>
                </Link>
              </li>

              <li className="flex col-span-1 rounded-md shadow-md">
                <Link href="https://mhwiki.hitgrab.com/wiki/index.php/MouseHunt_Wiki">
                  <a className="flex items-center justify-between flex-1 p-3 bg-white border border-yellow-400 rounded-lg hover:ring-1 ring-yellow-600 group">
                    <div className="flex-1 px-4 py-2 text-md">
                      <div className="pb-3 text-xl font-medium text-yellow-700 group-hover:text-yellow-800">
                        Wiki
                        <ArrowTopRightOnSquareIcon className="inline w-4 h-4 ml-1 align-baseline" aria-hidden="true" />
                      </div>
                      <p className="font-light leading-6 text-gray-500">Learn about anything in the game. Past events, mice, and more.</p>
                    </div>
                  </a>
                </Link>
              </li>

              <li className="flex col-span-1 rounded-md shadow-md">
                <Link href="https://discordapp.com/invite/Ya9zEdk">
                  <a className="flex items-center justify-between flex-1 p-3 bg-white border border-blue-400 rounded-lg hover:ring-1 ring-blue-600 group">
                    <div className="flex-1 px-4 py-2 text-md">
                      <div className="pb-3 text-xl font-medium text-blue-600 group-hover:text-blue-800">
                        Discord
                        <ArrowTopRightOnSquareIcon className="inline w-4 h-4 ml-1 align-baseline" aria-hidden="true" />
                      </div>
                      <p className="font-light leading-6 text-gray-500">Join the community, enter giveaways, and hang out.</p>
                    </div>
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
