import React, { Children, useState } from 'react'

/** Props injected into each child item (e.g. AccordionItem). */
interface AccordionChildProps {
  isOpen?: boolean
  onClick?: () => void
}

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
        if (React.isValidElement<AccordionChildProps>(child)) {
          return React.cloneElement(child, {
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
