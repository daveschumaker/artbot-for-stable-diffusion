/**
 * This is a functional component named ModalContentWrapper.
 * It uses the custom hook useContentHeight to get the height of the content.
 *
 * @param {Object} props - The properties passed to this component.
 * @param {Function} props.getContentHeight - This function is passed from the parent component.
 * It is used to pass the height of the content back to the parent.
 *
 * The component uses React's useEffect hook to call getContentHeight with the height of the content
 * whenever the content's height changes or the getContentHeight function changes.
 *
 * useContentHeight is a custom hook that returns an array containing a reference to the content (contentRef)
 * and the current height of the content (height).
 *
 * The contentRef is used to get a reference to the div containing the content. This is done by passing it to the ref prop of the div.
 *
 * The height is then passed to the getContentHeight function which is called inside the useEffect hook.
 * This ensures that whenever the height of the content changes, the new height is passed back to the parent component.
 *
 * The component returns a div containing the content. The div uses the contentRef to get a reference to itself.
 */

import React, { useEffect } from 'react'
import useContentHeight from './useContentHeight'

interface Props {
  getContentHeight?: (height: number) => any
  children: React.ReactNode
  style?: React.CSSProperties
}

export default function ModalContentWrapper({
  getContentHeight = () => {},
  children,
  style
}: Props) {
  const [contentRef, height]: any = useContentHeight()

  useEffect(() => {
    getContentHeight(height)
  }, [getContentHeight, height])

  return (
    <div
      id="modal-content-wrapper"
      ref={contentRef}
      style={{
        margin: '0 auto',
        overflowY: 'auto',
        width: '100%',
        ...style
      }}
    >
      {children}
    </div>
  )
}
