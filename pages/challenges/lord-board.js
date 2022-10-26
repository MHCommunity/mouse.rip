import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'

import Footer from '../../components/Footer'
import HeaderNew from '../../components/HeaderNew'
import Icon from '../../components/Icon'
import amplifierCharm from '../../public/images/challenges/amplifier-charm.png'
import checkmateCheese from '../../public/images/challenges/checkmate-cheese.png'
import crateOfDeliciousStones from '../../public/images/challenges/crate-of-delicious-stones.png'
import crateOfSavouryVegetables from '../../public/images/challenges/crate-of-savoury-vegetables.png'
import crateOfSeashells from '../../public/images/challenges/crate-of-seashells.png'
import dreadedCharm from '../../public/images/challenges/dreaded-charm.png'
import drillCharge from '../../public/images/challenges/drill-charge.png'
import extremeWealthCharm from '../../public/images/challenges/extreme-wealth-charm.png'
import foolsGold from '../../public/images/challenges/fools-gold.png'
import gauntletPotionTier3 from '../../public/images/challenges/gauntlet-potion-tier-3.png'
import gauntletPotionTier4 from '../../public/images/challenges/gauntlet-potion-tier-4.png'
import gildedCheese from '../../public/images/challenges/gilded-cheese.png'
import gnarledPotion from '../../public/images/challenges/gnarled-potion.png'
import goudaCheese from '../../public/images/challenges/gouda-cheese.png'
import greaterRadioactiveBluePotion from '../../public/images/challenges/greater-radioactive-blue-potion.png'
import infernoHavarti from '../../public/images/challenges/inferno-havarti.png'
import limelightCheese from '../../public/images/challenges/limelight-cheese.png'
import makiCheese from '../../public/images/challenges/maki-cheese.png'
import mastersSeal from '../../public/images/challenges/masters-seal.png'
import radioactiveBlueCheese from '../../public/images/challenges/radioactive-blue-cheese.png'
import rumbleCheese from '../../public/images/challenges/rumble-cheese.png'
import rune from '../../public/images/challenges/rune.png'
import runicCheese from '../../public/images/challenges/runic-cheese.png'
import staleCheese from '../../public/images/challenges/stale-cheese.png'
import vengefulVanillaStilton from '../../public/images/challenges/vengeful-vanilla-stilton.png'
import warScrap from '../../public/images/challenges/war-scrap.png'

const items = [
  { name: 'Amplifier Charm', points: '4', image: amplifierCharm },
  { name: 'Checkmate Cheese', points: '6', image: checkmateCheese },
  { name: 'Crate of Delicious Stones', points: '4', image: crateOfDeliciousStones },
  { name: 'Crate of Savoury Vegetables', points: '4', image: crateOfSavouryVegetables },
  { name: 'Crate of Seashells', points: '4', image: crateOfSeashells },
  { name: 'Dreaded Charm', points: '4', image: dreadedCharm },
  { name: 'Drill Charge', points: '6', image: drillCharge },
  { name: 'Extreme Wealth Charm', points: '6', image: extremeWealthCharm },
  { name: "Fool's Gold", points: '4', image: foolsGold }, // eslint-disable-line quotes
  { name: 'Gauntlet Potion Tier 3', points: '2', image: gauntletPotionTier3 },
  { name: 'Gauntlet Potion Tier 4', points: '5', image: gauntletPotionTier4 },
  { name: 'Gilded Cheese', points: '4', image: gildedCheese },
  { name: 'Gnarled Potion', points: '1', image: gnarledPotion },
  { name: 'Gouda Cheese', points: '0', image: goudaCheese },
  { name: 'Greater Radioactive Blue Potion', points: '4', image: greaterRadioactiveBluePotion },
  { name: 'Inferno Havarti', points: '0', image: infernoHavarti },
  { name: 'Limelight Cheese', points: '0', image: limelightCheese },
  { name: 'Maki Cheese', points: '5', image: makiCheese },
  { name: "Master's Seal", points: '4', image: mastersSeal }, // eslint-disable-line quotes
  { name: 'Radioactive Blue Cheese', points: '2', image: radioactiveBlueCheese },
  { name: 'Rumble Cheese', points: '5', image: rumbleCheese },
  { name: 'Rune', points: '1', image: rune },
  { name: 'Runic Cheese ', points: '0', image: runicCheese },
  { name: 'Stale Cheese', points: '2', image: staleCheese },
  { name: 'Vengeful Vanilla Stilton', points: '5', image: vengefulVanillaStilton },
  { name: 'War Scrap', points: '2', image: warScrap },
]

export default function LordBoardChallenge() {
  return (
    <div className="bg-white">
      <Head>
        <title>Lord–Master Spooky Board Challenge - mouse.rip</title>
        <meta name="description" content="Lord–Master Spooky Board Challenge - details and entry" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HeaderNew />
      <div className="px-3 bg-gray-100 py-14">
        <div className="max-w-xl mx-auto space-y-4 text-center">
          <div className="flex items-center">
            <Icon icon="CheckCircle" className="hidden text-gray-400 h-9 w-9 sm:block" />
            <h1 className="flex items-center ml-3 text-3xl font-bold tracking-tight text-center text-gray-700">Lord–Master Spooky Board Challenge</h1>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto text-lg max-w-prose">
            <p className="mt-8 text-2xl leading-8 text-gray-800">Welcome to the next installment of the Halloween Challenges, and it&apos;s time to use some of your Spooky Tickets!</p>
          </div>
          <div className="mx-auto mt-6 prose prose-lg text-gray-500 prose-sky">
            <p>
              The challenge is to do an <strong>undusted Master–Lord Spooky Shuffle Board</strong>, add up how many points you&apos;ve scored, and try to get the highest!
            </p>
            <div className="no-prose -mb-6">
              <Link href="/challenges/enter">
                <a className="text-md no-underline font-medium text-sky-600 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
                  Enter challenge now &rarr;
                </a>
              </Link>
            </div>
            <h2>Prizes</h2>
            <ul>
              <li>
                Highest score: 1{' '}
                <Link href="https://www.mousehuntgame.com/item.php?item_type=rare_map_dust_stat_item">
                  <a className="no-underline text-sky-500">Rare Map Dust</a>
                </Link>{' '}
                & 1{' '}
                <Link href="https://www.mousehuntgame.com/item.php?item_type=spooky_shuffle_upgrade_stat_item">
                  <a className="no-underline text-amber-700">Spooky Shuffle Dust</a>
                </Link>
              </li>
              <li>
                2nd highest score: 1{' '}
                <Link href="https://www.mousehuntgame.com/item.php?item_type=spooky_shuffle_upgrade_stat_item">
                  <a className="no-underline text-amber-700">Spooky Shuffle Dust</a>
                </Link>
              </li>
              <li>
                3rd highest score: 1{' '}
                <Link href="https://www.mousehuntgame.com/item.php?item_type=spooky_shuffle_upgrade_stat_item">
                  <a className="no-underline text-amber-700">Spooky Shuffle Dust</a>
                </Link>
              </li>
            </ul>
            <h3 className="mt-0 text-md">Additional Prizes</h3>
            <ul>
              <li>
                <div className="flex flex-col">
                  <span>
                    Every single participant will recieve 10{' '}
                    <Link href="https://www.mousehuntgame.com/item.php?item_type=super_brie_cheese">
                      <a className="no-underline text-sky-500">SUPER|brie+</a>
                    </Link>
                    , simply for taking part!
                  </span>
                  <em className="text-xs text-gray-500">Limited to the first 100 participants</em>
                </div>
              </li>
              <li>
                5 prizes of 25{' '}
                <Link href="https://www.mousehuntgame.com/item.php?item_type=super_brie_cheese">
                  <a className="no-underline text-sky-500">SUPER|brie+</a>
                </Link>{' '}
                will be randomly awarded to participants.
              </li>
            </ul>
            <h2>How to play</h2>
            <ol>
              <li>
                Start an <strong>undusted</strong> <strong>Master-Lord</strong> Spooky Shuffle Board.
              </li>
              <li>Flip cards and make matches like normal.</li>
              <li>When you&apos;re on the last match, take a screenshot of your board.</li>
              <li>Add up your points.</li>
              <li>
                Post your point total and your screenshot in the{' '}
                <Link href="/">
                  <a className="no-underline text-sky-500">#challenges forum post</a>
                </Link>{' '}
                on Discord.
              </li>
            </ol>
            <h2>Rules</h2>
            <ul>
              <li>
                Once you start a board, you <strong>must</strong> finish it and post your screenshot.
              </li>
              <li>You can do any number of boards, but only your highest score will count.</li>
              <li>
                If you do more than <strong>7</strong> boards, each additional board will incur a <strong>1</strong> point penalty.
              </li>
              <li>
                In the case of a tie, the winner will be randomly selected from the tied participants. All other tied participants will receive 25{' '}
                <Link href="https://www.mousehuntgame.com/item.php?item_type=super_brie_cheese">
                  <a className="no-underline text-sky-500">SUPER|brie+</a>
                </Link>
                .
              </li>
            </ul>
            <p>There&apos;s no way to enforce the rules around the number of boards you do and post, so please be honest and not cheat.</p>
          </div>
          <div className="mx-auto mt-6 prose prose-lg text-gray-500">
            <h2 id="points">Points</h2>
            <div className="mx-auto mt-3 not-prose">
              <Tab.Group>
                <Tab.List className="flex space-x-8 border-b border-gray-200">
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={clsx(
                          'no-underline border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                          selected ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        )}
                      >
                        Sort by Points
                      </button>
                    )}
                  </Tab>
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={clsx(
                          'no-underline border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                          selected ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        )}
                      >
                        Sort by Name
                      </button>
                    )}
                  </Tab>
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    {[...new Set(items.map((item) => item.points))]
                      .sort((a, b) => b - a)
                      .map((point) => (
                        <div key={point} className="mt-5">
                          <h3 className="pb-4 text-2xl font-bold tracking-tight text-gray-700 border-b">{point} points</h3>
                          <ul role="list" className="my-1">
                            {items
                              .filter((item) => item.points === point)
                              .map((item) => (
                                <li key={item.name} className="py-1">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex ml-3 align-middle">
                                      <Image src={item.image} quality="100" width={44} height={44} placeholder="blur" alt={item.name} />
                                    </div>
                                    <p className="font-light text-gray-900 text-md">{item.name}</p>
                                  </div>
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))}
                  </Tab.Panel>
                  <Tab.Panel>
                    <ul role="list" className="max-w-md mt-10 divide-y divide-gray-200">
                      {items
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((item) => (
                          <li key={item.name} className="py-1">
                            <div className="flex items-center justify-between space-x-4">
                              <div className="flex ml-3 align-middle">
                                <Image src={item.image} quality="100" width={44} height={44} placeholder="blur" alt={item.name} />
                              </div>
                              <div className="flex-1 font-light text-gray-900 text-md">{item.name}</div>
                              <div className="flex ml-3 align-middle">
                                <p className="tracking-tight text-gray-900 text-md">
                                  <span className="font-bold">{item.points}</span> points
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
