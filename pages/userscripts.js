import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ListItem from '../components/ListItem'
import BackToHome from '../components/BackToHome'

import {
	BeakerIcon,
  CakeIcon,
	HeartIcon,
  GlobeAmericasIcon,
  SparklesIcon,
  LinkIcon,
  TrophyIcon,
  MapIcon
} from '@heroicons/react/24/outline'


const userscripts = [
	{
		name: 'Minluck & Catch Rate Estimate',
		description: 'View the minluck and catch rate estimate, right on the camp page.',
		url: 'https://greasyfork.org/en/scripts/449334-mousehunt-minluck-catch-rate-estimate',
    author: 'bradp',
    tags: ['hunting', 'catch rate', 'minluck'],
		icon: <SparklesIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
	},
	{
		name: 'Gift Buttons',
		description: 'Add buttons to easily accept and return all daily gifts.',
		url: 'https://greasyfork.org/en/scripts/449489-mousehunt-gift-buttons',
    author: 'bradp',
    tags: ['gifts'],
		icon: <CakeIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
	},
  {
    name: 'Item Links',
    description: 'Add links to the MouseHunt wiki, MHCT looter, MHDB, and Markethunt for items.',
    url: 'https://greasyfork.org/en/scripts/445920-mousehunt-item-links',
    author: 'bradp',
    tags: ['utility', 'items'],
    icon: <LinkIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
  },
  {
    name: 'Markethunt',
    description: 'Adds a price chart and Markethunt integration to the MH marketplace screen.',
    url: 'https://greasyfork.org/en/scripts/441382-markethunt-plugin-for-mousehunt',
    tags: ['items', 'marketplace'],
    icon: <BeakerIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
  },
  {
    name: 'No Sidebar',
    description: 'Hides the sidebar.',
    url: 'https://greasyfork.org/en/scripts/449491-mousehunt-no-sidebar',
    author: 'bradp',
    tags: ['utility', 'ui'],
    icon: <BeakerIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
  },
  {
    name: 'No Share Buttons',
    description: 'Remove the "Share" buttons that prompt you to share on Facebook.',
    url: 'https://greasyfork.org/en/scripts/452434-mousehunt-no-share-button',
    author: 'bradp',
    tags: ['utility', 'ui'],
    icon: <BeakerIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
  },
  {
    name: 'Minluck & CRE tool',
    description: 'Shows hunt statistics on the camp page',
    url: 'https://greasyfork.org/en/scripts/447193-mh-minluck-cre-tool-v2-0-new',
    author: 'Chromatical',
    tags: ['stats', 'hunting'],
    icon: <BeakerIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
  },
  {
    name: 'Travel Tweaks',
    description: 'Makes the travel page a bit better.',
    url: 'https://greasyfork.org/en/scripts/452232-mousehunt-travel-tweaks',
    author: 'bradp',
    tags: ['travel'],
    icon: <MapIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
  },
  {
    name: 'QoL Utilities',
    description: 'Miscellaneous utilities to turbo-charge your MH experience',
    url: 'https://greasyfork.org/en/scripts/405334-mousehunt-qol-utilities',
    author: 'tsitu',
    tags: ['quality of life', 'utility'],
    icon: <BeakerIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
  },
  {
    name: 'Floating Islands HUD Enhancer',
    description: 'See more thing on your floating islands HUD!',
    url: 'https://greasyfork.org/en/scripts/419909-mh-floating-islands-hud-enhancer',
    author: 'Warden Slayer',
    tags: ['location', 'floating islands'],
    icon: <MapIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
  },
  {
    name: 'Valour Rift HUD Enhancer',
    description: 'Changes the text that appears in the Valour Rift hud tooltips to give you the info you actually want to see',
    url: 'https://greasyfork.org/en/scripts/392742-mh-valour-rift-hud-enhancer',
    author: 'Warden Slayer',
    tags: ['location', 'valour rift'],
    icon: <MapIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
  },
  {
    name: 'M400 Hunting Helper',
    description: 'Adds the ability to one click travel to the next M400 assigment location',
    url: 'https://greasyfork.org/en/scripts/429044-mh-m400-hunting-helper',
    author: 'Warden Slayer',
    tags: ['quality of life'],
    icon: <MapIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
  },
  {
    name: 'Wisdom Stats',
    description: 'Displays your wisdom stats in the HUD',
    url: 'https://greasyfork.org/en/scripts/381219-mousehunt-wisdom-stats',
    author: 'Warden Slayer',
    tags: ['stats'],
    icon: <TrophyIcon className="h-6 w-6 text-purple-800" aria-hidden="true" />,
  },
  {
    name: 'Lucky Golden Shield Duration Indicator & Warning',
    description: 'Directly show LGS duration remaining and warns when it\'s near expiry',
    url: 'https://greasyfork.org/en/scripts/410966-mousehunt-lucky-golden-shield-duration-indicator-warning',
    author: 'FabulousCupcake',
    tags: ['quality of life'],
    icon: '',
  },
  {
    name: 'Favorite Setups',
    description: 'Unlimited custom favorite trap setups!',
    url: 'https://greasyfork.org/en/scripts/388403-mousehunt-favorite-setups',
    author: 'tsitu',
    tags: ['quality of life'],
    icon: '',
  },
  {
    name: 'MH Timers+',
    description: 'Handy script to keep track of the various MH location timers',
    url: 'https://greasyfork.org/en/scripts/388058-mh-timers',
    author: 'Warden Slayer',
    tags: ['utility'],
    icon: '',
  },
  {
    name: 'Mapping Helper',
    description: 'Map interface improvements (invite via Hunter ID, direct send SB+, TEM-based available uncaught map mice)',
    url: 'https://greasyfork.org/en/scripts/384275-mousehunt-mapping-helper',
    author: 'tsitu',
    tags: ['quality of life'],
    icon: '',
  },
  {
    name: 'MouseHunt - Location Catch Stats',
    description: 'Shows caught and uncaught mouse breeds for every location',
    url: 'https://greasyfork.org/en/scripts/381438-mousehunt-location-catch-stats',
    author: 'tsitu',
    tags: ['stats'],
    icon: '',
  },
  {
    name: 'Profile+',
    description: 'Community requested features for the tabs on your MH profile.',
    url: 'https://greasyfork.org/en/scripts/381389-mh-profile',
    author: 'Warden Slayer',
    tags: ['quality of life'],
    icon: '',
  },
  {
    name: 'Marketplace UI Tweaks',
    description: 'Adds useful features and tweaks to the Marketplace rework',
    url: 'https://greasyfork.org/en/scripts/378990-mousehunt-marketplace-ui-tweaks',
    author: 'tsitu',
    tags: ['quality of life'],
    icon: '',
  },
  {
    name: 'TEM Catch Stats',
    description: 'Adds catch/crown statistics next to mouse names on the TEM',
    url: 'https://greasyfork.org/en/scripts/376770-mousehunt-tem-catch-stats',
    author: 'tsitu',
    tags: ['stats'],
    icon: '',
  },
  {
    name: 'Tournament Time Helper',
    description: 'Automatically converts "Begins in:" to your local time as well as adding the end time for tournaments.',
    url: 'https://greasyfork.org/en/scripts/37146-mousehunt-tournament-time-helper',
    author: 'Jia Hao',
    tags: [],
    icon: '',
  },
  {
    name: 'Mouse Links',
    description: '',
    url: 'https://greasyfork.org/en/scripts/449332-mousehunt-mouse-links',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'Better Lucky Catch Icon',
    description: '',
    url: 'https://greasyfork.org/en/scripts/449493-mousehunt-better-lucky-catch-icon',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'Metric',
    description: '',
    url: 'https://greasyfork.org/en/scripts/449840-mousehunt-metric',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'mousehunt-display-converted-charms-thumbnail',
    description: '',
    url: 'https://greasyfork.org/en/scripts/373963-mousehunt-display-converted-charms-thumbnail',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'mousehunt-open-all-but-one-kits-spring-eggs',
    description: '',
    url: 'https://greasyfork.org/en/scripts/382479-mousehunt-open-all-but-one-kits-spring-eggs',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'send-supplies-search-ba',
    description: '',
    url: 'https://greasyfork.org/en/scripts/396714-mousehunt-send-supplies-search-bar',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'region-quick-travel',
    description: '',
    url: 'https://greasyfork.org/en/scripts/439343-mh-region-quick-travel',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'flrt-tool',
    description: '',
    url: 'https://greasyfork.org/en/scripts/452655-flrt-tool',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'enhanced-search-beta',
    description: '',
    url: 'https://greasyfork.org/en/scripts/446436-mousehunt-enhanced-search-beta',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'consolidated-map-colour-coder',
    description: '',
    url: 'https://greasyfork.org/en/scripts/428959-mh-consolidated-map-colour-coder',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'map-crown-display',
    description: '',
    url: 'https://greasyfork.org/en/scripts/427193-mh-map-crown-display',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'censor-journal-names',
    description: '',
    url: 'https://greasyfork.org/en/scripts/445553-mh-censor-journal-names',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'journal-screenshot-butt',
    description: '',
    url: 'https://greasyfork.org/en/scripts/451716-mh-journal-screenshot-button',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'hyperspeed-travel',
    description: '',
    url: 'https://greasyfork.org/en/scripts/448542-mousehunt-hyperspeed-travel',
    author: '',
    tags: [],
    icon: ''
  },
  {
    name: 'bwrift-hud-enhancer-items-charms',
    description: '',
    url: 'https://greasyfork.org/en/scripts/428101-mh-bwrift-hud-enhancer-items-charms',
    author: '',
    tags: ['location'],
    icon: '',
  },
  {
    name: 'living-garden-hud-enhancer',
    description: '',
    url: 'https://greasyfork.org/en/scripts/407059-mh-living-garden-hud-enhancer',
    author: '',
    tags: ['location'],
    icon: '',
  },
  {
    name: 'iceberg-progress-info',
    description: '',
    url: 'https://greasyfork.org/en/scripts/399553-mh-iceberg-progress-info',
    author: '',
    tags: ['location'],
    icon: '',
  },
  {
    name: 'valour-rift-simulator',
    description: '',
    url: 'https://greasyfork.org/en/scripts/393436-mousehunt-valour-rift-simulator',
    author: '',
    tags: ['location'],
    icon: '',
  },
  {
    name: 'warpath-wave-calculator',
    description: '',
    url: 'https://greasyfork.org/en/scripts/390221-mh-warpath-wave-calculator',
    author: '',
    tags: ['location'],
    icon: '',
  },
  {
    name: 'deep-run-assistant',
    description: '',
    url: 'https://greasyfork.org/en/scripts/380861-mousehunt-deep-run-assistant',
    author: '',
    tags: ['location'],
    icon: '',
  },
  {
    name: 'sum-up-living-garden-essences',
    description: '',
    url: 'https://greasyfork.org/en/scripts/373991-mousehunt-sum-up-living-garden-essences',
    author: '',
    tags: ['location'],
    icon: '',
  },
  {
    name: 'estimate-pond-drops',
    description: '',
    url: 'https://greasyfork.org/en/scripts/449794-mh-estimate-pond-drops',
    author: '',
    tags: ['location'],
    icon: '',
  },
  {
    name: 'eggsweeper-helper',
    description: '',
    url: 'https://greasyfork.org/en/scripts/381797-mousehunt-eggsweeper-helper',
    author: '',
    tags: ['event'],
    icon: '',
  },
  {
    name: 'snowball-showdown-helper',
    description: '',
    url: 'https://greasyfork.org/en/scripts/375817-mousehunt-snowball-showdown-helper',
    author: '',
    tags: ['event'],
    icon: '',
  },
  {
    name: 'spooky-shuffle-tracker',
    description: '',
    url: 'https://greasyfork.org/en/scripts/34761-mousehunt-spooky-shuffle-tracker',
    author: '',
    tags: ['event'],
    icon: '',
  }
];

export default function Userscripts() {
  return (
    <div className="bg-white">
      <Head>
        <title>MouseHunt Userscripts - mouse.rip</title>
        <meta name="description" content="MouseHunt Userscripts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-auto w-full max-w-10xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl py-16 sm:py-24">
          <Header title="Userscripts" />
          <BackToHome />
          <div className="max-w-xl mx-auto">
            <ul role="list" className="mt-4 divide-y divide-gray-200">
              {userscripts.map((userscript) => (
                  <ListItem
                    key={userscript.name}
                    name={userscript.name}
                    description={userscript.description}
                    url={userscript.url}
                    icon={userscript.icon}
                    color="purple"
                    labels={userscript.tags}
                  />
                ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
