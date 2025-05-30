import { Heading, Subheading } from '@/components/heading';
import { Divider } from '@/components/divider';
import { PageLink } from '@/components/page-link';

export const metadata = {
  title: 'About mouse.rip - Your MouseHunt Resource Hub',
  description: 'Learn more about mouse.rip, your comprehensive resource for MouseHunt guides, tools, and community-created content.',
};

export default async function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <Heading>About mouse.rip</Heading>

      <Divider className="my-10 mt-6" />

      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">
          Welcome to <PageLink href="/">mouse.rip</PageLink> your ultimate resource hub for the MouseHunt game. We are dedicated to providing comprehensive tools, detailed guides, and valuable information to help you become a master hunter in the world of Gnawnia.
        </p>
        <p className="mb-4">
          Our mission is to create a centralized platform where MouseHunt players of all levels can find the resources they need to enhance their gameplay experience.
        </p>
      </div>

      <Subheading className="mt-6 mb-3">
        Our Features
      </Subheading>

      <ul className="mb-4 text-gray-700 list-disc list-inside dark:text-gray-300 space-y-2">
        <li className="my-2">
          <PageLink href="/guides">Guides</PageLink> - Detailed guides covering all aspects of MouseHunt, from beginner tips to advanced strategies.
        </li>
        <li className="my-2">
          <PageLink href="/extensions">Extensions</PageLink> - Browser extensions to enhance your MouseHunt experience.
        </li>
        <li className="my-2">
          <PageLink href="/spreadsheets">Spreadsheets</PageLink> - Comprehensive spreadsheets for tracking progress, planning hunts, and managing resources.
        </li>
        <li className="my-2">
          <PageLink href="/tools">Tools</PageLink> - Various tools to assist with calculations, information lookup, simulations, and more.
        </li>
        <li className="my-2">
          <PageLink href="/userscripts">Userscripts</PageLink> - Custom scripts to customize your MouseHunt interface and enhance the user experience.
        </li>
      </ul>

      <Subheading className="mt-6 mb-3">
        Connect with Us
      </Subheading>

      <p className="mb-4 text-gray-700 dark:text-gray-300">
        Join us on <PageLink href="https://github.com/MHCommunity">GitHub</PageLink> or <PageLink href="https://discordapp.com/invite/Ya9zEdk">Discord</PageLink> to connect with other hunters, ask questions, share your ideas, and contribute to the community.
      </p>

      <Divider className="my-10" />

      <Subheading className="mb-3">
        Disclaimer
      </Subheading>

      <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
        <PageLink href="/">mouse.rip</PageLink> is a fan-made resource hub created by and for the MouseHunt community.This website is not affiliated with, endorsed, or sponsored by HitGrab. All game content and materials belong to <PageLink href="https://hitgrab.com/">HitGrab</PageLink>.
      </p>
    </div>
  );
}
