import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import Panel from '../../UI/Panel'
import SectionTitle from '../../UI/SectionTitle'
import AdvancedOptionsPanel from '../AdvancedOptionsPanel'
import Img2ImgPanel from '../Img2ImgPanel'
// import PainterPanel from '../PainterPanel'
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

const NavItem = styled.li<LiProps>`
  color: ${(props) => props.theme.navLinkNormal};
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.navLinkActive};
    border-bottom: 2px solid ${(props) => props.theme.navLinkActive};
  }

  ${(props) =>
    props.active &&
    `
    color: ${props.theme.navLinkActive};
    border-bottom: 2px solid  ${props.theme.navLinkActive};
  `}
`

interface Props {
  handleChangeInput: any
  handleImageUpload: any
  handleOrientationSelect: any
  input: any
  setInput: any
  setHasValidationError: any
}

const OptionsPanel = ({
  handleChangeInput,
  handleImageUpload,
  handleOrientationSelect,
  input,
  setInput,
  setHasValidationError
}: Props) => {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState('advanced')

  useEffect(() => {
    const { panel } = router.query

    if (panel === 'inpainting') {
      setActiveNav('inpainting')
    } else if (panel === 'painter') {
      // setActiveNav('painter')
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
        {activeNav === 'img2img' && `img2img upload`}
        {/* {activeNav === 'painter' && `Painter`} */}
        {activeNav === 'inpainting' && `Inpainting`}
      </SectionTitle>
      <ul className="flex flex-row gap-2 md:gap-8 mb-3 text-sm md:text-base">
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
          active={activeNav === 'painter'}
          onClick={() => {
            router.push(`?panel=painter`)
            setActiveNav('painter')
          }}
        >
          [ painter ]
        </NavItem> */}
        <NavItem
          active={activeNav === 'inpainting'}
          onClick={() => {
            router.push(`?panel=inpainting`)
            setActiveNav('inpainting')
          }}
        >
          [ inpainting ]
        </NavItem>
      </ul>
      {activeNav === 'advanced' && (
        <AdvancedOptionsPanel
          handleChangeInput={handleChangeInput}
          handleImageUpload={handleImageUpload}
          handleOrientationSelect={handleOrientationSelect}
          input={input}
          setInput={setInput}
          setHasValidationError={setHasValidationError}
        />
      )}
      {activeNav === 'img2img' &&
        input.source_processing === SourceProcessing.InPainting && (
          <WarningPanel
            panelType="inpainting"
            handleRemoveClick={() => {
              clearCanvasStore()
              setInput({
                imageType: '',
                source_image: '',
                source_mask: '',
                source_processing: SourceProcessing.Prompt
              })
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

      {/* {activeNav === 'painter' &&
        input.source_image &&
        input.source_processing === SourceProcessing.InPainting && (
          <WarningPanel
            panelType="inpainting"
            handleRemoveClick={() => {
              clearCanvasStore()
              setInput({
                imageType: '',
                source_image: '',
                source_mask: '',
                source_processing: SourceProcessing.Prompt
              })
            }}
          />
        )} */}

      {/* {activeNav === 'painter' &&
        input.source_processing !== SourceProcessing.InPainting && (
          <PainterPanel setActiveNav={setActiveNav} setInput={setInput} />
        )} */}

      {activeNav === 'inpainting' &&
        input.source_image &&
        (input.source_processing === SourceProcessing.InPainting ||
          input.source_mask) && (
          <>
            <Head>
              <title>Inpainting - ArtBot for Stable Diffusion</title>
            </Head>
            {/* <InpaintingPanel
              input={input}
              setInput={setInput}
              handleRemoveClick={() => {
                clearCanvasStore()
                setInput({
                  imageType: '',
                  source_image: '',
                  source_mask: '',
                  source_processing: SourceProcessing.Prompt
                })
              }}
            /> */}
            <Editor
              setInput={setInput}
              handleRemoveClick={() => {
                clearCanvasStore()
                setInput({
                  imageType: '',
                  source_image: '',
                  source_mask: '',
                  source_processing: SourceProcessing.Prompt
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
                  imageType: '',
                  source_image: '',
                  source_mask: '',
                  source_processing: SourceProcessing.Prompt
                })
              }}
            />
          </>
        )}
    </Panel>
  )
}

export default OptionsPanel
