import Head from 'next/head'

import Footer from '../../components/Footer'
import Header from '../../components/Header'
import HeaderTopNav from '../../components/HeaderTopNav'
import UserscriptsList from '../../components/UserscriptsList'
import userscripts from '../../data/userscripts.json'

export async function getStaticProps({ params }) {
  return {
    props: {
      tag: params.tag,
    },
  }
}

export async function getStaticPaths() {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    return {
      paths: [],
      fallback: 'blocking',
    }
  }

  const tags = userscripts.reduce((acc, script) => {
    script.tags.forEach((tag) => {
      if (!acc.includes(tag)) {
        acc.push(tag)
      }
    })
    return acc
  }, [])

  const paths = tags.map((tag) => ({
    params: { tag: tag },
  }))

  return {
    paths,
    fallback: true,
  }
}

export default function Userscripts({ tag = 'all' }) {
  const tagName = tag.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  const pageTitle = tagName === 'Ui' ? 'User Interface Userscripts' : tagName ? `${tagName} userscripts` : 'Userscripts'

  return (
    <div className="bg-white">
      <Head>
        <title>{`${pageTitle} for MouseHunt - mouse.rip`}</title>
        <meta name="description" content={`${pageTitle} for MouseHunt - mouse.rip`} />
      </Head>

      <main>
        <HeaderTopNav />
        <Header text={pageTitle} className="text-purple-700" />
        <UserscriptsList tag={tag} />
      </main>
      <Footer />
    </div>
  )
}
