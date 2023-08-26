import { CSSProperties, ReactNode } from 'react'

export default function FlexCol({
  children,
  className,
  gap = 0,
  pb = 0,
  style = {}
}: {
  children: ReactNode
  className?: string
  gap?: number
  pb?: number
  style?: CSSProperties
}) {
  const defaultStyleObj = {
    display: 'flex',
    rowGap: gap ? `${gap}px` : undefined,
    flexDirection: 'column',
    paddingBottom: pb ? `${pb}px` : undefined,
    width: '100%'
  }

  return (
    <div
      className={className}
      style={Object.assign({}, defaultStyleObj, style)}
    >
      {children}
    </div>
  )
}
