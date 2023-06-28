import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import Panel from '../../UI/Panel'
import SectionTitle from '../../UI/SectionTitle'
import AdvancedOptionsPanel from '../AdvancedOptionsPanel'
import Img2ImgPanel from '../Img2ImgPanel'
import Uploader from '../Uploader'
import { clearCanvasStore, setI2iUploaded } from '../../../store/canvasStore'
import { SourceProcessing } from '../../../utils/promptUtils'
import WarningPanel from '../WarningPanel'
import { nearestWholeMultiple } from '../../../utils/imageUtils'
import Editor from '../../Fabric/Editor'
import Head from 'next/head'

interface LiProps {
  active?: boolean
}

const removeImageCanvasData = {
  canvasData: null,
  maskData: null,
  imageType: '',
  source_image: '',
  source_mask: '',
  source_processing: SourceProcessing.Prompt
}

const NavItem = styled.li<LiProps>`
  color: var(--nav-link-normal);
  cursor: pointer;

  &:hover {
    color: var(--nav-link-active);
    border-bottom: 2px solid var(--nav-link-active);
  }

  ${(props) =>
    props.active &&
    `
    color: var(--nav-link-active);
    border-bottom: 2px solid var(--nav-link-active);
  `}
`

interface Props {
  input: any
  setInput: any
}

const OptionsPanel = ({ input, setInput }: Props) => {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState('advanced')

  useEffect(() => {
    const { panel } = router.query

    if (panel === 'inpainting') {
      setActiveNav('inpainting')
    } else if (panel === 'draw') {
      setActiveNav('draw')
    } else if (panel === 'img2img') {
      setActiveNav('img2img')
    } else {
      setActiveNav('advanced')
    }
  }, [router.query])

  const handleSaveAction = async (data: any) => {
    clearCanvasStore() // Handle bug where previous canvas may show up.
    const newBase64String = `data:${data.imageType};base64,${data.source_image}`

    setI2iUploaded({
      base64String: newBase64String,
      height: data.height,
      width: data.width
    })

    setInput({
      height: nearestWholeMultiple(data.height),
      width: nearestWholeMultiple(data.width),
      orientationType: 'custom',
      imageType: data.imageType,
      source_image: data.source_image,
      source_mask: '',
      source_processing: 'inpainting'
    })
  }

  return (
    <Panel>
      <SectionTitle>
        {activeNav === 'advanced' && `Advanced Options`}
        {activeNav === 'img2img' && `Img2Img (source file)`}
        {/* {activeNav === 'draw' && `Draw (img2img)`} */}
        {activeNav === 'inpainting' &&
          `Inpainting / Outpainting / Img2Img Mask`}
      </SectionTitle>
      <ul className="flex flex-row gap-1 md:gap-4 mb-3 text-sm md:text-base">
        <NavItem
          active={activeNav === 'advanced'}
          onClick={() => {
            setActiveNav('advanced')
            router.push(`/`)
          }}
        >
          [ advanced ]
        </NavItem>
        <NavItem
          active={activeNav === 'img2img'}
          onClick={() => {
            router.push(`?panel=img2img`)
            setActiveNav('img2img')
          }}
        >
          [ img2img ]
        </NavItem>
        {/* <NavItem
          active={activeNav === 'draw'}
          onClick={() => {
            router.push(`?panel=draw`)
            setActiveNav('draw')
          }}
        >
          [ draw ]
        </NavItem> */}
        <NavItem
          active={activeNav === 'inpainting'}
          onClick={() => {
            router.push(`?panel=inpainting`)
            setActiveNav('inpainting')
          }}
        >
          [ inpainting / outpainting ]
        </NavItem>
      </ul>
      {activeNav === 'advanced' && (
        <AdvancedOptionsPanel input={input} setInput={setInput} />
      )}
      {activeNav === 'img2img' &&
        input.source_processing === SourceProcessing.InPainting && (
          <WarningPanel
            panelType="inpainting"
            handleRemoveClick={() => {
              clearCanvasStore()
              setInput({ ...removeImageCanvasData })
            }}
          />
        )}
      {activeNav === 'img2img' &&
        input.source_processing !==
          (SourceProcessing.InPainting || SourceProcessing.OutPainting) && (
          <Img2ImgPanel
            input={input}
            setInput={setInput}
            saveForInpaint={handleSaveAction}
          />
        )}

      {activeNav === 'inpainting' &&
        input.source_image &&
        (input.source_processing === SourceProcessing.InPainting ||
          input.source_mask) && (
          <>
            <Head>
              <title>Inpainting - ArtBot for Stable Diffusion</title>
              <meta name="twitter:title" content="ArtBot - Inpainting" />
            </Head>
            <div className="text-sm mb-2">
              Want to try outpainting? A few quick tips:
              <ul>
                <li>- Upload an image</li>
                <li>- Resize and move image around canvas</li>
                <li>
                  - Paint over checkerboard to include all areas you want to
                  outpaint.
                </li>
              </ul>
            </div>
            <Editor
              canvasId="inpainting-canvas"
              canvasType="inpainting"
              setInput={setInput}
              source_image={input.source_image}
              handleRemoveClick={() => {
                clearCanvasStore()
                setInput({
                  ...removeImageCanvasData
                })
              }}
            />
          </>
        )}

      {activeNav === 'inpainting' &&
        !input.source_image &&
        input.source_processing !== SourceProcessing.InPainting && (
          <>
            <Head>
              <title>Inpainting - ArtBot for Stable Diffusion</title>
            </Head>
            <Uploader handleSaveImage={handleSaveAction} type="inpainting" />
          </>
        )}

      {activeNav === 'inpainting' &&
        input.source_image &&
        input.source_processing === SourceProcessing.Img2Img && (
          <>
            <Head>
              <title>Inpainting - ArtBot for Stable Diffusion</title>
            </Head>
            <WarningPanel
              panelType="img2img"
              handleRemoveClick={() => {
                clearCanvasStore()
                setInput({
                  ...removeImageCanvasData
                })
              }}
            />
          </>
        )}
    </Panel>
  )
}

export default OptionsPanel
