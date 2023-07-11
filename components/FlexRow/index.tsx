import { CSSProperties, ReactNode } from 'react'

export default function FlexRow({
  children,
  className,
  style = {}
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={className}
      style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        ...style
      }}
    >
      {children}
    </div>
  )
}
