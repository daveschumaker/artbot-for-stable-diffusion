import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { Button } from '../../UI/Button'
import Image from '../../Image'
import TrashIcon from '../../icons/TrashIcon'
import { SourceProcessing } from '../../../utils/promptUtils'
import Uploader from '../Uploader'
import PhotoUpIcon from '../../icons/PhotoUpIcon'
import Head from 'next/head'

const Section = styled.div`
  padding-top: 16px;

  &:first-child {
    padding-top: 0;
  }
`

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

  const saveImage = ({
    imageType = '',
    source_image = '',
    height = 512,
    width = 512
  }) => {
    setInput({
      img2img: true,
      imageType,
      height,
      width,
      source_image,
      source_processing: SourceProcessing.Img2Img
    })
  }

  const handleInpaintClick = useCallback(() => {
    saveForInpaint({
      ...input
    })

    router.push('?panel=inpainting')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  return (
    <div>
      <Head>
        <title>img2img - ArtBot for Stable Diffusion</title>
      </Head>
      <Section>
        {!input.source_image && (
          <Uploader handleSaveImage={saveImage} type="img2img" />
        )}
        {input.source_image && (
          <>
            <div className="flex flex-row mb-4 gap-2">
              <Button
                btnType="secondary"
                onClick={() =>
                  setInput({
                    img2img: false,
                    imageType: '',
                    height: 512,
                    width: 512,
                    source_image: '',
                    source_processing: SourceProcessing.Prompt
                  })
                }
              >
                <TrashIcon />
                Clear
              </Button>
              <Button onClick={handleInpaintClick}>
                <PhotoUpIcon />
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
