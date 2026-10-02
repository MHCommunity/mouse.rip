import { type ReactNode } from 'react';

export { metadata } from './metadata';

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
