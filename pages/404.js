import { ArrowSmallLeftIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

import Layout from '../components/Layout'

export default function Custom404() {
  return (
    <Layout>
      <div className="text-center">
        <strong className="font-light tracking-tighter text-gray-200 text-9xl">404</strong>

        <h1 className="text-2xl font-light tracking-tight text-gray-900 sm:text-4xl">Page not found, did a mouse eat it?</h1>

        <Link href="/">
          <a className="block px-5 py-3 mt-6 text-sm font-medium text-sky-600 hover:text-sky-700">
            <ArrowSmallLeftIcon className="inline w-5 h-5 -mt-1" /> back to main page
          </a>
        </Link>
      </div>
    </Layout>
  )
}
