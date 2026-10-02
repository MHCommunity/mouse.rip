'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import Image from 'next/image';

import { ColorScaleBadge } from '@/components/color-scale-badge';
import { PageHeader } from '@/components/page-header';
import { Input, InputGroup } from '@/components/input';
import { Link } from 'next-view-transitions';

import { SlimMouse } from '@/types';

import mice from '@/data/generated/mice-search.json';
import { mouseImageUrl } from '@/lib/image-urls';

const minluckTypes = ['arcane', 'draconic', 'forgotten', 'hydro', 'physical', 'shadow', 'tactical', 'law', 'rift'];

function flattenMinLucksByValue(mouse: SlimMouse) {
  if (!mouse.minlucks) return [];
  const minluckTypesByValue = minluckTypes.filter(
    (type) =>
      typeof mouse.minlucks?.[type as keyof typeof mouse.minlucks] === 'number' &&
      mouse.minlucks[type as keyof typeof mouse.minlucks]! > 0,
  );
  const minluckTypesByValueMap: Record<number, string[]> = {};
  minluckTypesByValue.forEach((type) => {
    const value = mouse.minlucks?.[type as keyof typeof mouse.minlucks];
    if (typeof value !== 'number') return;
    if (minluckTypesByValueMap[value]) {
      minluckTypesByValueMap[value].push(type);
    } else {
      minluckTypesByValueMap[value] = [type];
    }
  });

  return Object.keys(minluckTypesByValueMap).map((value) => ({
    ...mouse,
    types: minluckTypesByValueMap[Number(value)],
    value: Number(value),
  }));
}

// Debounce hook
function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function MinLucksPage() {
  const [filter, setFilter] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<List>(null);

  // Pre-fill the filter from a ?q= param (e.g. when arriving from site search).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setFilter(q);
  }, []);

  // Escape blurs the filter; Cmd/Ctrl+K is handled globally by site search.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    inputRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced filter value
  const debouncedFilter = useDebouncedValue(filter, 200);

  // Memoized filtered mice
  const filteredMice = useMemo(() => {
    const f = debouncedFilter.trim().toLowerCase();
    if (!f) return mice;
    return mice.filter(
      (mouse: SlimMouse) =>
        mouse.name.toLowerCase().includes(f) ||
        mouse.group?.toLowerCase().includes(f) ||
        mouse.subgroup?.toLowerCase().includes(f),
    );
  }, [debouncedFilter]);

  // react-window caches measured row heights by index, so a new filter result set
  // would otherwise be laid out using the previous list's heights.
  useEffect(() => {
    listRef.current?.resetAfterIndex(0, true);
  }, [filteredMice]);

  // Row height calculation
  const getRowHeight = (index: number) => {
    const mouse = filteredMice[index];
    if (!mouse) return 90;
    const minluckCount = flattenMinLucksByValue(mouse).length;
    const baseHeight = 90;
    const extraHeight = minluckCount >= 2 ? (minluckCount - 1) * 40 - 20 : 0;
    return baseHeight + extraHeight;
  };

  // Row renderer for react-window
  const Row = ({ index, style }: ListChildComponentProps) => {
    const mouse = filteredMice[index];
    if (!mouse) return null;
    return (
      <li
        key={mouse.id}
        style={style}
        className={`list-none ${index % 2 === 0 ? 'bg-slate-50 dark:bg-gray-800/50' : ''}`}
      >
        <div className="px-2 py-2 sm:px-3 flex items-center justify-between h-full">
          <div className="flex items-center w-16 shrink-0">
            <Image
              src={mouseImageUrl(mouse.type)}
              alt={mouse.name}
              width={48}
              height={48}
              className="inline-block w-12 h-12"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <Link
              href={`/mice/${mouse.type.replaceAll('_', '-')}`}
              className="text-lg font-medium text-gray-700 hover:text-pink-700 dark:text-gray-300 dark:hover:text-pink-300"
            >
              {mouse.name}
            </Link>
            <div className="flex items-center mt-2 text-sm flex-wrap text-gray-600 dark:text-gray-300">
              {mouse?.group && <span className="mr-1">{mouse.group}</span>}
              {mouse?.subgroup && <span className="mr-1">({mouse.subgroup})</span>}
            </div>
          </div>
          <div className="flex flex-col items-end ml-4 h-full justify-center space-y-1 overflow-hidden">
            {flattenMinLucksByValue(mouse).map((ml) => (
              <div key={ml.value} className="flex items-center">
                <div className="text-sm font-light w-auto mr-2 text-right text-gray-700 dark:text-gray-300">
                  {ml.types.length < 8 ? ml.types.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ') : 'Any'}
                </div>
                <ColorScaleBadge value={ml.value} />
              </div>
            ))}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="flex h-dvh flex-col">
      <PageHeader
        title="Mouse Minlucks"
        description="Search any mouse to find the minimum luck needed to guarantee a catch with each power type."
      />
      <div className="flex flex-1 flex-col min-h-0">
        <InputGroup>
          <Input
            id="minluck-search"
            type="text"
            placeholder="Search mice by name…"
            className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400"
            ref={inputRef}
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
            aria-label="Search mice by name"
          />
        </InputGroup>
        <div className="mt-8 flex-1 min-h-0">
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={listRef}
                height={height}
                itemCount={filteredMice.length}
                itemSize={getRowHeight}
                itemKey={(index) => filteredMice[index]?.id ?? index}
                width={width}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
}
