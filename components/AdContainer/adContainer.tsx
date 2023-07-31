import clsx from 'clsx'
import React, { useEffect, useRef } from 'react'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import { usePathname } from 'next/navigation'
let isMounted = false

function AdContainer({
  code = 'CWYD62QI',
  placement = 'tinybotsnet'
}: {
  code: string
  placement: string
  minSize?: number
  maxSize?: number
  override?: false
}) {
  const pathname = usePathname()
  const reference = useRef<HTMLInputElement | undefined>()

  const mountAd = () => {
    if (isMounted) return

    isMounted = true
    setTimeout(() => {
      if (document.getElementById('carbonads')) {
        return
      }

      if (
        typeof reference === 'undefined' ||
        typeof reference.current === 'undefined' ||
        !reference ||
        !reference.current
      ) {
        return
      }
      reference.current.innerHTML = ''
      const s = document.createElement('script')
      s.id = '_carbonads_js'
      s.src = `//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}`
      reference.current.appendChild(s)
    }, 250)
  }

  useEffectOnce(() => {
    mountAd()
  })

  useEffect(() => {
    mountAd()

    return () => {
      var el = document.getElementById('carbonads')
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
        isMounted = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const classes = ['flex', 'justify-center', `w-full`]

  if (typeof window === 'undefined') {
    return null
  }

  return (
    <div
      // component-name={component}
      id="_adUnit"
      className={clsx(classes)}
      //@ts-ignore
      ref={reference}
    />
  )
}

export default React.memo(AdContainer)
