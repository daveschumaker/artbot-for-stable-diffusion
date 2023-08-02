import { CSSProperties, ReactNode } from 'react'

export default function FlexRow({
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
    alignItems: 'center',
    display: 'flex',
    columnGap: gap ? `${gap}px` : undefined,
    flexDirection: 'row',
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
