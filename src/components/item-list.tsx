import { Item } from '@/components/item';
import { MouseRipItem } from '@/types';

type ItemListProps = {
  items: Array<MouseRipItem>;
  showtags?: boolean;
};

export function ItemList({
  items,
  showtags = false,
  ...props
}: ItemListProps) {
  if (!items.length) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Nothing here yet. Check back soon, or suggest something on{' '}
        <a
          href="https://discord.gg/mousehunt"
          className="font-medium text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200"
        >
          Discord
        </a>
        .
      </div>
    );
  }

  return (
    <div className="relative mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" {...props}>
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          showtags={showtags}
          {...props}
        />
      ))}
    </div>
  );
}
