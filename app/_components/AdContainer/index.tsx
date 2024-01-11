'use client'

import React, { CSSProperties, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { debounce } from 'app/_utils/debounce'
import { useStore } from 'statery'
import { appInfoStore } from 'app/_store/appStore'

let minHeight: string | undefined = undefined

const refreshAd = debounce(() => {
  // @ts-ignore
  // eslint-disable-next-line no-undef
  _carbonads.refresh()
}, 250)

const mountAd = debounce(() => {
  setTimeout(() => {
    const isCarbonExist =
      document.querySelectorAll('div[id^="carbonads"]') || []

    if (isCarbonExist.length > 0) {
      minHeight = '164px'
      refreshAd()
      return
    }

    const outerDiv = document.querySelector('#carbon-container')
    const divElements = outerDiv?.querySelectorAll('div') ?? []

    if (divElements.length >= 1) {
      return
    }

    const hasAds = document.querySelector('_carbonads_js')

    if (hasAds) {
      return
    }

    const script = document.createElement('script')
    script.src =
      '//cdn.carbonads.com/carbon.js?serve=CWYD62QI&placement=tinybotsnet'
    script.id = '_carbonads_js'
    script.async = true

    document.querySelectorAll('#carbon-container')[0].appendChild(script)
  }, 0)
}, 250)

const CarbonAds = ({
  className,
  shouldRefresh,
  style
}: {
  className?: any
  shouldRefresh?: any
  style?: CSSProperties
}) => {
  const pathname = usePathname()
  const { adEventTimestamp } = useStore(appInfoStore)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const outerDiv = document.querySelector('#carbon-container')
    const divElements = outerDiv?.querySelectorAll('div') ?? []

    if (divElements.length >= 1) {
      return
    }

    mountAd()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const isCarbonExist =
        document.querySelectorAll('div[id^="carbonads"]') || []
      const hasAdScript = document.querySelector('#_carbonads_js')

      if (isCarbonExist.length > 0) {
        minHeight = '164px'
      } else if (!mounted && !hasAdScript) {
        mountAd()
        setMounted(true)
      }
    }, 150)

    return () => clearInterval(interval)
  }, [mounted, pathname])

  useEffect(() => {
    // @ts-ignore
    // eslint-disable-next-line no-undef
    const isCarbonExist =
      document.querySelectorAll('div[id^="carbonads"]') || []
    if (isCarbonExist.length > 0) {
      // @ts-ignore
      // eslint-disable-next-line no-undef
      _carbonads?.refresh()
    }
  }, [adEventTimestamp, pathname, shouldRefresh])

  const defaultStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    columnGap: '4px',
    rowGap: '8px'
  }

  return (
    <div
      id="carbon-container"
      className={className}
      style={{ ...defaultStyle, minHeight, ...style }}
    ></div>
  )
}

export default CarbonAds
