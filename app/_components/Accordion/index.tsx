import React, { Children, useState } from 'react'

const Accordion = ({
  children
}: {
  children: React.ReactNode | React.ReactNode[]
}) => {
  const [activeIndex, setActiveIndex] = useState(null)

  const handleItemClick = (index) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index))
  }

  return (
    <div className="accordion">
      {Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen: activeIndex === index,
            onClick: () => handleItemClick(index)
          })
        }
        return child
      })}
    </div>
  )
}

export default Accordion
