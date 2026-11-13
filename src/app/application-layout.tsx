'use client';
import { usePathname } from 'next/navigation';
import React, { useState, type ReactNode } from 'react';

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
  BeakerIcon,
  BoltIcon,
  CalculatorIcon,
  ChevronRightIcon,
  HomeIcon,
  MapPinIcon,
  QueueListIcon,
  ScaleIcon,
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
 * The lookups and calculators built into mouse.rip, as opposed to the tools it links out to.
 * Titles and trap effects live on the Guides page as game reference, to keep this list short.
 */
const lookups = [
  { href: '/minlucks', name: 'Minlucks', icon: ScaleIcon },
  { href: '/relic-hunter', name: 'Relic Hunter', icon: MapPinIcon },
  { href: '/valour-rift-floors', name: 'Valour Rift floors', icon: QueueListIcon },
  { href: '/essence-calculator', name: 'Essence calculator', icon: BeakerIcon },
  { href: '/queso-pump-calculator', name: 'Queso pump calculator', icon: CalculatorIcon },
];

/**
 * One region of locations, collapsed unless the current page is inside it, so the
 * sidebar isn't 70 links long.
 */
function LocationRegionGroup({ region, pathname }: { region: LocationRegion; pathname: string }) {
  const containsCurrent = region.locations.some((location) => pathname === `/locations/${location.id}`);
  const [open, setOpen] = useState(containsCurrent);
  const expanded = open || containsCurrent;
  const listId = `region-${region.id}`;

  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={listId}
        onClick={() => setOpen(!expanded)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm/5 font-medium text-zinc-700 hover:bg-zinc-950/5 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 sm:py-1.5 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
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
              <SidebarItem href="/" aria-label="Home">
                <Logo aria-hidden="true" />
                <SidebarLabel className="rounded text-2xl text-pink-800 hover:text-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-pink-200 dark:hover:text-pink-300">
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
                  className="rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                  aria-label="Guides"
                  className="rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <AcademicCapIcon aria-hidden="true" />
                  <SidebarLabel className="text-pink-800 hover:text-pink-900 dark:text-pink-200 dark:hover:text-pink-300">
                    Guides
                  </SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/extensions"
                  current={pathname.startsWith('/extension')}
                  aria-label="Extensions"
                  className="rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <BoltIcon aria-hidden="true" />
                  <SidebarLabel className="text-cyan-800 hover:text-cyan-900 dark:text-cyan-200 dark:hover:text-cyan-300">
                    Extensions
                  </SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/tools"
                  current={pathname === '/tools' || pathname.startsWith('/tools/')}
                  aria-label="Tools"
                  className="rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <WrenchIcon aria-hidden="true" />
                  <SidebarLabel className="text-green-800 hover:text-green-900 dark:text-green-200 dark:hover:text-green-300">
                    Tools
                  </SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/spreadsheets"
                  current={pathname.startsWith('/spreadsheet')}
                  aria-label="Spreadsheets"
                  className="rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <TableCellsIcon aria-hidden="true" />
                  <SidebarLabel className="text-blue-800 hover:text-blue-900 dark:text-blue-200 dark:hover:text-blue-300">
                    Spreadsheets
                  </SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/userscripts"
                  current={pathname.startsWith('/userscript')}
                  aria-label="Userscripts"
                  className="rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <SwatchIcon aria-hidden="true" />
                  <SidebarLabel className="text-purple-800 hover:text-purple-900 dark:text-purple-200 dark:hover:text-purple-300">
                    Userscripts
                  </SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/mice"
                  current={
                    pathname.startsWith('/mice') || pathname.startsWith('/mouse') || pathname.startsWith('/groups')
                  }
                  aria-label="Mice"
                  className="rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <MouseIcon aria-hidden="true" />
                  <SidebarLabel className="text-emerald-800 hover:text-emerald-900 dark:text-emerald-200 dark:hover:text-emerald-300">
                    Mice
                  </SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/items"
                  current={pathname.startsWith('/item')}
                  aria-label="Items"
                  className="rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <CheeseIcon aria-hidden="true" />
                  <SidebarLabel className="text-amber-800 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-300">
                    Items
                  </SidebarLabel>
                </SidebarItem>
              </SidebarSection>

              <SidebarSection>
                <SidebarHeading>Lookups</SidebarHeading>
                {lookups.map(({ href, name, icon: Icon }) => (
                  <SidebarItem key={href} href={href} current={pathname.startsWith(href)}>
                    <Icon aria-hidden="true" />
                    <SidebarLabel>{name}</SidebarLabel>
                  </SidebarItem>
                ))}
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
