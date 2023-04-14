import clsx from 'clsx'
import React, { useRef } from 'react'
import { useEffectOnce } from '../../hooks/useEffectOnce'

function AdContainer({
  component = '',
  code = 'CWYD62QI',
  placement = 'tinybotsnet'
}: {
  code: string
  component: string
  placement: string
  minSize?: number
  maxSize?: number
  override?: false
}) {
  const reference = useRef<HTMLInputElement | undefined>()

  useEffectOnce(() => {
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
  })

  const classes = ['flex', 'justify-center', 'my-2', `w-full`]

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
