import Link from 'next/link'

export default function HeaderNew() {
  return (
    <header className="bg-white border-b-2 border-grey-200">
      <div className="px-4 mx-auto max-w-screen-lg">
        <div className="block p-5 sm:flex sm:items-center sm:justify-between sm:h-16 sm:p-0 ">
          <div className="block sm:flex sm:items-center sm:gap-4">
            <Link href="/">
              <a className="text-2xl tracking-tight text-center text-sky-800 font-base">mouse.rip</a>
            </Link>
            <span aria-hidden="true" className="block w-full h-px mt-3 sm:h-8 sm:w-px sm:mt-0 bg-slate-200"></span>
            <nav aria-label="Page Navigation" className="block">
              <ul className="flex justify-around mx-auto mt-4 gap-2 sm:mt-0">
                <li>
                  <Link href="https://guide.mouse.rip/">
                    <a className="p-2 -ml-2 font-light rounded-md text-md sm:text-lg sm:ml-0 hover:bg-pink-200">Guide</a>
                  </Link>
                </li>
                <li>
                  <Link href="/userscripts">
                    <a className="p-2 -ml-2 font-light rounded-md text-md sm:text-lg sm:ml-0 hover:bg-purple-200">Userscripts</a>
                  </Link>
                </li>
                <li>
                  <Link href="/tools">
                    <a className="p-2 -ml-2 font-light rounded-md text-md sm:text-lg sm:ml-0 hover:bg-green-200">Tools</a>
                  </Link>
                </li>
                <li>
                  <Link href="https://api.mouse.rip">
                    <a className="p-2 -ml-2 font-light rounded-md text-md sm:text-lg sm:ml-0 hover:bg-red-200">API</a>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <span aria-hidden="true" className="block h-px mt-3 sm:hidden bg-slate-200"></span>
          <div className="flex items-center justify-around flex-1 mt-4 gap-4 sm:mt-0 sm:justify-end">
            <div className="flex gap-4">
              <Link href="https://discordapp.com/invite/Ya9zEdk" rel="noreferrer" target="_blank">
                <a className="flex items-center px-1 py-2 rounded-md hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" stroke="none" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  <span className="ml-2 sm:hidden">Discord</span>
                </a>
              </Link>
              <Link href="https://github.com/MHCommunity/mouse.rip" rel="noreferrer" target="_blank">
                <a className="flex items-center px-1 py-2 rounded-md hover:bg-gray-100">
                  <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span className="ml-2 sm:hidden">GitHub</span>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
