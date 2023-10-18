import { CSSProperties, ReactNode } from 'react'

export default function FlexRow({
  children,
  className,
  gap = 0,
  justifyContent,
  pb = 0,
  mt = 0,
  style = {}
}: {
  children: ReactNode
  className?: string
  gap?: number
  justifyContent?: string
  mt?: number
  pb?: number
  style?: CSSProperties
}) {
  const defaultStyleObj: CSSProperties = {
    alignItems: 'center',
    columnGap: gap ? `${gap}px` : undefined,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: justifyContent ? justifyContent : undefined,
    marginTop: mt ? `${mt}px` : undefined,
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
