import React, { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from 'components/UI/Button'
import Image from 'components/Image'
import { SourceProcessing } from 'utils/promptUtils'
import Head from 'next/head'
import PromptInputSettings from 'models/PromptInputSettings'
import { setI2iUploaded } from 'store/canvasStore'
import Section from 'app/_components/Section'
import Uploader from 'components/CreatePage/Uploader'
import { IconPhotoUp, IconTrash } from '@tabler/icons-react'

interface Props {
  handleChangeInput: any
  handleImageUpload: any
  handleOrientationSelect: any
  input: any
  saveForInpaint: any
  setInput: any
}

const Img2ImgPanel = ({ input, saveForInpaint, setInput }: Props) => {
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

    setInput({
      img2img: true,
      imageType,
      height,
      width,
      orientationType: 'custom',
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
              />
            </div>
          </>
        )}
      </Section>
    </div>
  )
}

export default Img2ImgPanel
