'use client';
import { usePathname } from 'next/navigation';
import React, { useId, useState, type ReactNode } from 'react';

import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar';
import {
  Sidebar,
  SidebarBody,
  SidebarDivider,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/sidebar';
import { Logo } from '@/components/logo';
import { SidebarLayout } from '@/components/sidebar-layout';
import { SearchProvider } from '@/components/search/search-context';
import { SearchButton } from '@/components/search/search-button';
import { Footer } from '@/components/footer';

// Imported directly: going through @/lib/site-data would bundle every site
// dataset into this client component, and so into every page.
import locationsData from '@/data/locations.json';
import type { LocationRegion } from '@/types';

import {
  AcademicCapIcon,
  BoltIcon,
  ChevronRightIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  SwatchIcon,
  TableCellsIcon,
  WrenchIcon,
} from '@heroicons/react/20/solid';
import { CheeseIcon, MouseIcon } from '@/components/game-icons';
import { DiscordIcon, GitHubIcon } from '@/components/social-icon';
import { Avatar } from '@/components/avatar';
import { locationImageUrl } from '@/lib/image-urls';

const locations = locationsData as LocationRegion[];

/**
 * One region of locations, collapsed unless the current page is inside it, so the
 * sidebar isn't 70 links long. The current region opens itself on arrival, but
 * can still be collapsed.
 */
function LocationRegionGroup({ region, pathname }: { region: LocationRegion; pathname: string }) {
  const containsCurrent = region.locations.some((location) => pathname === `/locations/${location.id}`);
  const [expanded, setExpanded] = useState(containsCurrent);
  const [wasCurrent, setWasCurrent] = useState(containsCurrent);
  if (containsCurrent !== wasCurrent) {
    setWasCurrent(containsCurrent);
    if (containsCurrent) setExpanded(true);
  }
  // The desktop sidebar and the mobile drawer each render this, so the ID must be per instance.
  const listId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={listId}
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm/5 font-medium text-zinc-700 hover:bg-zinc-950/5 hover:text-zinc-950 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 sm:py-1.5 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
      >
        <ChevronRightIcon
          aria-hidden="true"
          className={`size-4 shrink-0 fill-zinc-500 transition-transform motion-reduce:transition-none dark:fill-zinc-400 ${expanded ? 'rotate-90' : ''}`}
        />
        <span className="flex-1 truncate">{region.name}</span>
        <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{region.locations.length}</span>
      </button>
      {expanded && (
        <div id={listId} className="mb-2 ml-3 border-l border-zinc-950/5 pl-1 dark:border-white/10">
          {region.locations.map((location) => (
            <SidebarItem
              key={location.id}
              href={`/locations/${location.id}`}
              prefetch={false}
              current={pathname === `/locations/${location.id}`}
              className="rounded-md"
            >
              <Avatar slot="icon" src={locationImageUrl(location.id)} alt="" square />
              <SidebarLabel>{location.name}</SidebarLabel>
            </SidebarItem>
          ))}
        </div>
      )}
    </div>
  );
}

interface ApplicationLayoutProps {
  children: ReactNode;
}

export function ApplicationLayout({ children }: ApplicationLayoutProps) {
  const pathname = usePathname();

  return (
    <SearchProvider>
      <SidebarLayout
        navbar={
          <Navbar>
            <NavbarSection>
              {/* The logo is the home link; a current-page underline beneath it reads as a stray rule. */}
              <NavbarItem href="/" aria-label="mouse.rip home">
                <Logo />
                <span className="text-xl text-pink-800 hover:text-pink-900 min-[360px]:text-2xl dark:text-pink-200 dark:hover:text-pink-300">
                  mouse.rip
                </span>
              </NavbarItem>
            </NavbarSection>
            <NavbarSpacer />
            {/* The home page leads with its own search field; a second one up here only splits attention. */}
            {pathname !== '/' && (
              <NavbarSection>
                <SearchButton className="w-auto" />
              </NavbarSection>
            )}
          </Navbar>
        }
        sidebar={
          <Sidebar>
            <SidebarHeader>
              <SidebarItem href="/" aria-label="mouse.rip home">
                <Logo aria-hidden="true" />
                <SidebarLabel className="rounded text-2xl text-pink-800 hover:text-pink-900 focus:outline-hidden focus:ring-2 focus:ring-pink-500 dark:text-pink-200 dark:hover:text-pink-300">
                  mouse.rip
                </SidebarLabel>
              </SidebarItem>
            </SidebarHeader>

            <SidebarBody>
              {pathname !== '/' && (
                <div className="px-2 pb-2">
                  <SearchButton className="w-full" />
                </div>
              )}
              <SidebarSection>
                <SidebarItem
                  href="/"
                  current={pathname === '/'}
                  className="rounded focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                >
                  <HomeIcon aria-hidden="true" />
                  <SidebarLabel>Home</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/guides"
                  // Titles and trap effects are listed on the Guides page, so Guides stays lit there.
                  current={
                    pathname.startsWith('/guide') ||
                    pathname.startsWith('/titles') ||
                    pathname.startsWith('/trap-special-effects')
                  }
                  className="rounded focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                >
                  <AcademicCapIcon aria-hidden="true" />
                  <SidebarLabel>Guides</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/extensions"
                  current={pathname.startsWith('/extension')}
                  className="rounded focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                >
                  <BoltIcon aria-hidden="true" />
                  <SidebarLabel>Extensions</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/tools"
                  current={pathname === '/tools' || pathname.startsWith('/tools/')}
                  className="rounded focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                >
                  <WrenchIcon aria-hidden="true" />
                  <SidebarLabel>Tools</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/spreadsheets"
                  current={pathname.startsWith('/spreadsheet')}
                  className="rounded focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                >
                  <TableCellsIcon aria-hidden="true" />
                  <SidebarLabel>Spreadsheets</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/userscripts"
                  current={pathname.startsWith('/userscript')}
                  className="rounded focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                >
                  <SwatchIcon aria-hidden="true" />
                  <SidebarLabel>Userscripts</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/mice"
                  current={
                    pathname.startsWith('/mice') || pathname.startsWith('/mouse') || pathname.startsWith('/groups')
                  }
                  className="rounded focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                >
                  <MouseIcon aria-hidden="true" />
                  <SidebarLabel>Mice</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/items"
                  current={pathname.startsWith('/item')}
                  className="rounded focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                >
                  <CheeseIcon aria-hidden="true" />
                  <SidebarLabel>Items</SidebarLabel>
                </SidebarItem>
              </SidebarSection>

              <SidebarSection>
                <SidebarHeading>Locations</SidebarHeading>
                {locations.map((region) => (
                  <LocationRegionGroup key={region.id} region={region} pathname={pathname} />
                ))}
              </SidebarSection>

              <SidebarDivider />
              <SidebarSection>
                <SidebarItem href="/about" current={pathname.startsWith('/about')}>
                  <QuestionMarkCircleIcon aria-hidden="true" />
                  <SidebarLabel>About</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="https://github.com/MHCommunity">
                  <GitHubIcon />
                  <SidebarLabel>GitHub</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="https://discord.gg/mousehunt">
                  <DiscordIcon />
                  <SidebarLabel>Discord</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
            </SidebarBody>
          </Sidebar>
        }
      >
        {children}
        <Footer />
      </SidebarLayout>
    </SearchProvider>
  );
}
