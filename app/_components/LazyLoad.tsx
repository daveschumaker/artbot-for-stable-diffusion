'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

interface LazyLoadProps {
  children: ReactNode
  // How far outside the viewport, in pixels, to start rendering.
  offset?: number
}

// Renders children once they come near the viewport, then keeps them rendered.
export default function LazyLoad({ children, offset = 200 }: LazyLoadProps) {
  const placeholder = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = placeholder.current

    if (visible || !element) {
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: `${offset}px` }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [offset, visible])

  if (visible) {
    return <>{children}</>
  }

  // Gallery tiles are roughly square, so this keeps the layout close to final.
  return (
    <div
      ref={placeholder}
      data-lazy-placeholder
      style={{ aspectRatio: '1 / 1', width: '100%' }}
    />
  )
}
