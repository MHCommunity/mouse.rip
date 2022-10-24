import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserscriptsList from '../components/UserscriptsList';

export default function Userscripts() {
  return (
    <div className="bg-white">
      <Head>
        <title>MouseHunt Userscripts - mouse.rip</title>
        <meta name="description" content="MouseHunt Userscripts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header text="Userscripts" className="text-purple-700" />
        <UserscriptsList tag="all" />
      </main>
      <Footer />
    </div>
  )
}
