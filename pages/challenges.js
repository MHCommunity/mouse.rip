import Head from 'next/head'

import ChallengeLinks from '../components/ChallengeLinks'
import Layout from '../components/Layout'
import List from '../components/List'
import ListItemComingSoon from '../components/ListItemComingSoon'

const challenges = [
  {
    name: 'Alphabetical Catching Challenge',
    description: 'Catch a mouse whose name starts with each letter of the alphabet.',
    icon: 'Trophy',
    badgeType: 'upcoming',
    url: '/challenges/alphabetical',
  },
]
export default function Challenge() {
  return (
    <div>
      <Head>
        <title>Discord Challenges - mouse.rip</title>
        <meta name="description" content="MouseHunt #mh-lounge Discord Challenges - Details and entry form" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout title="Discord Challenges">
        <div className="max-w-3xl px-3 mx-auto">
          <div className="pb-6">
            <ChallengeLinks />
          </div>

          <List items={challenges} ringClassName="ring-sky-600" textClassName="text-sky-600 group-hover:text-sky-900" />
          <ListItemComingSoon text="More challenges coming soon." />
        </div>
      </Layout>
    </div>
  )
}
