import React, { useState } from 'react';
import Head from 'next/head'

import Layout from '../components/Layout'
import ColorScaleBadge from '../components/ColorScaleBadge';

import minlucks from '../data/minlucks.json'

const minluckTypes = [
  'Arcane',
  'Draconic',
  'Forgotten',
  'Hydro',
  'Physical',
  'Shadow',
  'Tactical',
  'Law',
  'Rift',
];

/* combine the types for minlucks with the same values */
const flattenMinLucksByValue = (minluck) => {
  const minluckTypesByValue = minluckTypes.filter((type) => minluck[type] !== '∞');
  const minluckTypesByValueMap = {};
  minluckTypesByValue.forEach((type) => {
    if (minluckTypesByValueMap[minluck[type]]) {
      minluckTypesByValueMap[minluck[type]].push(type);
    } else {
      minluckTypesByValueMap[minluck[type]] = [type];
    }
  });

  return Object.keys(minluckTypesByValueMap).map((value) => ({
    ...minluck,
    types: minluckTypesByValueMap[value],
    value,
  }));
};

export default function Minlucks() {
  const [filter, setFilter] = useState('');
  const inputRef = React.useRef(null);
  const [focused, setFocused] = React.useState(false); // eslint-disable-line no-unused-vars

  React.useEffect(() => {
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

  return (
    <div>
      <Head>
        <title>MouseHunt Mice Minlucks - mouse.rip</title>
        <meta name="description" content="List of mice minlucks in MouseHunt" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout title="Mice Minlucks">
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
            <div className="overflow-hidden">
              <ul role="list" className="divide-y divide-slate-200">
                {minlucks.filter((minluck) =>
                  minluck.name.toLowerCase().includes(filter.toLowerCase()) ||
                  minluck.group.toLowerCase().includes(filter.toLowerCase()) ||
                  minluck.subgroup.toLowerCase().includes(filter.toLowerCase())
                ).map((minluck) => (
                  <li key={minluck.name} className="even:bg-slate-100">
                    <div className="px-2 py-2 sm:px-3">
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <div>
                          <div className="text-lg font-medium text-slate-800 truncate">
                            {minluck.name}
                          </div>
                          <div className="flex items-center mt-2 text-xs text-gray-500 flex-wrap">
                            <span className="mr-1">{minluck.group}</span>
                            <span>{minluck.subgroup && `(${minluck.subgroup})`}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end ml-4">
                          {flattenMinLucksByValue(minluck).map((minluck) => (
                            <div key={minluck.value} className="flex flex-end items-center">
                              {minluck.types.length < 8 && (
                                <div className="text-sm font-light text-slate-500 w-auto mr-2 text-right">
                                  {minluck.types.join(', ')}
                                </div>
                              ) || (
                                <div className="text-xs font-light text-slate-400 w-auto mr-2 text-right">
                                  Any
                                </div>
                              )}
                              <ColorScaleBadge value={minluck.value} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}
