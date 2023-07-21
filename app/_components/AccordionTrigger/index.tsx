/* eslint-disable react/display-name */
import { IconChevronDown } from '@tabler/icons-react'
import React from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import clsx from 'clsx'

const AccordionTrigger = React.forwardRef(
  // @ts-ignore
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Header className="AccordionHeader">
      <Accordion.Trigger
        className={clsx('AccordionTrigger', className)}
        {...props}
        // @ts-ignore
        ref={forwardedRef}
      >
        {children}
        <IconChevronDown className="AccordionChevron" aria-hidden />
      </Accordion.Trigger>
    </Accordion.Header>
  )
)

export default AccordionTrigger
