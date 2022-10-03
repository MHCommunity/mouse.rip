import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>MouseHunt Guides, Tools, and Resources - mouse.rip</title>
        <meta name="description" content="MouseHunt Guides, Tools, and Resources" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          welcome to <a href="https://mouse.rip">mouse.rip</a>!
        </h1>

        <p className={styles.description}>
          Guides, tools, and resources for <a href="https://mousehuntgame.com">MouseHunter</a>.
        </p>

        <div className={styles.grid}>
          <a href="https://guide.mouse.rip/" className={styles.card}>
            <h2>Guide &rarr;</h2>
            <p>From Novice to Fabled, learn the best way to play MouseHunt.</p>
          </a>

          <a href="https://api.mouse.rip" className={styles.card}>
            <h2>API &rarr;</h2>
            <p>An unofficial MouseHunt API for all you nerds and developers.</p>
          </a>

          <a
            href="https://greasyfork.org/en/scripts/by-site/mousehuntgame.com"
            className={styles.card}
          >
            <h2>Userscripts &rarr;</h2>
            <p>Customize and improve your MouseHunt experience.</p>
          </a>

          <a
            href="https://mhct.win"
            className={styles.card}
          >
            <h2>Tools &rarr;</h2>
            <p>
              Tools to help you calculate and optimize your hunts.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://discordapp.com/invite/Ya9zEdk"
          target="_blank"
          rel="noopener noreferrer"
        >
        Questions? Ask {' '}
        <code className={styles.code}>#community-tools</code> on the MouseHunt Discord.
        </a>
      </footer>
    </div>
  )
}
