export default function Header({ title }) {
	return (
		<div className="text-center mb-12">
			<h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
				{title} for <a href="https://mousehuntgame.com" className="text-sky-500 hover:text-sky-700">MouseHunt</a>.
			</h1>
		</div>
	)
}
