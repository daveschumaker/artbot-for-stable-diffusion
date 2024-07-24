import React from 'react'
import styles from './textButton.module.css' // Import the CSS module

interface Props {
  color?: string
  children: React.ReactNode
  disabled?: boolean
  onClick(): void
  tabIndex?: number
}

const TextButton = ({
  children,
  color,
  disabled = false,
  onClick,
  tabIndex
}: Props) => {
  const buttonClasses = [styles.textButton] // Initialize with the base class

  if (disabled) {
    buttonClasses.push(styles.disabled) // Add the disabled class if needed
  }

  return (
    <div
      className={buttonClasses.join(' ')} // Join the class names with a space
      style={{ color: color || 'inherit' }} // Use inline style for color
      onClick={disabled ? () => {} : onClick}
      tabIndex={tabIndex}
    >
      [ {children} ]
    </div>
  )
}

export default TextButton
