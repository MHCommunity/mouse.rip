import Link from 'next/link'

export default function BackToHome() {
	return (
		<div className="-mt-5 text-center">
			<span className="text-base font-medium text-sky-500 hover:text-sky-700">
				<Link href="/">
					<a><span aria-hidden="true">← </span> back to <span className="text-sky-600">mouse.rip</span> main page.</a>
				</Link>
			</span>
		</div>
	)
}
