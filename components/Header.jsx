export default function Header({ text, className }) {
  return (
    <div className="px-3 py-10 bg-gray-100">
      <h1 className="text-3xl font-bold tracking-tight text-center text-gray-700 sm:text-4xl">
        <span className={className}>{text}</span> for MouseHunt
      </h1>
    </div>
  )
}
