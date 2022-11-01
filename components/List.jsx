import ListItem from '../components/ListItem'

export default function List({ items, ringClassName, textClassName }) {
  return (
    <div role="list" className="mt-6 grid space-y-5">
      {items.map((item) => (
        <ListItem key={item.name} name={item.name} description={item.description} icon={item.icon} href={item.url} ringClassName={ringClassName} textClassName={textClassName} />
      ))}
    </div>
  )
}
