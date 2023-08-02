import React from 'react'
import { sleep } from 'utils/sleep'

const useScrollToLocation = () => {
  const scrolledRef = React.useRef(false)
  const [, hash] = window.location.href.split('#')

  const scroll = async () => {
    await sleep(250)
    const id = hash.replace('#', '')
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      scrolledRef.current = true
    }
  }

  React.useEffect(() => {
    if (hash && !scrolledRef.current) {
      scroll()
    }
  })
}

export default useScrollToLocation
