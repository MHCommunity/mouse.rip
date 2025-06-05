'use client';
import { usePathname } from 'next/navigation';

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
  SidebarSmallItem
} from '@/components/sidebar';
import { Logo } from '@/components/logo';
import { SidebarLayout } from '@/components/sidebar-layout';

import { getLocations } from '@/data';

import {
  AcademicCapIcon,
  BoltIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  SwatchIcon,
  TableCellsIcon,
  WrenchIcon
} from '@heroicons/react/20/solid';
import { DiscordIcon, GitHubIcon } from '@/components/social-icon';
import { Avatar } from '@/components/avatar';

export function ApplicationLayout({ children }) {
  const pathname = usePathname();
  const locations = getLocations();

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/" current={pathname === '/'}>
              <Logo />
              <span className="text-2xl text-pink-800 hover:text-pink-900 dark:text-pink-200 dark:hover:text-pink-300">
                mouse.rip
              </span>
            </NavbarItem>
          </NavbarSection>
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
            <SidebarSection>
              <SidebarItem
                href="/"
                current={pathname === '/'}
                aria-label="Home"
                className="rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <HomeIcon aria-hidden="true" />
                <SidebarLabel>
                  Home
                </SidebarLabel>
              </SidebarItem>
              <SidebarItem
                href="/guides"
                current={pathname.startsWith('/guide')}
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
                current={pathname.startsWith('/tool')}
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
            </SidebarSection>

            <SidebarDivider />
            <SidebarSection>
              {locations.map((region) => (
                <div key={region.id}>
                  <SidebarHeading
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                    aria-label={`${region.name} region`}
                  >
                    {region.name}
                  </SidebarHeading>
                  <div>
                    {region.locations.map((location) => (
                      <SidebarSmallItem
                        key={location.id}
                        href={`/locations/${location.id}`}
                        current={pathname === `/locations/${location.id}`}
                        className="rounded-md text-xs font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
                      >
                        <Avatar slot="icon" src={`/images/locations/${location.id}.png`} alt={location.name} square />
                        {location.name}
                      </SidebarSmallItem>
                    ))}
                  </div>
                  <div className="mt-4 flex-1" aria-hidden="true" />
                </div>
              ))}
            </SidebarSection>

            <SidebarDivider />
            <SidebarSection>
              <SidebarItem href="/about" current={pathname.startsWith('/about')}>
                <QuestionMarkCircleIcon />
                <SidebarLabel>
                  About
                </SidebarLabel>
              </SidebarItem>
              <SidebarItem href="https://github.com/MHCommunity">
                <GitHubIcon />
                <SidebarLabel>
                  GitHub
                </SidebarLabel>
              </SidebarItem>
              <SidebarItem href="https://discord.gg/mousehunt">
                <DiscordIcon />
                <SidebarLabel>
                  Discord
                </SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}
