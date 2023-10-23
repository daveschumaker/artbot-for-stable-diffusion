import React, { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from 'app/_components/Button'
import Image from 'app/_modules/Image'
import { SourceProcessing } from 'app/_utils/promptUtils'
import Head from 'next/head'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'
import { setI2iUploaded } from 'app/_store/canvasStore'
import Section from 'app/_components/Section'
import Uploader from 'app/_modules/Uploader'
import { IconPhotoUp, IconTrash } from '@tabler/icons-react'
import Samplers from 'app/_data-models/Samplers'
import { useInput } from 'app/_modules/InputProvider/context'

interface Props {
  handleChangeInput: any
  handleImageUpload: any
  handleOrientationSelect: any
  saveForInpaint: any
}

const Img2ImgPanel = ({ saveForInpaint }: Props) => {
  const { input, setInput } = useInput()
  const router = useRouter()

  const handleSaveImage = ({
    imageType = '',
    source_image = '',
    height = 512,
    width = 512
  }) => {
    PromptInputSettings.set('orientationType', 'custom')
    PromptInputSettings.set('height', height)
    PromptInputSettings.set('width', width)

    let sampler = input.sampler
    if (!Samplers.validSamplersForImg2Img().includes(sampler)) {
      sampler = 'k_dpm_2'
    }

    setInput({
      img2img: true,
      imageType,
      height,
      width,
      orientationType: 'custom',
      sampler,
      source_image,
      source_processing: SourceProcessing.Img2Img
    })

    // Attempt to store image between sessions.
    localStorage.setItem('img2img_base64', source_image)

    setI2iUploaded({
      base64String: source_image,
      height,
      width
    })
  }

  const handleInpaintClick = useCallback(() => {
    saveForInpaint({
      ...input
    })

    localStorage.removeItem('img2img_base64')
    router.push('?panel=inpainting')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  return (
    <div>
      <Head>
        <title>img2img - ArtBot for Stable Diffusion</title>
        <meta
          name="twitter:title"
          content="img2img - ArtBot for Stable Diffusion"
        />
      </Head>
      <Section>
        {!input.source_image && (
          <Uploader handleSaveImage={handleSaveImage} type="img2img" />
        )}
        {input.source_image && (
          <>
            <div className="flex flex-row mb-4 gap-2">
              <Button
                theme="secondary"
                onClick={() => {
                  setInput({
                    img2img: false,
                    imageType: '',
                    height: 512,
                    width: 512,
                    source_image: '',
                    source_processing: SourceProcessing.Prompt
                  })
                  localStorage.removeItem('img2img_base64')
                }}
              >
                <IconTrash />
                Clear
              </Button>
              <Button onClick={handleInpaintClick}>
                <IconPhotoUp />
                Use Inpaint
              </Button>
            </div>
            <div className="flex flex-row align-top justify-around w-full mx-auto">
              <Image
                base64String={input.source_image}
                alt="Test"
                imageType={input.imageType}
                height={input.height}
                width={input.width}
                unsetDivDimensions
              />
            </div>
          </>
        )}
      </Section>
    </div>
  )
}

export default Img2ImgPanel
