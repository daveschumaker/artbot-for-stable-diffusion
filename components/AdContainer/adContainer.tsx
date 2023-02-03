import clsx from 'clsx'
import { useRef } from 'react'
import { useEffectOnce } from '../../hooks/useEffectOnce'

export default function AdContainer({
  code,
  placement,
  minSize = 1440,
  maxSize = Infinity
}: {
  code: string
  placement: string
  minSize?: number
  maxSize?: number
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
    if (window.innerWidth < minSize) {
      return null
    }
    if (window.innerWidth > maxSize) {
      return null
    }
  } else {
    return null
  }

  return (
    <div
      className={clsx(classes)}
      //@ts-ignore
      ref={reference}
    />
  )
}
