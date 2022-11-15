import Head from 'next/head'

import Layout from '../../components/Layout'
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
  const pageTitle = tagName === 'Ui' ? 'User Interface userscripts' : tagName ? `${tagName} userscripts` : 'serscripts'

  return (
    <div>
      <Head>
        <title>{`${pageTitle} for MouseHunt - mouse.rip`}</title>
        <meta name="description" content={`${pageTitle} for MouseHunt - mouse.rip`} />
      </Head>

      <Layout title={pageTitle} isMainTitle className="text-purple-600">
        <UserscriptsList tag={tag} />
      </Layout>
    </div>
  )
}
