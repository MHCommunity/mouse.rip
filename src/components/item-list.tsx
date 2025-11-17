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
