import clsx from 'clsx'
import React from 'react'
import styles from './component.module.css'

interface MenuButtonProps {
  active?: boolean
  children: React.ReactNode
  title: string
  onClick(): void
}

const MenuButton = ({ active, children, onClick, title }: MenuButtonProps) => {
  return (
    <button
      className={clsx(
        styles.MenuButton,
        active && styles['MenuButton-isActive']
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

export default MenuButton
