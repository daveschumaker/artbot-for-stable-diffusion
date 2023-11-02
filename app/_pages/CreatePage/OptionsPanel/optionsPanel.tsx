import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import Img2ImgPanel from '../Img2ImgPanel'
import Uploader from 'app/_modules/Uploader'
import { clearCanvasStore, setI2iUploaded } from 'app/_store/canvasStore'
import { SourceProcessing } from 'app/_utils/promptUtils'
import {
  inferMimeTypeFromBase64,
  nearestWholeMultiple
} from 'app/_utils/imageUtils'
import Head from 'next/head'
import styles from './component.module.css'
import clsx from 'clsx'
import AdvancedOptionsPanel from 'app/_modules/AdvancedOptionsPanel'
import WarningPanel from 'app/_modules/WarningPanel'
import Panel from 'app/_components/Panel'
import FlexRow from 'app/_components/FlexRow'
import { IconPointFilled } from '@tabler/icons-react'
import { useInput } from 'app/_modules/InputProvider/context'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'
import InpaintingEditor from 'app/_modules/InpaintingEditor'

const removeImageCanvasData = {
  canvasData: null,
  maskData: null,
  imageType: '',
  source_image: '',
  source_mask: '',
  source_processing: SourceProcessing.Prompt
}

interface Props {
  setErrors: any
}

const OptionsPanel = ({ setErrors }: Props) => {
  const { input, setInput } = useInput()

  const router = useRouter()
  const searchParams = useSearchParams()
  const panel = searchParams?.get('panel')

  const [activeNav, setActiveNav] = useState('advanced')

  useEffect(() => {
    if (panel === 'inpainting') {
      setActiveNav('inpainting')
    } else if (panel === 'draw') {
      setActiveNav('draw')
    } else if (panel === 'img2img') {
      setActiveNav('img2img')
    } else {
      setActiveNav('advanced')
    }
  }, [panel])

  const handleSaveImage = async (data: any) => {
    clearCanvasStore() // Handle bug where previous canvas may show up.
    const newBase64String = `data:${inferMimeTypeFromBase64(
      data.source_image
    )};base64,${data.source_image}`

    setI2iUploaded({
      base64String: newBase64String,
      height: data.height,
      width: data.width
    })

    const inpaintingInput = {
      height: nearestWholeMultiple(data.height),
      width: nearestWholeMultiple(data.width),
      orientationType: 'custom',
      imageType: data.imageType,
      source_image: data.source_image,
      source_mask: '',
      source_processing: 'inpainting'
    }

    PromptInputSettings.updateSavedInput_NON_DEBOUNCED(inpaintingInput)
    setInput(inpaintingInput)
  }

  return (
    <Panel style={{ overflow: 'unset' }}>
      <FlexRow gap={8} pb={12} style={{ justifyContent: 'flex-end' }}>
        <div
          className={clsx(
            styles.NavItem,
            activeNav === 'advanced' && styles['NavItem-Active']
          )}
          onClick={() => {
            setActiveNav('advanced')
            router.push(`/create`, { scroll: false })
          }}
        >
          Options
        </div>
        <IconPointFilled size={16} />
        <div
          className={clsx(
            styles.NavItem,
            activeNav === 'img2img' && styles['NavItem-Active']
          )}
          onClick={() => {
            router.push(`/create?panel=img2img`, { scroll: false })
            setActiveNav('img2img')
          }}
        >
          Image-to-image
        </div>
        <IconPointFilled size={16} />
        {/* <NavItem
          active={activeNav === 'draw'}
          onClick={() => {
            router.push(`/create?panel=draw`, { scroll: false })
            setActiveNav('draw')
          }}
        >
          [ draw ]
        </NavItem> */}
        <div
          className={clsx(
            styles.NavItem,
            activeNav === 'inpainting' && styles['NavItem-Active']
          )}
          onClick={() => {
            router.push(`/create?panel=inpainting`, { scroll: false })
            setActiveNav('inpainting')
          }}
        >
          Inpainting
        </div>
      </FlexRow>
      {activeNav === 'advanced' && (
        <AdvancedOptionsPanel
          input={input}
          setErrors={setErrors}
          setInput={setInput}
        />
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
            saveForInpaint={handleSaveImage}
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
            <InpaintingEditor />
          </>
        )}

      {activeNav === 'inpainting' &&
        !input.source_image &&
        input.source_processing !== SourceProcessing.InPainting && (
          <>
            <Head>
              <title>Inpainting - ArtBot for Stable Diffusion</title>
            </Head>
            <Uploader handleSaveImage={handleSaveImage} type="inpainting" />
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
