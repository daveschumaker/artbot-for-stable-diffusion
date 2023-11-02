import React, { CSSProperties } from 'react'
import Overlay from 'app/_components/Overlay'

const DropDown = ({
  children,
  handleClose = () => {}
}: {
  children: React.ReactNode
  handleClose(): void
}) => {
  const inlineStyles: CSSProperties = {
    border: '1px solid #CBD5E0',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    position: 'absolute',
    marginBottom: '8px',
    justifyContent: 'space-between',
    padding: '8px',
    boxShadow:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 30,
    top: '42px',
    left: 0,
    minWidth: '200px'
  }

  return (
    <>
      <Overlay disableBackground handleClose={handleClose} />
      <div style={inlineStyles}>{children}</div>
    </>
  )
}

export default DropDown
