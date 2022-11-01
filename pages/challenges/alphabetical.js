import Head from 'next/head'
import Link from 'next/link'

import ChallengeLinks from '../../components/ChallengeLinks'
import Layout from '../../components/Layout'

export default function Alphabetical() {
  return (
    <div className="bg-white">
      <Head>
        <title>Alphabetical Catching Challenge - mouse.rip</title>
        <meta name="description" content="Alphabetical Catching Challenge - details and entry" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout title="Alphabetical Catching Challenge">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
          <div className="relative px-4 sm:px-6 lg:px-8">
            <div className="mx-auto text-lg max-w-prose">
              <p className="mt-8 text-2xl text-gray-800 leading-8">You must catch a mouse for every letter of the alphabet – in order.</p>
            </div>
            <div className="mx-auto mt-6 text-gray-500 prose prose-lg prose-sky">
              <p>
                First, catch a mouse whose name begins with the letter <strong>A</strong>, then <strong>B</strong>, continuing on to <strong>Z</strong>.
              </p>
              <ChallengeLinks />

              <h2>Prizes</h2>
              <ul>
                <li>
                  <strong>250</strong> <span className="text-orange-700">SUPER|brie+</span> to the first person to complete the challenge.
                </li>
                <li>
                  <strong>50</strong> <span className="text-orange-700">SUPER|brie+</span> to the first 50 participants who complete the challenge.
                </li>
                <li>
                  <strong>10</strong> <span className="text-orange-700">SUPER|brie+</span> to all participants, regardless of completion.{' '}
                  <em className="text-xs text-gray-500">(Limited to the first 100 participants)</em>
                </li>
              </ul>

              <h2>How to play</h2>
              <ol>
                <li>
                  First,{' '}
                  <Link href="/challenges/enter">
                    <a className="no-underline text-sky-600 hover:text-sky-800">sign up for the challenge</a>
                  </Link>
                  . This will help us track your progress.
                </li>
                <li>
                  Catch a mouse whose name begins with the letter <strong>A</strong>, such as an <em>Archer Mouse</em>.
                </li>
                <li>
                  Catch a mouse whose name begins with the letter <strong>B</strong>, such as a <em>Bionic Mouse</em>.
                </li>
                <li>
                  After 5 catches (or sooner if the catches will disappear off the first page of your journal)
                  <ul>
                    <li>
                      Post a screenshot of your journal to Discord, in the{' '}
                      <Link href="/">
                        <a className="no-underline text-sky-600 hover:text-sky-800">#challenges forum post</a>
                      </Link>
                      .
                    </li>
                    <li>
                      <Link href="#">
                        <a className="no-underline text-sky-600 hover:text-sky-800">Update your progress</a>
                      </Link>{' '}
                      using the tracker.
                    </li>
                  </ul>
                </li>
                <li>Continue catching mice and posting screenshots until you have caught a mouse for each letter of the alphabet.</li>
              </ol>

              <h2>Rules</h2>
              <ul>
                <li>
                  For the letter <strong>X</strong>, you must catch an <em>extra</em> mouse. This can be any mouse that you have already caught in the challenge.
                </li>
                <li>
                  Failure to catch, failure to attract, or repeated catches does <strong>not</strong> break your current streak or reset your progress.
                </li>
                <li>
                  Catching multiple mice that start with the same letter does <strong>not</strong> break your current streak or reset your progress.
                </li>
                <li>
                  Catching any mouse that does not start with the correct letter <strong>will</strong> break your current streak and reset your progress.
                </li>
                <li>You must catch a mouse for every letter of the alphabet, in order. You cannot skip letters.</li>
              </ul>
              <p className="text-gray-500 quote">
                If you are currently on the letter <strong>H</strong> and you catch a <em>Harvester Mouse</em>, catching a second one or a <em>Harvest Harrier Mouse</em> next will not break your
                streak.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}
