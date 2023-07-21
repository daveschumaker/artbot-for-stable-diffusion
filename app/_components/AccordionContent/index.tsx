/* eslint-disable react/display-name */
import * as Accordion from '@radix-ui/react-accordion'
import clsx from 'clsx'
import React from 'react'

const AccordionContent = React.forwardRef(
  // @ts-ignore
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={clsx('AccordionContent', className)}
      {...props}
      // @ts-ignore
      ref={forwardedRef}
    >
      <div className="AccordionContentText">{children}</div>
    </Accordion.Content>
  )
)

export default AccordionContent
