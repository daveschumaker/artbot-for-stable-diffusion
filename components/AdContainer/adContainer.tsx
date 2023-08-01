import clsx from 'clsx'
import React, { useEffect, useRef } from 'react'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import { usePathname } from 'next/navigation'
import { appInfoStore, setAdHidden } from 'store/appStore'
import { useStore } from 'statery'

let isMounted = false
let pageTransition = false

function AdContainer({
  className,
  code = 'CWYD62QI',
  id = 'carbonads',
  placement = 'tinybotsnet'
}: {
  className?: any
  code: string
  id?: string
  placement: string
  minSize?: number
  maxSize?: number
  override?: false
}) {
  const { adHidden } = useStore(appInfoStore)
  const pathname = usePathname()
  const reference = useRef<HTMLInputElement | undefined>()

  const mountAd = () => {
    if (isMounted) return
    if (adHidden) return

    isMounted = true

    setTimeout(() => {
      if (document.getElementById(id)) {
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

    setTimeout(() => {
      var el = document.getElementById(id)

      if (!el && !pageTransition) {
        console.log(`__AD NOT FOUND`)
        setAdHidden(true)
        isMounted = false
      }
    }, 1500)
  }

  useEffectOnce(() => {
    mountAd()
  })

  useEffect(() => {
    mountAd()

    // This attempts to avoid a race condition where ad check is fired while page is transitioning
    pageTransition = true

    setTimeout(() => {
      pageTransition = false
    }, 2500)

    return () => {
      var el = document.getElementById(id)
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
      }

      setTimeout(() => {
        isMounted = false
      }, 250)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const classes = ['flex', 'justify-center', `w-full`]

  if (typeof window === 'undefined') {
    return null
  }

  if (adHidden) {
    return null
  }

  return (
    <div
      // component-name={component}
      id="_adUnit"
      className={clsx(classes, className)}
      //@ts-ignore
      ref={reference}
    />
  )
}

export default React.memo(AdContainer)
