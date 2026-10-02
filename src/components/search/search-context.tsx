'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// The dialog pulls in the search index (mice groups, titles, items), so it's
// only loaded once the user actually opens search.
const SearchDialog = dynamic(() => import('./search-dialog').then((mod) => mod.SearchDialog), {
  ssr: false,
});

interface SearchContextValue {
  open: () => void;
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

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  // Stays true once search has been opened, so the dialog keeps its loaded chunk.
  const [mounted, setMounted] = useState(false);

  const open = useCallback(() => {
    setMounted(true);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Cmd/Ctrl+K opens search from anywhere.
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setMounted(true);
        setIsOpen((prev) => !prev);
        return;
      }
      // "/" is a quick shortcut, but only when not already typing somewhere.
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (isTypingTarget(event.target)) return;
        event.preventDefault();
        setMounted(true);
        setIsOpen(true);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SearchContext.Provider value={{ open }}>
      {children}
      {mounted && <SearchDialog open={isOpen} onClose={() => setIsOpen(false)} />}
    </SearchContext.Provider>
  );
}
