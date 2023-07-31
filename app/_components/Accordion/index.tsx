import React, { Children, useState } from 'react'

const Accordion = ({
  children,
  forceOpen
}: {
  children: React.ReactNode | React.ReactNode[]
  forceOpen?: boolean
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleItemClick = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index))
  }

  return (
    <div className="accordion">
      {Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            //@ts-ignore
            isOpen: forceOpen || activeIndex === index,
            onClick: () => handleItemClick(index)
          })
        }
        return child
      })}
    </div>
  )
}

export default Accordion
