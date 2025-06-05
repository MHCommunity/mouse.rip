import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Items',
};

export default function Item() {
  redirect('/items');
}
