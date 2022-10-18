import Link from 'next/link'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { isInstalledPwa } from '../utils/appUtils'

const StyledFooter = styled.footer`
  margin-top: auto;
  margin-bottom: 88px;
  padding-top: 16px;
  text-align: center;

  @media (min-width: 640px) {
    padding-top: 16px;
  }
`

export default function Footer() {
  const [isPwa, setIsPwa] = useState(false)

  useEffect(() => {
    setIsPwa(isInstalledPwa())
  }, [])

  if (isPwa) {
    return null
  }

  return (
    <StyledFooter>
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
    </StyledFooter>
  )
}
