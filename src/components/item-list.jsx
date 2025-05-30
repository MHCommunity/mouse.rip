import { Item } from '@/components/item';

export function ItemList({ items, ...props }) {
  return (
    <div className="relative mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" {...props}>
      {items.map((item) => (
        <Item key={item.id} item={item} showtags={props.showtags ? 'true' : 'false'} />
      ))}
    </div>
  );
}
