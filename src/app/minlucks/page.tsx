"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  VariableSizeList as List,
  ListChildComponentProps,
} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import Image from "next/image";

import { ColorScaleBadge } from "@/components/color-scale-badge";
import { Heading } from "@/components/heading";
import { Divider } from "@/components/divider";
import { Input, InputGroup } from "@/components/input";

import { Mouse } from "@/types";

import mice from "@/data/generated/mice.json";

const minluckTypes = [
  "arcane",
  "draconic",
  "forgotten",
  "hydro",
  "physical",
  "shadow",
  "tactical",
  "law",
  "rift",
];

function flattenMinLucksByValue(mouse: Mouse) {
  if (!mouse.minlucks) return [];
  const minluckTypesByValue = minluckTypes.filter(
    (type) =>
      typeof mouse.minlucks?.[type as keyof typeof mouse.minlucks] ===
        "number" && mouse.minlucks[type as keyof typeof mouse.minlucks]! > 0
  );
  const minluckTypesByValueMap: Record<number, string[]> = {};
  minluckTypesByValue.forEach((type) => {
    const value = mouse.minlucks?.[type as keyof typeof mouse.minlucks];
    if (typeof value !== "number") return;
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

  // Keyboard shortcut for focusing input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
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
    return mice.filter((mouse: Mouse) =>
      mouse.name.toLowerCase().includes(f) ||
      mouse.group?.toLowerCase().includes(f) ||
      mouse.subgroup?.toLowerCase().includes(f)
    );
  }, [debouncedFilter]);

  // Row height calculation
  const getRowHeight = (index: number) => {
    const mouse = filteredMice[index];
    const minluckCount = flattenMinLucksByValue(mouse).length;
    const baseHeight = 90;
    const extraHeight = minluckCount >= 2 ? ((minluckCount - 1) * 40) - 20 : 0;
    return baseHeight + extraHeight;
  };

  // Row renderer for react-window
  const Row = ({ index, style }: ListChildComponentProps) => {
    const mouse = filteredMice[index];
    return (
      <li
        key={mouse.id}
        style={style}
        className={`list-none ${index % 2 === 0 ? 'bg-slate-50 dark:bg-gray-800/50' : ''}`}
      >
        <div className="px-2 py-2 sm:px-3 flex items-center justify-between h-full">
          <div className="flex items-center w-16 shrink-0">
            <Image
              src={`https://i.mouse.rip/images/mice/thumbnail/${mouse.type.replaceAll('_', '-')}.png`}
              alt={mouse.name}
              width={48}
              height={48}
              className="inline-block w-12 h-12 rounded-md"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {mouse.name}
            </div>
            <div className="flex items-center mt-2 text-sm font-thin flex-wrap text-gray-500 dark:text-gray-400">
              {mouse?.group && (
                <span className="mr-1">
                  {mouse.group}
                </span>
              )}
              {mouse?.subgroup && (
                <span className="mr-1">
                  ({mouse.subgroup})
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end ml-4 h-full justify-center space-y-1 overflow-hidden">
            {flattenMinLucksByValue(mouse).map((ml) => (
              <div key={ml.value} className="flex items-center">
                <div className="text-sm font-light w-auto mr-2 text-right text-gray-700 dark:text-gray-300">
                  {ml.types.length < 8
                    ? ml.types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')
                    : 'Any'}
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
    <div className="mx-auto max-w-4xl px-4 flex flex-col h-dvh">
      <Heading>Mouse Minlucks</Heading>
      <Divider />
      <div className="py-6 flex flex-col flex-1 min-h-0">
        <InputGroup>
          <Input
            id="minluck-search"
            type="text"
            placeholder="Search for a mouse…"
            className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400"
            ref={inputRef}
            onChange={e => setFilter(e.target.value)}
            value={filter}
            aria-label="Mouse name"
          />
        </InputGroup>
        <div className="mt-8 flex-1 min-h-0">
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={filteredMice.length}
                itemSize={getRowHeight}
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
