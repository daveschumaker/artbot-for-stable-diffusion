import Link from 'next/link'

export default function Footer() {
  return (
    <div className="text-center mt-2 mb-2 left-0 right-0 content-end">
      <div>
        Web app created with ❤️ by{' '}
        <Link href="https://twitter.com/davely">
          <a
            className="text-cyan-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            dave.ly
          </a>
        </Link>
        .
      </div>
      <div>
        Questions? Comments? Contact me on{' '}
        <Link href="https://twitter.com/davely">
          <a
            className="text-cyan-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
        </Link>
      </div>
      <div>
        <Link href="/about">
          <a className="text-cyan-400">About</a>
        </Link>{' '}
        |{' '}
        <Link href="/faq">
          <a className="text-cyan-400">FAQ</a>
        </Link>{' '}
        |{' '}
        <a
          href="https://github.com/daveschumaker/artbot-for-stable-diffusion"
          target="_blank"
          rel="noreferrer"
          className="text-cyan-400"
        >
          Github
        </a>
      </div>
    </div>
  )
}
