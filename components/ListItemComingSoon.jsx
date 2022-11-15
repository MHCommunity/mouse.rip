import { CalendarIcon } from '@heroicons/react/24/outline'

export default function ListItem({ text }) {
  return (
    <div className="mt-6 border-2 rounded-lg bg-gray-50 dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800">
      <div className="flex items-start px-6 py-4">
        <div className="mt-2 shrink-0">
          <CalendarIcon className="text-gray-300 h-9 w-9" aria-hidden="true" />
        </div>
        <div className="ml-4">
          <div className="flex items-center">
            <h3 className="pt-1 mb-1 text-lg font-light text-gray-400">Coming soon...</h3>
          </div>
          <p className="text-sm text-gray-400">{text}</p>
        </div>
      </div>
    </div>
  )
}
