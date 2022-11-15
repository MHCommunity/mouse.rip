import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

import Layout from '../../components/Layout'

export default function Challenge() {
  const [challengeType, setChallengeType] = useState('alphabetical')
  const [hunterId, setHunterId] = useState('')
  const [discordId, setDiscordId] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submitForm = async (e) => {
    e.preventDefault()

    setLoading(true)
    fetch('https://api.mouse.rip/challenge-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `challengeType=${challengeType}&hunterId=${hunterId}&discordId=${discordId}`,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLoading(false)
          setSuccess(data.message)
          setError('')
        } else {
          setLoading(false)
          setError(data.message)
          setSuccess('')
        }
      })
  }

  return (
    <div>
      <Head>
        <title>Challenge Entry - mouse.rip</title>
        <meta name="description" content="Challenge Entry - details and entry" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout title="Challenge Entry">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="px-4 py-8 mx-auto sm:px-10">
            <form className="space-y-6" method="post" onSubmit={submitForm}>
              <div>
                <label htmlFor="challenge-type" className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Challenge to enter</span>
                  <select
                    id="challengeType"
                    name="challengeType"
                    className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                    onChange={(e) => setChallengeType(e.target.value)}
                    value={challengeType}
                  >
                    <option value="alphabetical">Alphabetical Catching Challenge</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <div>
                <label htmlFor="hunterId" className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Hunter ID</span>
                  <input
                    type="text"
                    id="hunterId"
                    name="hunterId"
                    placeholder="94732480"
                    className="block w-full p-4 border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                    onChange={(e) => setHunterId(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div>
                <label htmlFor="discordId" className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Discord ID</span>
                  <input
                    type="text"
                    id="discordId"
                    name="discordId"
                    placeholder="Someone#1234"
                    className="block w-full p-4 border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                    onChange={(e) => setDiscordId(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="flex items-center">
                <input type="checkbox" id="agreeToRules" name="agreeToRules" className="w-4 h-4 border-gray-300 rounded text-sky-600 focus:ring-sky-500" required />
                <label htmlFor="agreeToRules" className="block ml-2 text-sm tracking-tight text-slate-500">
                  I agree to the challenge rules
                </label>
              </div>

              <button
                type="submit"
                className="flex justify-center w-full py-3 text-sm font-medium text-white border transition rounded-md border-sky-600 bg-sky-500 hover:bg-sky-700 focus:outline-none focus:ring active:text-sky-500"
              >
                Submit
                {loading && (
                  <span className="ml-2 animate-spin">
                    <ArrowPathIcon className="w-5 h-5" aria-hidden="true" />
                  </span>
                )}
              </button>
            </form>

            {error && (
              <div className="p-4 mt-4 bg-red-100 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="w-5 h-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-700">{error}</h3>
                  </div>
                </div>
              </div>
            )}
            {success && (
              <div className="p-4 mt-4 bg-green-100 border border-green-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-700">{success}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link href="https://discordapp.com/users/833815962620657706">
                <a className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-500 focus:border-sky-500 focus:ring-sky-500">Need help?</a>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}
