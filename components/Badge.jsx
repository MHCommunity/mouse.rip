import clsx from 'clsx'

export default function Badge({ type = 'live', text = '', className = '' }) {
  if ('live' === type) {
    return <span className={clsx('inline-flex ml-4 items-center rounded-md border border-green-300 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800', className)}>Live</span>
  } else if ('upcoming' === type) {
    return <span className={clsx('inline-flex ml-4 items-center rounded-md border border-blue-300 bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800', className)}>Upcoming</span>
  } else {
    return <span className={clsx('inline-flex ml-4 items-center rounded-md border border-blue-300 bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800', className)}>{text}</span>
  }
}
