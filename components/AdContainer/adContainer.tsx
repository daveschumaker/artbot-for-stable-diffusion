import React, { CSSProperties, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { setAdHidden } from 'store/appStore'
import { debounce } from 'utils/debounce'

let initPageLoad = true

const mountAd = debounce(() => {
  setTimeout(() => {
    const isCarbonExist = document.querySelector('#carbonads')

    if (!!isCarbonExist) {
      // @ts-ignore
      // eslint-disable-next-line no-undef
      _carbonads.refresh()
      return
    }

    const script = document.createElement('script')
    script.src =
      '//cdn.carbonads.com/carbon.js?serve=CWYD62QI&placement=tinybotsnet'
    script.id = '_carbonads_js'
    script.async = true

    document.querySelectorAll('#carbon-container')[0].appendChild(script)
  }, 250)

  if (initPageLoad) {
    setTimeout(() => {
      const divElement = document.getElementById('carbon-container')
      const rect = divElement?.getBoundingClientRect()
      const divHeight = rect?.height
      initPageLoad = false

      if (!divHeight) {
        setAdHidden(true)
      }
    }, 850)

    // Handle weird race condition
    setTimeout(() => {
      const divElement = document.getElementById('carbon-container')
      const rect = divElement?.getBoundingClientRect()
      const divHeight = rect?.height
      initPageLoad = false

      if (divHeight) {
        setAdHidden(false)
      }
    }, 1500)

    // Handle weird race condition
    setTimeout(() => {
      const divElement = document.getElementById('carbon-container')
      const rect = divElement?.getBoundingClientRect()
      const divHeight = rect?.height
      initPageLoad = false

      if (divHeight) {
        setAdHidden(false)
      }
    }, 2500)

    // Handle weird race condition
    setTimeout(() => {
      const divElement = document.getElementById('carbon-container')
      const rect = divElement?.getBoundingClientRect()
      const divHeight = rect?.height
      initPageLoad = false

      if (divHeight) {
        setAdHidden(false)
      }
    }, 5000)
  }
}, 500)

const CarbonAds = ({
  className,
  style
}: {
  className?: any
  style?: CSSProperties
}) => {
  const pathname = usePathname()

  useEffect(() => {
    mountAd()
  }, [pathname])

  return <div id="carbon-container" className={className} style={style}></div>
}

export default CarbonAds
