import Link from 'next/link'

export default function ChallengeLinks() {
  return (
    <div className="flex justify-center text-center no-prose space-x-4">
      <Link href="/challenges/enter">
        <a className="inline-flex p-3 text-sm font-medium text-white no-underline border transition rounded-md border-sky-600 bg-sky-500 hover:bg-sky-700 focus:outline-none focus:ring active:text-sky-500">
          Enter challenge
        </a>
      </Link>
      <Link href="/challenges/progress">
        <a className="inline-flex items-center justify-center p-3 text-sm no-underline border rounded-md border-sky-200 hover:border-sky-400 bg-sky-100  text-sky-700 hover:bg-sky-200">
          Update progress
        </a>
      </Link>
    </div>
  )
}
