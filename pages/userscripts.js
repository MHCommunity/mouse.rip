import Head from 'next/head'

import Layout from '../components/Layout'
import UserscriptsList from '../components/UserscriptsList'

export default function Userscripts() {
  return (
    <div className="bg-white">
      <Head>
        <title>MouseHunt Userscripts - mouse.rip</title>
        <meta name="description" content="MouseHunt Userscripts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout title="Userscripts" isMainTitle className="text-purple-600">
        <UserscriptsList tag="all" />
      </Layout>
    </div>
  )
}
