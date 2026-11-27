'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import { loadItemIndex, loadMouseIndex } from '@/lib/client-index';

// The dialog pulls in the search index (mice groups, titles, items), so it's
// only loaded once the user actually opens search.
const SearchDialog = dynamic(() => import('./search-dialog').then((mod) => mod.SearchDialog), {
  ssr: false,
});

interface SearchContextValue {
  /** Open the palette, optionally with text the user already started typing. */
  open: (initialQuery?: string) => void;
  /** Load the palette's code ahead of time (e.g. when a search field gains focus). */
  preload: () => void;
  isOpen: boolean;
  /** What was in the palette when it was last dismissed (empty after a result was chosen). */
  closedQuery: string;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch(): SearchContextValue {
  const value = useContext(SearchContext);
  if (!value) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return value;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/** A button or link inside the palette (Cancel, a "browse all" link), where Space is for the control. */
function isPaletteControl(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest('button, a[href]') !== null &&
    target.closest('[role="dialog"][aria-label="Search"]') !== null
  );
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  // Stays true once search has been opened, so the dialog keeps its loaded chunk.
  const [mounted, setMounted] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const [closedQuery, setClosedQuery] = useState('');

  // Mirrors isOpen, but is set the moment search opens, before React re-renders,
  // so keys pressed in that gap are still caught.
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // The palette asks for the mouse and item lists once it's on screen. Asking here as well starts those downloads
  // alongside the palette's own code instead of after it. A failure is the palette's to report when it asks.
  const warm = useCallback(() => {
    setMounted(true);
    loadMouseIndex().catch(() => {});
    loadItemIndex().catch(() => {});
  }, []);

  const open = useCallback(
    (query = '') => {
      isOpenRef.current = true;
      setInitialQuery(query);
      warm();
      setIsOpen(true);
    },
    [warm],
  );

  // Pointing at a search button is a weaker signal than opening it, so that fetches the palette's code only.
  const preload = useCallback(() => setMounted(true), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Already handled by whatever has focus.
      if (event.defaultPrevented) return;
      // The first open downloads the palette, and its input isn't focused until that
      // lands. Hold what's typed meanwhile and hand it over, instead of losing it.
      if (
        isOpenRef.current &&
        !isTypingTarget(event.target) &&
        !isPaletteControl(event.target) &&
        event.key.length === 1 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        setInitialQuery((previous) => previous + event.key);
        return;
      }
      // Cmd/Ctrl+K opens search from anywhere.
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setInitialQuery('');
        warm();
        isOpenRef.current = !isOpenRef.current;
        setIsOpen(isOpenRef.current);
        return;
      }
      // "/" is a quick shortcut, but only when not already typing somewhere.
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (isTypingTarget(event.target)) return;
        event.preventDefault();
        setInitialQuery('');
        warm();
        isOpenRef.current = true;
        setIsOpen(true);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [warm]);

  return (
    <SearchContext.Provider value={{ open, preload, isOpen, closedQuery }}>
      {children}
      {mounted && (
        <SearchDialog
          open={isOpen}
          initialQuery={initialQuery}
          onClose={(query) => {
            setClosedQuery(query);
            isOpenRef.current = false;
            setIsOpen(false);
          }}
        />
      )}
    </SearchContext.Provider>
  );
}
