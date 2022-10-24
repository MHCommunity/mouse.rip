import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icon';

import spreadsheets from '../data/spreadsheets.json';

export default function Spreadsheets() {
  return (
    <div className="bg-white">
      <Head>
        <title>MouseHunt Spreadsheets - mouse.rip</title>
        <meta name="description" content="MouseHunt Spreadsheets" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full mx-auto">
        <Header text="Spreadsheets" className="text-cyan-600" />

        <div role="list" className="grid max-w-3xl grid-cols-1 gap-4 mx-auto mt-4 sm:grid-cols-2">
          {spreadsheets.map((sheet) => (
            <Link key={sheet.name} href={sheet.url}>
              <a className="bg-white border-2 rounded-lg border-slate-100 hover:ring-1 ring-cyan-600 group">
                <div className="flex items-start px-6 py-4">
                  <div className="mt-2 shrink-0">
                    <Icon icon={sheet.icon} className="text-cyan-600 h-9 w-9 group-hover:text-cyan-900" />
                  </div>
                  <div className="ml-4">
                    <h3 className="pt-1 mb-1 text-lg font-light text-cyan-600 group-hover:text-cyan-900">{sheet.name}</h3>
                    <p className="text-sm text-gray-700">{sheet.description}</p>
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
