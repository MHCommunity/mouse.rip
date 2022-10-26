import Head from 'next/head'
import Link from 'next/link'

import Footer from '../components/Footer'
import HeaderNew from '../components/HeaderNew'
import Icon from '../components/Icon'

export default function Challenge() {
  return (
    <div className="bg-white">
      <Head>
        <title>Lounge Challenges - mouse.rip</title>
        <meta name="description" content="Lounge Challenges - details and entry" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HeaderNew />

      <div className="px-3 bg-gray-100 py-14">
        <div className="max-w-xl mx-auto space-y-1 text-center">
          <h1 className="block pb-4 text-3xl font-bold tracking-tight text-center text-gray-700 sm:text-4xl">Lounge Challenges</h1>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div role="list" className="flex flex-col max-w-3xl gap-3">
          <Link href="/challenges/lord-board">
            <a className="bg-white border-2 rounded-lg border-slate-100 hover:ring-1 ring-sky-600 group">
              <div className="flex items-start px-6 py-4">
                <div className="mt-2 shrink-0">
                  <Icon icon="CheckCircle" className="text-sky-600 h-9 w-9 group-hover:text-sky-800" />
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    <h3 className="pt-1 mb-1 text-lg font-light text-sky-700 group-hover:text-sky-900">Lord–Master Spooky Board Challenge</h3>
                    <span className="inline-flex ml-4 items-center rounded-md border border-green-300 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Live</span>
                  </div>
                  <p className="text-sm text-gray-700">Score as many points as you can on a Lord–Master Spooky Shuffle board.</p>
                </div>
              </div>
            </a>
          </Link>

          <div className="border-2 rounded-lg bg-gray-50 border-slate-100">
            <div className="flex items-start px-6 py-4">
              <div className="mt-2 shrink-0">
                <Icon icon="Calendar" className="text-gray-300 h-9 w-9" />
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h3 className="pt-1 mb-1 text-lg font-light text-gray-400">Coming soon...</h3>
                </div>
                <p className="text-sm text-gray-400">More unique challenges coming soon.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
