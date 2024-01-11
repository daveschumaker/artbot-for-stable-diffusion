// Via: https://github.com/albertcito/textarea-autosize-reactjs

import TextareaAutosize from 'react-textarea-autosize'
import styles from './textarea.module.css'

const TextArea = (props: any) => {
  return (
    <TextareaAutosize
      className={styles['styled-textarea']}
      {...props}
      minRows={2}
    />
  )
}

export default TextArea
