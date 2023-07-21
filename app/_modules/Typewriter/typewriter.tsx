import React from 'react'
import PropTypes from 'prop-types'
import styles from './typewriter.module.css'

function Typewriter({
  text,
  speed,
  eraseSpeed,
  cursor,
  typingDelay,
  eraseDelay,
  onEraseDone,
  onEraseDelay,
  ...otherProps
}) {
  const [currentText, setCurrentText] = React.useState('')
  const [__timeout, set__Timeout] = React.useState(null)
  const [isTyping, setIsTyping] = React.useState(true)
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    startTyping()
    setTimeout(onEraseDelay, 50)

    return () => {
      __timeout && clearTimeout(__timeout)
    }
  }, [])

  React.useEffect(() => {
    let rawText = getRawText()[currentIndex]
    if (isTyping) {
      if (currentText.length < rawText.length) {
        const randomSpeed = Math.floor(Math.random() * (60 - 25 + 1)) + 25
        set__Timeout(setTimeout(type, randomSpeed))
      } else {
        setIsTyping(false)
        // setTimeout(onEraseDelay, 50)
        set__Timeout(setTimeout(erase, eraseDelay))
      }
    } else {
      if (currentText.length === 0) {
        const textArray = getRawText()
        let index = currentIndex + 1 === textArray.length ? 0 : currentIndex + 1
        if (index === currentIndex) {
          setIsTyping(true)
          setTimeout(startTyping, typingDelay)
        } else {
          setTimeout(() => setCurrentIndex(index), typingDelay)
        }
      } else {
        set__Timeout(setTimeout(erase, eraseSpeed))
      }
    }
    return () => {
      __timeout && clearTimeout(__timeout)
    }
  }, [currentText])

  React.useEffect(() => {
    if (!isTyping) {
      setIsTyping(true)
      startTyping()
    }
    return () => {
      __timeout && clearTimeout(__timeout)
    }
  }, [currentIndex])

  function getRawText() {
    return typeof text === 'string' ? [text] : [...text]
  }

  function startTyping() {
    const randomSpeed = Math.floor(Math.random() * (60 - 25 + 1)) + 25

    set__Timeout(
      setTimeout(() => {
        onEraseDelay()
        type()
      }, randomSpeed)
    )
  }

  function type() {
    let rawText = getRawText()[currentIndex]

    if (currentText.length < rawText.length) {
      let displayText = rawText.substr(0, currentText.length + 1)
      setCurrentText(displayText)
    }
  }

  function erase() {
    let index = currentIndex
    if (currentText.length !== 0) {
      let displayText = currentText.substr(
        -currentText.length,
        currentText.length - 1
      )
      setCurrentText(displayText)
      if (displayText === '') {
        setTimeout(() => {
          onEraseDone()
        }, 50)
      }
    } else {
      const textArray = getRawText()
      index = index + 1 === textArray.length ? 0 : index + 1
      setCurrentIndex(index)
    }
  }

  return (
    <div className={styles.Typewriter} {...otherProps}>
      <span className={styles.Typewriter__text}>
        {'> '} {currentText}
        <span className={styles.Typewriter__cursor}>{cursor}</span>
      </span>
    </div>
  )
}

Typewriter.propTypes = {
  speed: PropTypes.number.isRequired,
  eraseSpeed: PropTypes.number.isRequired,
  typingDelay: PropTypes.number.isRequired,
  eraseDelay: PropTypes.number.isRequired,
  cursor: PropTypes.string,
  text: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string
  ]).isRequired
}

Typewriter.defaultProps = {
  speed: 500,
  eraseSpeed: 400,
  typingDelay: 2500,
  eraseDelay: 5000,
  cursor: '|'
}

export default Typewriter
