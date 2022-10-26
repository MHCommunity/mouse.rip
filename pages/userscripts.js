import Head from 'next/head'

import Footer from '../components/Footer'
import Header from '../components/Header'
import HeaderNew from '../components/HeaderNew'
import UserscriptsList from '../components/UserscriptsList'

export default function Userscripts() {
  return (
    <div className="bg-white">
      <Head>
        <title>MouseHunt Userscripts - mouse.rip</title>
        <meta name="description" content="MouseHunt Userscripts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <HeaderNew />
        <Header text="Userscripts" className="text-purple-700" />
        <UserscriptsList tag="all" />
      </main>
      <Footer />
    </div>
  )
}
