import { Divider } from '@/components/divider';
import { Heading, Subheading } from '@/components/heading';
import Link from 'next/link';

export const metadata = {
  title: 'About',
};

export default async function About() {
  const MouseRipLink = () => {
    return (
      <Link href="/" className="text-pink-800 dark:text-pink-200 hover:text-pink-900 dark:hover:text-pink-300">
        mouse.rip
      </Link>
    );
  };

  const PageLink = ({ href, children }) => {
    return (
      <Link href={href} className="text-sky-500 dark:text-sky-200 hover:text-sky-700 dark:hover:text-sky-300">
        {children}
      </Link>
    );
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Heading>About mouse.rip</Heading>

      <Divider className="my-10 mt-6" />

      <Subheading className="mt-6 mb-3">Our mission</Subheading>
      <p className="mb-4">
        Welcome to <MouseRipLink />. We are here to provide you with the tools, guides, and information you need to become a successful hunter and navigate the world of Gnawnia.
      </p>
      <Subheading className="mt-6 mb-3">Our Features</Subheading>
      <ul className="list-disc list-inside mb-4">
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
      <Subheading className="mt-6 mb-3">Connect with Us</Subheading>
      <p className="mb-4">
        Join us on <PageLink href="https://github.com/MHCommunity">GitHub</PageLink> or <PageLink href="https://discordapp.com/invite/Ya9zEdk">Discord</PageLink> to connect with other hunters, ask questions, share your ideas, and contribute to the community.
      </p>
      <Subheading className="mt-6 mb-3">Support Us</Subheading>
      <p className="mb-4">
        <MouseRipLink /> is maintained by a dedicated team of volunteers. If you find our resources helpful and would like to support us, please consider contributing to our development or making a donation. Your support helps us keep the site running and continuously improve our offerings.
      </p>
      <p className="mb-4">
        Thank you for visiting <MouseRipLink />. Happy hunting!
      </p>
    </div>
  );
}
