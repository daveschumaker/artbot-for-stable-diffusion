import React from 'react'
import clsx from 'clsx'
import styles from './accordionItem.module.css'
import { IconChevronRight } from '@tabler/icons-react'

const AccordionItem = ({
  title,
  isOpen,
  onClick,
  children
}: {
  title: any
  isOpen?: boolean
  onClick?: () => any
  children: React.ReactNode
}) => {
  return (
    <div className={clsx(styles['accordion-item'], isOpen && styles.open)}>
      <div className={styles['accordion-title']} onClick={onClick}>
        <div>
          <IconChevronRight
            className={`${styles['accordion-icon']} ${
              isOpen ? styles.rotated : ''
            }`}
          />
        </div>
        {title}
      </div>
      {isOpen && <div className={styles['accordion-content']}>{children}</div>}
    </div>
  )
}

export default AccordionItem
