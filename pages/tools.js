import Head from 'next/head'
import Link from 'next/link'

import Footer from '../components/Footer'
import Header from '../components/Header'
import HeaderTopNav from '../components/HeaderTopNav'
import Icon from '../components/Icon'
import tools from '../data/tools.json'

export default function Tools() {
  return (
    <div className="bg-white">
      <Head>
        <title>MouseHunt Tools - mouse.rip</title>
        <meta name="description" content="MouseHunt Tools" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full mx-auto">
        <HeaderTopNav />
        <Header text="Tools" className="text-green-600" />

        <div role="list" className="max-w-3xl mx-auto mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link key={tool.name} href={tool.url}>
              <a className="bg-white border-2 rounded-lg border-slate-100 hover:ring-1 ring-green-600 group">
                <div className="flex items-start px-6 py-4">
                  <div className="mt-2 shrink-0">
                    <Icon icon={tool.icon} className="text-green-600 h-9 w-9 group-hover:text-green-900" />
                  </div>
                  <div className="ml-4">
                    <h3 className="pt-1 mb-1 text-lg font-light text-green-600 group-hover:text-green-900">{tool.name}</h3>
                    <p className="text-sm text-gray-700">{tool.description}</p>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
