import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './component.module.css'
import Overlay from 'app/_components/Overlay'
import useLockedBody from 'app/_hooks/useLockedBody'

export default function EscapedNavDropdown({
  content,
  menuIcon
}: {
  content: React.ReactNode
  menuIcon: React.ReactNode
}) {
  const hasEnteredContent = useRef(false) // Ref to track if mouse has entered the content
  const [, setLocked] = useLockedBody(false)
  const [isActive, setIsActive] = useState(false)

  // Handler for click event
  const handleClick = useCallback(() => {
    if (isActive) {
      setLocked(false)
      setIsActive(false)
    } else {
      setLocked(true)
      setIsActive(true)
    }
  }, [isActive, setLocked])

  const handleContentMouseOver = () => {
    hasEnteredContent.current = true
  }

  const handleContentMouseOut = () => {
    // Check if mouse has entered the content before deactivating
    if (hasEnteredContent.current) {
      // setIsActive(false)
      setLocked(false)
      hasEnteredContent.current = false // Reset the ref for next interaction
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsActive(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <>
      {isActive && (
        <Overlay
          handleClose={() => {
            setIsActive(false)
            setLocked(false)
          }}
          disableBackground
        />
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: '46px',
          marginLeft: '8px',
          position: 'relative'
        }}
      >
        <div
          className={styles.SvgWrapper}
          onClick={() => {
            if (isActive) return
            handleClick()
          }}
        >
          {menuIcon}
        </div>
        {isActive && (
          <div
            onMouseOver={handleContentMouseOver}
            onMouseOut={handleContentMouseOut}
            style={{
              height: 'auto',
              position: 'relative',
              zIndex: 'var(--zIndex-overNavBar)'
            }}
          >
            {content}
          </div>
        )}
      </div>
    </>
  )
}
