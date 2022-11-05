import { Disclosure } from '@headlessui/react'
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import Layout from '../../components/Layout'

export default function Challenge() {
  const [hunterId, setHunterId] = useState('')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const hunterId = localStorage.getItem('hunterId')
    if (hunterId) {
      setHunterId(hunterId)
    }
  }, [])

  const submitForm = async (e) => {
    e.preventDefault()

    setLoading(true)

    localStorage.setItem('hunterId', hunterId)

    fetch(`https://api.mouse.rip/progress/${hunterId}`, { noCors: true })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false)
        setSuccess(data)
      })
  }

  return (
    <div className="bg-white">
      <Head>
        <title>Challenge Progress Tracking - mouse.rip</title>
        <meta name="description" content="Challenge Progress Tracking - mouse.rip" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout title="Challenge Progress Tracking">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="px-4 py-8 mx-auto sm:px-10">
            <form className="space-y-6" method="post" onSubmit={submitForm}>
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
                    value={hunterId}
                  />
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

            {success && (
              <div>
                <div className="p-4 my-10 bg-green-100 border border-green-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-700">Updated progress for Hunter {success.hunterId}</h3>
                      <div className="mt-2">
                        <div className="text-green-700 space-y-6 mt-5">
                          <div className="text-xl">
                            Your next letter is <strong className="uppercase">{success.nextLetter}</strong>.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mx-auto p-4">
                  <Disclosure>
                    <>
                      <div className="flex justify-evenly items-center text-sm font-medium ">
                        <Disclosure.Button>
                          <span className="inline-flex items-center rounded border border-gray-300 bg-white px-10 py-1.5 text-xs font-medium text-gray-800 shadow-sm hover:bg-gray-50">
                            View last recorded journal entries
                          </span>
                        </Disclosure.Button>
                        <Link href="https://discordapp.com/users/833815962620657706">
                          <a className="inline-flex items-center rounded border border-gray-300 bg-grey-400 px-10 py-1.5 text-xs font-medium text-gray-800 shadow-sm hover:bg-rose-50">
                            Report an issue
                          </a>
                        </Link>
                      </div>
                      <Disclosure.Panel className="mt-10">
                        <table className="min-w-full divide-y divide-gray-300 border border-gray-300 shadow-inner">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="py-3.5 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                Mouse
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Location
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {success.entries.map((entry, index) => (
                              <tr key={entry.id} className={index % 2 === 0 ? undefined : 'bg-gray-50'}>
                                <td className="whitespace-nowrap py-4 pl-4 text-sm font-medium text-gray-900 sm:pl-6">
                                  {entry.mouseName}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{entry.location}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{entry.dateFormatted}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Disclosure.Panel>
                    </>
                  </Disclosure>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </div>
  )
}
