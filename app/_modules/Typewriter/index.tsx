/* eslint-disable @next/next/no-img-element */
import Typewriter from './typewriter'
import styles from './typewriter.module.css'
import { useState } from 'react'

import image1 from './images/astronaut.jpg'
import image2 from './images/amazon.jpg'
import image3 from './images/robocop.jpg'
import image4 from './images/daftpunk.jpg'
import image5 from './images/mario.jpg'
import image6 from './images/cabin.jpg'

const prompts = [
  'An astronaut resting on Mars in a beach chair',
  'A high tech solarpunk utopia in the Amazon rainforest with technology and nature mixed together',
  'Cute 3D render of RoboCop',
  'Daft Punk in the style of a woodblock print',
  'Beautiful painting of Mario and Luigi eating ice cream on a park bench',
  'Mountain chalet covered in snow, foggy, sunrise, sharp details, sharp focus, elegant, highly detailed, illustration, by Jordan Grimmer and Greg Rutkowski'
]

const images = [image1, image2, image3, image4, image5, image6]

// function shuffleArray(array: Array<string>) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1))
//     ;[array[i], array[j]] = [array[j], array[i]]
//   }
//   return array
// }

export default function PromptTypewriter() {
  const [isHidden, setIsHidden] = useState(true)
  const [promptIndex, setPromptIndex] = useState(0)

  const handleImageChange = () => {
    setIsHidden(true)

    setTimeout(() => {
      setIsHidden(false)
    }, 1000)
  }

  return (
    <div className={styles.TypeWriterWrapper}>
      <div className={styles.TextWrapper}>
        <Typewriter
          text={prompts[promptIndex]}
          onEraseDelay={() => {
            handleImageChange()
          }}
          onEraseDone={() => {
            let updatedPrompt = promptIndex + 1

            if (updatedPrompt > prompts.length - 1) {
              updatedPrompt = 0
            }

            setIsHidden(true)
            setTimeout(() => {
              setPromptIndex(updatedPrompt)
            }, 350)

            setTimeout(() => {
              // setIsHidden(false)
            }, 500)
          }}
          speed={80}
          eraseSpeed={15}
          eraseDelay={5000}
        />
      </div>
      <div className={styles.ImageWrapper}>
        <img
          alt=""
          className={`${styles['fade-in-out']} ${
            isHidden ? styles.hidden : ''
          }`}
          src={images[promptIndex].src}
          style={{ borderRadius: '4px', width: '100%' }}
        />
      </div>
    </div>
  )
}
