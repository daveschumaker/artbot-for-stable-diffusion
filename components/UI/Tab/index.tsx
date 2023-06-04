import React from 'react'
import styles from './tab.module.css'

const Tab = ({ activeTab, label, onClick }: any) => {
  const handleClick = () => {
    onClick(label)
  }

  let className = styles['tab-list-item']

  if (activeTab) {
    className += ' ' + styles['tab-list-active']
  }

  return (
    <li className={className} onClick={handleClick}>
      {label}
    </li>
  )
}

export default Tab
