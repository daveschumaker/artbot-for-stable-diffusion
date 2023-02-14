import clsx from 'clsx'
import React, { useRef } from 'react'
import { useEffectOnce } from '../../hooks/useEffectOnce'

function AdContainer({
  code = 'CWYD62QI',
  placement = 'tinybotsnet',
  minSize = 1440,
  maxSize = Infinity,
  override = false
}: {
  code: string
  placement: string
  minSize?: number
  maxSize?: number
  override?: false
}) {
  const reference = useRef<HTMLInputElement | undefined>()

  useEffectOnce(() => {
    if (
      typeof reference === 'undefined' ||
      typeof reference.current === 'undefined'
    ) {
      return
    }

    reference.current.innerHTML = ''
    const s = document.createElement('script')
    s.id = '_carbonads_js'
    s.src = `//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}`
    reference.current.appendChild(s)

    //@ts-ignore
  }, [])

  const classes = ['flex', 'justify-center', 'my-2', `w-full`]

  if (typeof window !== 'undefined') {
    if (!override && window.innerWidth < minSize) {
      return null
    }
    if (!override && window.innerWidth > maxSize) {
      return null
    }
  } else {
    return null
  }

  return (
    <div
      id="_adUnit"
      className={clsx(classes)}
      //@ts-ignore
      ref={reference}
    />
  )
}

export default AdContainer
