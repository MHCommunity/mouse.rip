import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import Head from 'next/head'
import Layout from '../components/Layout'
import mice from '../data/mice.json';

export default function FindMouse() {
  const [filter, setFilter] = useState('');
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false); // eslint-disable-line no-unused-vars
  const [mouseData, setMouseData] = useState([]);

  useEffect(() => {
    const handleKeyDown = (nativeEvent) => {
      if (nativeEvent.defaultPrevented) {
        return;
      }

      if (nativeEvent.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current.blur();
        return;
      }

      const matchMainShortcut = (nativeEvent.ctrlKey || nativeEvent.metaKey) && nativeEvent.key === 'k';
      const matchNonkeyboardNode = ['INPUT', 'SELECT', 'TEXTAREA'].indexOf(document.activeElement.tagName) === -1 && !document.activeElement.isContentEditable;

      if (matchMainShortcut && matchNonkeyboardNode) {
        nativeEvent.preventDefault();
        inputRef.current.focus();
      }
    };

    inputRef.current.focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function closeModal() {
    setIsOpen(false);
  }

  const openModal = async (e, mouse) => {
    const res = await fetch(`https://api.mouse.rip/mhct/${mouse.mhct_id}`);
    const data = await res.json();

    let uniqueId = 0;
    data.forEach((attraction) => {
      attraction.id = uniqueId;
      uniqueId += 1;
    });

    data.name = mouse.name;

    setMouseData(data);
    setIsOpen(true);
  };

  return (
    <div>
      <Head>
        <title> - mouse.rip</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout title="Mice">
        <div className="max-w-3xl px-3 mx-auto">
          <div className="pb-6">
            <div>
              <label htmlFor="search" className="sr-only">
                Find a mouse
              </label>
              <div className="relative flex items-center mt-2 mb-10">
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="block w-full py-3 text-gray-900 border-0 rounded-md pr-14 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Search for a mouse…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  ref={inputRef}
                />
                <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                  <kbd className="inline-flex items-center px-1 font-sans text-sm text-gray-400 border border-gray-200 rounded">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>
            <div>
              <ul role="list" className="divide-y divide-slate-200">
                {mice.filter((mouse) => mouse.name.toLowerCase().includes(filter.toLowerCase())).map((mouse) => (
                  <li key={mouse.name} className="even:bg-slate-100" onClick={(e) => openModal(e, mouse)}>
                    <div className="px-2 py-2 sm:px-3">
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <div className="text-lg font-medium text-slate-800 truncate">
                          {mouse.name}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Transition appear show={isOpen} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0"
              onClose={closeModal}
            >
              <div className="flex items-center justify-center min-h-screen">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
                </Transition.Child>
                <Transition.Child
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <div className="relative w-full max-w-xl px-4 py-6 mx-auto overflow-hidden bg-white rounded shadow-xl">
                    <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-gray-900 text-center">
                      {mouseData.name}
                    </Dialog.Title>
                    <div className="mt-2">
                      {mouseData.map((attraction) => (
                        <div key={attraction.id} className="grid grid-cols-3 gap-4 even:bg-slate-100 p-2 text-md font-light text-left m-2 items-center">
                          <div>
                            <div>
                              {attraction.location}
                            </div>
                            {attraction.stage && <div className="text-xs">{attraction.stage}</div>}
                          </div>
                          <div className="text-center">
                            {attraction.cheese}
                          </div>
                          <div>
                            <div className="text-md text-right font-mono">
                              {attraction.rate / 100}%
                            </div>
                            <div className="text-xs text-right">
                              {attraction.total_hunts}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 text-sm text-red-900 bg-red-100 border border-transparent rounded-md hover:bg-red-200 duration-300"
                        onClick={closeModal}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>
        </div>
      </Layout>
    </div>
  )
}
// lookupMouse(e, mouse.mhct_id)}>
