import Head from 'next/head'

import Layout from '../components/Layout'
import List from '../components/List'
import spreadsheets from '../data/spreadsheets.json'

export default function Spreadsheets() {
  return (
    <div>
      <Head>
        <title>MouseHunt Spreadsheets - mouse.rip</title>
        <meta name="description" content="MouseHunt Spreadsheets" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout title="Spreadsheets" isMainTitle className="text-cyan-600">
        <div className="max-w-3xl px-3 mx-auto">
          <List items={spreadsheets} ringClassName="ring-cyan-600" textClassName="text-cyan-600 group-hover:text-cyan-900" />
        </div>
      </Layout>
    </div>
  )
}
