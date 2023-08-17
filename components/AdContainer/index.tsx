'use client'

import React, { CSSProperties, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { debounce } from 'utils/debounce'

let minHeight: string | undefined = undefined

const refreshAd = debounce(() => {
  // @ts-ignore
  // eslint-disable-next-line no-undef
  _carbonads.refresh()
}, 450)

const mountAd = debounce(() => {
  setTimeout(() => {
    const isCarbonExist = document.querySelector('[id^="carbonads"]')

    if (isCarbonExist) {
      minHeight = '164px'
      refreshAd()
      return
    }

    const outerDiv = document.querySelector('#carbon-container')
    const divElements = outerDiv?.querySelectorAll('div') ?? []

    if (divElements.length >= 1) {
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

  useEffect(() => {
    const outerDiv = document.querySelector('#carbon-container')
    const divElements = outerDiv?.querySelectorAll('div') ?? []

    if (divElements.length >= 1) {
      return
    }

    mountAd()
  }, [])

  useEffect(() => {
    mountAd()

    const interval = setInterval(() => {
      const isCarbonExist = document.querySelector('#carbonads')

      if (isCarbonExist) {
        minHeight = '164px'
      }
    }, 250)

    return () => clearInterval(interval)
  }, [pathname])

  useEffect(() => {
    // @ts-ignore
    // eslint-disable-next-line no-undef
    const isCarbonExist = document.querySelector('#carbonads')
    if (isCarbonExist) {
      // @ts-ignore
      // eslint-disable-next-line no-undef
      _carbonads?.refresh()
    }
  }, [shouldRefresh])

  return (
    <div
      id="carbon-container"
      className={className}
      style={{ minHeight, ...style }}
    ></div>
  )
}

export default CarbonAds
