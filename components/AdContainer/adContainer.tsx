import React, { CSSProperties, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { setAdHidden } from 'store/appStore'

let initPageLoad = true

const CarbonAds = ({
  className,
  style
}: {
  className?: any
  style?: CSSProperties
}) => {
  const pathname = usePathname()

  const mountAd = () => {
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
    }
  }

  useEffect(() => {
    mountAd()
  }, [pathname])

  return <div id="carbon-container" className={className} style={style}></div>
}

export default CarbonAds
