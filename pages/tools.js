import Head from 'next/head'

import Layout from '../components/Layout'
import List from '../components/List'
import tools from '../data/tools.json'

export default function Tools() {
  return (
    <div>
      <Head>
        <title>MouseHunt Tools - mouse.rip</title>
        <meta name="description" content="MouseHunt Tools" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout title="Tools" isMainTitle className="text-green-600">
        <div className="max-w-3xl px-3 mx-auto">
          <List items={tools} ringClassName="ring-green-600" textClassName="text-green-600 group-hover:text-green-900" />
        </div>
      </Layout>
    </div>
  )
}
