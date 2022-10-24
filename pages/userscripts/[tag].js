import Head from 'next/head'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import UserscriptsList from '../../components/UserscriptsList'
import userscripts from '../../data/userscripts.json';
import tags from '../../data/tags.json';

export async function getStaticProps({ params }) {
	return {
		props: {
			tag: params.tag,
		},
	}
}

export async function getStaticPaths() {
	if (process.env.SKIP_BUILD_STATIC_GENERATION) {
		return {
			paths: [],
			fallback: 'blocking',
		}
	}

	const tags = userscripts.reduce((acc, script) => {
		script.tags.forEach((tag) => {
			if (!acc.includes(tag)) {
				acc.push(tag);
			}
		});
		return acc;
	}, []);

	const paths = tags.map((tag) => ({
		params: { tag: tag },
	}));

	return {
		paths,
		fallback: true
	};
}

export default function Userscripts({ tag = 'all' }) {
	const tagData = tags.find((t) => t.id === tag)
	const title = tagData ? tagData.name : tag

	return (
		<div className='bg-white'>
			<Head>
				<title>{title} for MouseHunt - mouse.rip</title>
				<meta name='description' content={`${title} for MouseHunt - mouse.rip`} />
			</Head>

			<main>
				<Header text={title} className='text-purple-700' />
				<UserscriptsList tag={tag} />
			</main>
			<Footer />
		</div>
	);
}
