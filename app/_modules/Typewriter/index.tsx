/* eslint-disable @next/next/no-img-element */
import Typewriter from './typewriter'
import styles from './typewriter.module.css'
import { useEffect, useState } from 'react'

import image0 from './images/astronaut.jpg'
import image1 from './images/amazon.jpg'
import image2 from './images/himalayas.jpg'
import image3 from './images/cabin.jpg'
import image4 from './images/mechanical_brain.jpg'
import image5 from './images/cake.jpg'
import image6 from './images/dino.jpg'
import image7 from './images/food.jpg'

const images = [
  {
    file: image0,
    prompt: 'An astronaut resting on Mars in a beach chair',
    model: 'stable_diffusion'
  },
  {
    file: image1,
    prompt:
      'A high tech solarpunk utopia in the Amazon rainforest with technology and nature mixed together',
    model: 'stable_diffusion'
  },
  {
    file: image2,
    prompt: 'Himalayan mountains in the style of Moebius',
    model: 'stable_diffusion'
  },
  {
    file: image3,
    prompt:
      'Mountain chalet covered in snow, foggy, sunrise, sharp details, sharp focus, elegant, highly detailed, illustration, by Jordan Grimmer and Greg Rutkowski',
    model: 'stable_diffusion'
  },
  {
    file: image4,
    prompt: 'Model of a steampunk mechanical brain',
    model: 'stable_diffusion'
  },
  {
    file: image5,
    prompt: 'Geologic cross section of a birthday cake, colored pencil drawing',
    model: 'SDXL'
  },
  {
    file: image6,
    prompt:
      'Happy people toasting and having a fine dinner outside on a patio while a menacing dinosaur is in the background',
    model: 'SDXL'
  },
  {
    file: image7,
    prompt:
      'macro photograph of a brisket on a table with beer, in a blurred restaurant with depth of field, bokeh, soft diffused light, professional food photography',
    model: 'SDXL'
  }
]

function shuffleArray(array: any) {
  console.log('oiii')
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

shuffleArray(images)

export default function PromptTypewriter() {
  const [shuffled, setShuffled] = useState([])
  const [isHidden, setIsHidden] = useState(true)
  const [promptIndex, setPromptIndex] = useState(0)

  const handleImageChange = () => {
    setIsHidden(true)

    setTimeout(() => {
      setIsHidden(false)
    }, 1000)
  }

  useEffect(() => {
    shuffleArray(images)
    const update = [...images]

    //@ts-ignore
    setShuffled(update)
  }, [])

  if (shuffled.length === 0) {
    return null
  }

  return (
    <div className={styles.TypeWriterWrapper}>
      <div className={styles.TextWrapper}>
        <Typewriter
          // @ts-ignore
          text={shuffled[promptIndex].prompt}
          onEraseDelay={() => {
            handleImageChange()
          }}
          onEraseDone={() => {
            let updatedPrompt = promptIndex + 1

            if (updatedPrompt > images.length - 1) {
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
          eraseSpeed={15}
          eraseDelay={5000}
        />
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            position: 'absolute',
            bottom: 8,
            right: 8
          }}
        >
          created with{' '}
          <strong>
            {
              // @ts-ignore
              shuffled[promptIndex].model
            }
          </strong>
        </div>
      </div>
      <div className={styles.ImageWrapper}>
        <img
          alt=""
          className={`${styles['fade-in-out']} ${
            isHidden ? styles.hidden : ''
          }`}
          // @ts-ignore
          src={shuffled[promptIndex].file.src}
          style={{ borderRadius: '4px', width: '100%' }}
        />
      </div>
    </div>
  )
}
