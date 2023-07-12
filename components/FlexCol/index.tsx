import { CSSProperties, ReactNode } from 'react'

export default function FlexCol({
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
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        ...style
      }}
    >
      {children}
    </div>
  )
}
