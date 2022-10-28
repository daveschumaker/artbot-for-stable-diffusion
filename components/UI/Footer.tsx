import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { isInstalledPwa } from '../../utils/appUtils'
import Linker from './Linker'

interface FooterProps {
  isSafari: boolean
}

const StyledFooter = styled.footer<FooterProps>`
  display: none;
  margin-top: auto;
  margin-bottom: 16px;
  padding-top: 16px;
  text-align: center;

  ${(props) =>
    props.isSafari &&
    `
    margin-bottom: 160px;
    `}

  @media (min-width: 640px) {
    display: block;
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
        <Linker
          href="https://twitter.com/davely"
          target="_blank"
          rel="noopener noreferrer"
        >
          dave.ly
        </Linker>
        .
      </div>
      <div>
        Questions? Comments? Contact me on{' '}
        <Linker
          href="https://twitter.com/davely"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twitter
        </Linker>
      </div>
      <div>
        <Linker href="/about">about</Linker> | <Linker href="/faq">faq</Linker>{' '}
        | <Linker href="/changelog">changelog</Linker> |{' '}
        <Linker
          href="https://github.com/daveschumaker/artbot-for-stable-diffusion"
          target="_blank"
          rel="noreferrer"
        >
          github
        </Linker>
      </div>
    </StyledFooter>
  )
}
