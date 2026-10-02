import { redirect } from 'next/navigation';

// The groups overview now lives on the combined /mice page.
export default function GroupsIndexPage() {
  redirect('/mice');
}
