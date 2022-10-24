import Link from 'next/link';
import { ArrowSmallLeftIcon } from '@heroicons/react/24/solid';

export default function Custom404() {
  return (
    <div class="grid h-screen place-content-center">
      <div class="text-center">
        <strong class="text-9xl font-light tracking-tighter text-gray-200">
          404
        </strong>

        <h1 class="text-2xl font-light tracking-tight text-gray-900 sm:text-4xl">
          Page not found, did a mouse eat it?
        </h1>

        <Link href="/">
          <a class="mt-6 block text-sky-600 px-5 py-3 text-sm font-medium hover:text-sky-700">
            <ArrowSmallLeftIcon className="inline w-6 h-6 -mt-1" />  back to main page
          </a>
        </Link>
      </div>
    </div>
  )
}
