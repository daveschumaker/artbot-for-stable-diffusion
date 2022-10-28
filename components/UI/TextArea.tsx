// Via: https://github.com/albertcito/textarea-autosize-reactjs

import React, {
  useRef,
  useEffect,
  forwardRef,
  TextareaHTMLAttributes
} from 'react'
import autosize from 'autosize'
import styled from 'styled-components'

const StyledTextArea = styled.textarea`
  background-color: ${(props) => props.theme.inputBackground};
  border: 1px solid ${(props) => props.theme.inputColor};
  border-radius: 4px;
  color: ${(props) => props.theme.inputColor};
  font-size: 16px;
  min-height: 120px;
`

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
    <StyledTextArea
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
