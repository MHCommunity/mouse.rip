import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Mice',
};

export default function Mouse() {
  redirect('/mice');
}
