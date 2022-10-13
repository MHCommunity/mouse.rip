export default function Badge({color, text}) {
	switch (color) {
		case 'pink':
			return (
				<span className="inline-flex items-center rounded  px-2 py-0.5 text-xs font-medium bg-pink-100 text-pink-800">{text}</span>
			)
		case 'red':
			return (
				<span className="inline-flex items-center rounded  px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800">{text}</span>
			)
		case 'green':
			return (
				<span className="inline-flex items-center rounded  px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">{text}</span>
			)
		case 'blue':
			return (
				<span className="inline-flex items-center rounded  px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">{text}</span>
			)
		case 'yellow':
			return (
				<span className="inline-flex items-center rounded  px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">{text}</span>
			)
		case 'gray':
			return (
				<span className="inline-flex items-center rounded  px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">{text}</span>
			)
		default:
			return (
				<span className="inline-flex items-center rounded  px-2 py-0.5 text-xs font-medium bg-pink-100 text-pink-800">{text}</span>
			)
		}
}
