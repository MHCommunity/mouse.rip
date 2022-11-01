import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const navigation = [
  { name: 'Guide', href: 'https://guide.mouse.rip/' },
  { name: 'Tools', href: '/tools' },
  { name: 'Userscripts', href: '/userscripts' },
  { name: 'Spreadsheets', href: '/spreadsheets' },
]

export default function Layout({ children, title, className = '', isMainTitle = false }) {
  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-white shadow-sm">
          {({ open }) => (
            <>
              <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex items-center flex-shrink-0">
                      <Link href="/">
                        <a className="text-2xl font-light text-sky-700 hover:text-sky-500">mouse.rip</a>
                      </Link>
                    </div>
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                      {navigation.map((item) => (
                        <Link key={item.name} href={item.href}>
                          <a className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-sky-500">{item.name}</a>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    <Link href="https://discordapp.com/invite/Ya9zEdk" rel="noreferrer" target="_blank">
                      <a className="p-2 text-gray-800 hover:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" stroke="none" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                        </svg>
                        <span className="sr-only">Discord</span>
                      </a>
                    </Link>
                    <Link href="https://github.com/MHCommunity/mouse.rip" rel="noreferrer" target="_blank">
                      <a className="p-2 text-gray-800 hover:text-gray-400">
                        <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        <span className="sr-only">GitHub</span>
                      </a>
                    </Link>
                  </div>
                  <div className="flex items-center -mr-2 sm:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 bg-white rounded-md hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
                      <span className="sr-only">Open main menu</span>
                      {open ? <XMarkIcon className="block w-6 h-6" aria-hidden="true" /> : <Bars3Icon className="block w-6 h-6" aria-hidden="true" />}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="pt-2 pb-3 space-y-1">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 border-l-4 border-transparent hover:bg-gray-50 hover:text-sky-500"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="mt-3 space-y-1">
                    <Link href="https://discordapp.com/invite/Ya9zEdk" rel="noreferrer" target="_blank">
                      <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-sky-500">Discord</a>
                    </Link>
                    <Link href="https://github.com/MHCommunity/mouse.rip" rel="noreferrer" target="_blank">
                      <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-sky-500">GitHub</a>
                    </Link>
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <div className="py-10">
          <header>
            <div className="px-4 pt-3 pb-10 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
              <h1 className="text-4xl font-bold leading-tight text-slate-800">
                <span className={className}>{title}</span>
                {isMainTitle && ' for MouseHunt'}
              </h1>
            </div>
          </header>
          <main className="min-h-[calc(65vh)]">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
      <footer className="py-10 border-t border-slate-900/5">
        <div className="text-center">
          <Link href="/">
            <a className="text-2xl font-light text-sky-700 hover:text-sky-500">mouse.rip</a>
          </Link>
          <div className="flex justify-center mt-3 flex-nowrap space-x-2">
            <Link href="https://discordapp.com/invite/Ya9zEdk">
              <a className="font-light text-md text-sky-700 hover:text-sky-500">Discord</a>
            </Link>
            <div>·</div>
            <Link href="https://github.com/MHCommunity/mouse.rip">
              <a className="font-light text-md text-sky-700 hover:text-sky-500">GitHub</a>
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
