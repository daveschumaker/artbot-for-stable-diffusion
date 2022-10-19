import { useCallback } from 'react'
import { useStore } from 'statery'

import { trackEvent } from '../../api/telemetry'
import { appInfoStore } from '../../store/appStore'
import { getBase64 } from '../../utils/imageUtils'
import { Button } from '../Button'
import DotsHorizontalIcon from '../icons/DotsHorizontalIcon'
import DotsVerticalIcon from '../icons/DotsVerticalIcon'
import { UploadButton } from '../UploadButton'

interface AdvancedOptionsProps {
  setInput: any
  showAdvanced: boolean
  setShowAdvanced: any
}

export function AdvancedOptions({
  setInput,
  showAdvanced,
  setShowAdvanced
}: AdvancedOptionsProps) {
  const appState = useStore(appInfoStore)
  const { trusted } = appState

  // @ts-ignore
  const handleFileSelect = async (file) => {
    let fullDataString

    if (file) {
      fullDataString = await getBase64(file)
    }

    if (!fullDataString) {
      return
    }

    // @ts-ignore
    const [fileType, imgBase64String] = fullDataString.split(';base64,')
    const [, imageType] = fileType.split('data:')

    setInput({
      img2img: true,
      imageType,
      source_image: imgBase64String
    })
  }

  const handleShowAdvancedOptions = useCallback(() => {
    if (showAdvanced) {
      setShowAdvanced(false)
    } else {
      trackEvent({
        event: 'ADVANCED_OPTIONS_CLICK',
        context: `createPage`
      })
      setShowAdvanced(true)
    }
  }, [setShowAdvanced, showAdvanced])

  return (
    <div className="w-1/2 flex flex-row gap-2">
      <Button title="Show advanced options" onClick={handleShowAdvancedOptions}>
        {showAdvanced ? <DotsVerticalIcon /> : <DotsHorizontalIcon />}
      </Button>
      <UploadButton
        // @ts-ignore
        handleFile={handleFileSelect}
        disabled={!trusted}
      />
    </div>
  )
}
