import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ListItem from '../components/ListItem'
import BackToHome from '../components/BackToHome'

import {
	BeakerIcon,
	HeartIcon
} from '@heroicons/react/24/outline'

const tools = [
	{
		name: "Catch Rate Estimator",
		description: "Calculate your catch rate, based on setup.",
		url: "https://tsitu.github.io/MH-Tools/cre.html",
		icon: <BeakerIcon className="h-6 w-6 text-green-800" aria-hidden="true" />,
	},
	{
		name: "MouseHunt Community Tools",
		description: "A collection of tools for MouseHunt.",
		url: "https://mhct.win/",
		icon: <HeartIcon className="h-6 w-6 text-green-800" aria-hidden="true" />,
	}
];

export default function Tools() {
	return (
		<div className="bg-white">
			<Head>
				<title>MouseHunt Tools - mouse.rip</title>
				<meta name="description" content="MouseHunt Tools" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className="mx-auto w-full max-w-10xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-3xl py-16 sm:py-24">
					<Header title="Tools" />
					<BackToHome />
					<div className="max-w-xl mx-auto">
						<ul role="list" className="mt-4 divide-y divide-gray-200">
							{tools.map((tool) => (
								<ListItem
									key={tool.name}
									name={tool.name}
									description={tool.description}
									url={tool.url}
									icon={tool.icon}
									color="green"
								/>
							))}
						</ul>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	)
}
