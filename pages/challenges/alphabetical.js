import Head from 'next/head'
import Link from 'next/link'

import ChallengeLinks from '../../components/ChallengeLinks'
import Layout from '../../components/Layout'

export default function Alphabetical() {
  return (
    <div>
      <Head>
        <title>Alphabetical Catching Challenge - mouse.rip</title>
        <meta name="description" content="Alphabetical Catching Challenge - details and entry" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout title="Alphabetical Catching Challenge">
        <div className="sm:mx-auto sm:w-full">
          <div className="relative px-4 sm:px-6 lg:px-8">
            <p className="text-2xl text-center text-gray-800 dark:text-gray-500 leading-8">You must catch a mouse for every letter of the alphabet – in order.</p>

            <div className="mt-6">
              <ChallengeLinks />
            </div>

            <div className="mx-auto mt-6 text-gray-500 dark:text-gray-300 prose prose-lg prose-sky">
              <h2 className="dark:text-white">Summary</h2>
              <p>
                In this challenge, you&apos;ll be catching at least 26 mice across the Kingdown, one for each letter of the alphabet! Even though it is a race, if you can finish the challenge,
                you&apos;ll win a prize.
              </p>
              <p>
                First, catch a mouse whose name begins with the letter <strong className="dark:text-white">A</strong>, then <strong className="dark:text-white">B</strong>, and continue on until{' '}
                <strong className="dark:text-white">Z</strong>.
              </p>

              <h2 className="dark:text-white">Prizes</h2>
              <ul>
                <li>
                  <strong className="dark:text-white">250</strong> <span className="text-orange-700">SUPER|brie+</span> to the first person to complete a full streak.
                </li>
                <li>
                  <strong className="dark:text-white">100</strong> <span className="text-orange-700">SUPER|brie+</span> to the next 10 participants who complete a full streak.
                </li>
                <li>
                  <strong className="dark:text-white">10</strong> <span className="text-orange-700">SUPER|brie+</span> to all participants, regardless of completion.{' '}
                  <em className="text-xs text-gray-500 dark:text-gray-300">(Limited to the first 100 participants)</em>
                </li>
              </ul>

              <h2 className="dark:text-white">How to play</h2>
              <ol>
                <li>
                  First,{' '}
                  <Link href="/challenges/enter">
                    <a className="no-underline text-sky-600 hover:text-sky-800">sign up for the challenge</a>
                  </Link>
                  . This will help us track your progress.
                </li>
                <li>
                  Catch a mouse whose name begins with the letter <strong className="dark:text-white">A</strong>, such as an <em>Archer Mouse</em>.
                </li>
                <li>
                  Catch a mouse whose name begins with the letter <strong className="dark:text-white">B</strong>, such as a <em>Bionic Mouse</em>.
                </li>
                <li>
                  After 5 catches (or sooner if the catches will disappear off the first page of your journal)
                  <ul>
                    <li>
                      Post a screenshot of your journal to the{' '}
                      <Link href="/">
                        <a className="no-underline text-sky-600 hover:text-sky-800">#challenges forum post</a>
                      </Link>
                      .
                    </li>
                    <li>
                      <Link href="/challenges/progress">
                        <a className="no-underline text-sky-600 hover:text-sky-800">Update your progress</a>
                      </Link>{' '}
                      using the tracker.
                    </li>
                  </ul>
                </li>
                <li>Continue catching mice and posting screenshots until you have caught a mouse for each letter of the alphabet.</li>
              </ol>

              <h3>Catching mice</h3>
              <p>
                You can hunt in any location you want, using any bait or trap. Most letters have a large variety of mice to choose from, so try to plan out the next couple of letters you need to
                catch. <Link href="https://mhct.win">MHCT</Link> can help you look up attraction rates for mice to figure out what&apos;s easiest.
              </p>

              <h3>Pausing your streak</h3>
              <p>
                It will take at least 26 hunts to finish your streak, so you probably will hit a point where you need to sleep or take a break and don&apos;t want to lose your progress. Simply travel
                to <strong className="dark:text-white">Meadow</strong> and hunt there. All hunts there will be excluded from the challenge. Feel free to hunt in Meadow as much as you want, there is no
                penalty for doing so.
              </p>

              <h3>Tracking your progress</h3>
              <p>
                The{' '}
                <Link href="/challenges/progress">
                  <a className="no-underline text-sky-600 hover:text-sky-800">progress tracker</a>
                </Link>{' '}
                will keep track of your current streak. The progress tracker will automatically update every 30 minutes.
              </p>

              <h2 className="dark:text-white">Rules</h2>
              <ul>
                <li>
                  For the letter <strong className="dark:text-white">X</strong>, you must catch an <em>extra</em> <strong className="dark:text-white">C</strong> mouse that you didn&apos;t use.
                </li>
                <li>
                  Failure to catch or failure to attract will <strong className="dark:text-white">not</strong> break your current streak.
                </li>
                <li>
                  Catching any mouse that does not start with the correct letter <strong className="dark:text-white">ends</strong> your streak.
                </li>
                <li>You must go in alphabetical order and you can&apos;t skip letters.</li>
                <li>
                  Any hunts in <strong className="dark:text-white">Meadow</strong> will be excluded from the challenge.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}
