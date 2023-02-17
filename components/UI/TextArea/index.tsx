// Via: https://github.com/albertcito/textarea-autosize-reactjs

import React, {
  useRef,
  useEffect,
  forwardRef,
  TextareaHTMLAttributes
} from 'react'
import autosize from 'autosize'
import styles from './textarea.module.css'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>
type RefType = HTMLTextAreaElement | null

const passRef = (
  ref: React.ForwardedRef<RefType>,
  node: HTMLTextAreaElement | null
) => {
  if (ref) {
    if (typeof ref === 'function') {
      ref(node)
    } else {
      ref.current = node
    }
  }
}

const TextAreaAutoSize = (
  props: TextareaProps,
  ref: React.ForwardedRef<RefType>
) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current)
    }
  }, [])

  return (
    <textarea
      className={styles['styled-textarea']}
      {...props}
      ref={(node) => {
        textareaRef.current = node
        passRef(ref, node)
      }}
    />
  )
}

const TextArea = forwardRef<RefType, TextareaProps>(TextAreaAutoSize)

export default TextArea
