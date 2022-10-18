import { useCallback, useReducer } from 'react'
import { useStore } from 'statery'

import { trackEvent } from '../../api/telemetry'
import { appInfoStore } from '../../store/appStore'
import { getBase64 } from '../../utils/imageUtils'
import { Button } from '../Button'
import { DropdownContent } from '../Dropdown/DropdownContent'
import { DropdownItem } from '../Dropdown/DropdownItem'
import DotsHorizontalIcon from '../icons/DotsHorizontalIcon'
import DotsVerticalIcon from '../icons/DotsVerticalIcon'
import PhotoIcon from '../icons/PhotoIcon'
import { UploadButton } from '../UploadButton'

interface AdvancedOptionsProps {
  orientationType: string
  setInput: any
  showAdvanced: boolean
  setShowAdvanced: any
}

export function AdvancedOptions({
  orientationType,
  setInput,
  showAdvanced,
  setShowAdvanced
}: AdvancedOptionsProps) {
  const appState = useStore(appInfoStore)
  const { trusted } = appState

  const [pageFeatures, setPageFeatures] = useReducer(
    (state: any, newState: any) => ({ ...state, ...newState }),
    {
      showOrientationDropdown: false,
      disableOrientationBtn: false
    }
  )

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

  const handleOrientationSelect = (orientation: string, options?: any) => {
    localStorage.setItem('orientation', orientation)
    setInput({ orientationType: orientation })

    if (!options?.initLoad) {
      trackEvent({
        event: 'ORIENTATION_CLICK',
        label: orientation,
        context: `createPage`
      })
    }
    setPageFeatures({ showOrientationDropdown: false })
  }

  // Funky race condition here wtih clicking outside Dropdown
  // if you click the orientation button.
  const handeOutsideClick = () => {
    setPageFeatures({
      showOrientationDropdown: false,
      disableOrientationBtn: true
    })

    setTimeout(() => {
      setPageFeatures({
        disableOrientationBtn: false
      })
    }, 100)
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

  const toggleOrientationDropdown = () => {
    if (pageFeatures.disableOrientationBtn) {
      return
    }

    setPageFeatures({ showOrientationDropdown: true })
  }

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
      <div>
        <Button
          title="Select image orientation"
          onClick={toggleOrientationDropdown}
        >
          <span>
            <PhotoIcon />
          </span>
          <span className="hidden md:inline-block">
            {orientationType === 'landscape-16x9' && `Landscape`}
            {orientationType === 'landscape' && `Landscape`}
            {orientationType === 'portrait' && `Portrait`}
            {orientationType === 'phone-bg' && `Phone wallpaper`}
            {orientationType === 'ultrawide' && `Ultrawide`}
            {orientationType === 'square' && `Square`}
            {orientationType === 'random' && `Random!`}
          </span>
        </Button>
        <DropdownContent
          handleClose={() => {
            handeOutsideClick()
          }}
          open={pageFeatures.showOrientationDropdown}
        >
          <DropdownItem
            active={orientationType === 'landscape-16x9'}
            onClick={() => {
              handleOrientationSelect('landscape-16x9')
            }}
          >
            Landscape 16 x 9
          </DropdownItem>
          <DropdownItem
            active={orientationType === 'landscape'}
            onClick={() => {
              handleOrientationSelect('landscape')
            }}
          >
            Landscape 3 x 2
          </DropdownItem>
          <DropdownItem
            active={orientationType === 'portrait'}
            onClick={() => {
              handleOrientationSelect('portrait')
            }}
          >
            Portrait 2 x 3
          </DropdownItem>
          <DropdownItem
            active={orientationType === 'phone-bg'}
            onClick={() => {
              handleOrientationSelect('phone-bg')
            }}
          >
            Phone wallpaper 9 x 21
          </DropdownItem>
          <DropdownItem
            active={orientationType === 'ultrawide'}
            onClick={() => {
              handleOrientationSelect('ultrawide')
            }}
          >
            Ultrawide 21 x 9
          </DropdownItem>
          <DropdownItem
            active={orientationType === 'square'}
            onClick={() => {
              handleOrientationSelect('square')
            }}
          >
            Square
          </DropdownItem>
          <DropdownItem
            active={orientationType === 'random'}
            onClick={() => {
              handleOrientationSelect('random')
            }}
          >
            Random
          </DropdownItem>
        </DropdownContent>
      </div>
    </div>
  )
}
