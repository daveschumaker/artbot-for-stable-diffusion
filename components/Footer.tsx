import Link from 'next/link'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { isInstalledPwa } from '../utils/appUtils'

interface FooterProps {
  isSafari: boolean
}

const StyledFooter = styled.footer<FooterProps>`
  margin-top: auto;
  margin-bottom: 16px;
  padding-top: 16px;
  text-align: center;

  ${(props) =>
    props.isSafari &&
    `
      margin-bottom: 88px;
    `}

  @media (min-width: 640px) {
    padding-top: 16px;
  }
`

export default function Footer() {
  const [isSafari, setIsSafari] = useState(false)
  const [isPwa, setIsPwa] = useState(false)

  useEffect(() => {
    var userAgent = window.navigator.userAgent
    if (userAgent?.match(/iPhone/i)) {
      setIsSafari(true)
    }
    setIsPwa(isInstalledPwa())
  }, [])

  if (isPwa) {
    return null
  }

  return (
    <StyledFooter isSafari={isSafari}>
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
