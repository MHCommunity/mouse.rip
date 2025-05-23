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
              <span className="text-2xl text-pink-800 dark:text-pink-200 hover:text-pink-900 dark:hover:text-pink-300">
                mouse.rip
              </span>
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <SidebarItem href="/">
              <Logo />
              <SidebarLabel className="text-2xl text-pink-800 dark:text-pink-200 hover:text-pink-900 dark:hover:text-pink-300">
                mouse.rip
              </SidebarLabel>
            </SidebarItem>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current={pathname === '/'}>
                <HomeIcon />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/guides" current={pathname.startsWith('/guide')}>
                <AcademicCapIcon />
                <SidebarLabel className="text-pink-800 dark:text-pink-200 hover:text-pink-900 dark:hover:text-pink-300">Guides</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/extensions" current={pathname.startsWith('/extension')}>
                <BoltIcon />
                <SidebarLabel className="text-cyan-800 dark:text-cyan-200 hover:text-cyan-900 dark:hover:text-cyan-300">Extensions</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/spreadsheets" current={pathname.startsWith('/spreadsheet')}>
                <TableCellsIcon />
                <SidebarLabel className="text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-300">Spreadsheets</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/tools" current={pathname.startsWith('/tool')}>
                <WrenchIcon />
                <SidebarLabel className="text-green-800 dark:text-green-200 hover:text-green-900 dark:hover:text-green-300">Tools</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/userscripts" current={pathname.startsWith('/userscript')}>
                <SwatchIcon />
                <SidebarLabel className="text-purple-800 dark:text-purple-200 hover:text-purple-900 dark:hover:text-purple-300">Userscripts</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarDivider />
            <SidebarSection>
              {locations.map((region) => (
                <div key={region.id}>
                  <SidebarHeading className="text-xs font-semibold text-gray-400">
                    {region.name}
                  </SidebarHeading>
                  <div>
                    {region.locations.map((location) => (
                      <SidebarSmallItem
                        key={location.id}
                        href={`/locations/${location.id}`}
                        current={pathname === `/locations/${location.id}`}
                        className="text-xs font-semibold text-gray-400 rounded-md hover:text-white hover:bg-gray-800"
                      >
                        <Avatar slot="icon" src={`/images/locations/${location.id}.png`} alt={location.name} square />
                        {location.name}
                      </SidebarSmallItem>
                    ))}
                  </div>
                  <div className="flex-1 mt-4" aria-hidden="true" />
                </div>
              ))}
            </SidebarSection>

            <SidebarSection>
              <SidebarItem href="/about" current={pathname.startsWith('/about')}>
                <QuestionMarkCircleIcon />
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
    </SidebarLayout>
  );
}
