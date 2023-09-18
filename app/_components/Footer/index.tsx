'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { isInstalledPwa } from '../../../utils/appUtils'
import Linker from 'app/_components/Linker'
import styles from './component.module.css'

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
    <div className={clsx(styles.Footer, isSafari && styles['Footer-isSafari'])}>
      <div>
        Web app created with ❤️ and ☕️ by{' '}
        <Linker
          href="https://mastodon.world/@davely"
          target="_blank"
          rel="noopener noreferrer"
        >
          @davely
        </Linker>
        .
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
    </div>
  )
}
