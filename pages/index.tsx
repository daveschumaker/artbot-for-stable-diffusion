/* eslint-disable @next/next/no-img-element */
import { useEffect, useReducer, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import { createImageJob } from '../utils/imageCache'
import PageTitle from '../components/PageTitle'
import {
  getCachedPrompt,
  loadEditPrompt,
  updatedCachedPrompt
} from '../utils/promptUtils'
import TextArea from '../components/TextArea'
import { Button } from '../components/Button'
import TrashIcon from '../components/icons/TrashIcon'
import SquarePlusIcon from '../components/icons/SquarePlusIcon'
import { KeypressEvent } from '../types'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import { AdvancedOptions } from '../components/CreatePage/AdditionalOptions'
import AdvancedOptionsPanel from '../components/CreatePage/AdvancedOptionsPanel'
import CloseIcon from '../components/icons/CloseIcon'
import ImageSquare from '../components/ImageSquare'
import { validSampler } from '../utils/validationUtils'

interface InputTarget {
  name: string
  value: string
}
interface InputEvent {
  target: InputTarget
}

const Home: NextPage = () => {
  const router = useRouter()
  const { query } = router

  const editMode = query.edit

  const initialState = {
    img2img: editMode ? loadEditPrompt().img2img : false,
    imageType: '',
    orientationType: editMode ? loadEditPrompt().orientation : 'square',
    numImages: 1,
    prompt: editMode ? loadEditPrompt().prompt : '',
    sampler: editMode ? loadEditPrompt().sampler : 'k_heun',
    cfg_scale: editMode ? loadEditPrompt().cfg_scale : 9.0,
    steps: editMode ? loadEditPrompt().steps : 32,
    seed: '',
    denoising_strength: editMode ? loadEditPrompt().denoising_strength : 0.75,
    use_gfpgan: true,
    use_real_esrgan: true,
    parentJobId: editMode ? loadEditPrompt().parentJobId : '',
    negative: editMode ? loadEditPrompt().negative : '',
    source_image: editMode ? loadEditPrompt().source_image : '',
    models: editMode ? loadEditPrompt().models : ['stable_diffusion']
  }

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [pending, setPending] = useState(false)
  const [hasError, setHasError] = useState('')
  const [input, setInput] = useReducer(
    (state: any, newState: any) => ({ ...state, ...newState }),
    initialState
  )

  const handleChangeValue = (event: InputEvent) => {
    const inputName = event.target.name
    const inputValue = event.target.value

    if (inputName === 'sampler') {
      localStorage.setItem('sampler', event.target.value)
    }

    if (inputName === 'cfg_scale') {
      localStorage.setItem('cfg_scale', event.target.value)
    }

    if (inputName === 'denoising_strength') {
      updatedCachedPrompt(inputValue)
    }

    if (inputName === 'steps') {
      localStorage.setItem('steps', event.target.value)
    }

    if (inputName === 'prompt') {
      updatedCachedPrompt(inputValue)
    }

    setInput({ [inputName]: inputValue })
  }

  const handleImageUpload = (imageType: string, source_image: string) => {
    setInput({
      img2img: true,
      imageType,
      source_image
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
  }

  const handleSubmit = async () => {
    // TODO: Rather than directly send to API, we should queue up
    // jobs so we only ever send one job at a time to the API?
    setPending(true)

    if (pending) {
      return
    }

    if (!input?.prompt || input?.prompt.trim() === '') {
      setHasError('Please enter a prompt to continue.')
      setPending(false)
      return
    }

    const res = await createImageJob({
      ...input
    })

    if (res?.success) {
      updatedCachedPrompt('')
      trackEvent({
        event: input.img2img ? 'NEW_IMG2IMG_REQUEST' : 'NEW_IMAGE_REQUEST',
        sampler: input.sampler,
        numImages: input.numImages
      })
      trackGaEvent({
        action: 'new_img_request',
        params: {
          type: input.img2img ? 'img2img' : 'prompt2img'
        }
      })
      router.push('/pending')
    } else if (res?.status === 'INVALID_API_KEY') {
      setHasError('Invalid API key sent to the server. Check your settings.')
      setPending(false)
    } else {
      setHasError(
        'The server did not respond to the image request. Please try again shortly.'
      )
      setPending(false)
    }
  }

  const onEnterPress = (e: KeypressEvent) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    if (getCachedPrompt()) {
      setInput({ prompt: getCachedPrompt() })
    }

    if (query.edit) {
      setShowAdvanced(true)
    }

    if (!query.edit) {
      if (localStorage.getItem('orientation')) {
        setInput({ orientationType: localStorage.getItem('orientation') })
      }

      if (localStorage.getItem('sampler')) {
        const valid = validSampler(
          localStorage.getItem('sampler') || '',
          input.img2img
        )
        setInput({
          sampler: valid ? localStorage.getItem('sampler') : 'k_euler_a'
        })
      }

      if (localStorage.getItem('cfg_scale')) {
        setInput({ cfg_scale: localStorage.getItem('cfg_scale') })
      }

      if (localStorage.getItem('steps')) {
        setInput({ steps: localStorage.getItem('steps') })
      }

      if (localStorage.getItem('denoising_strength')) {
        setInput({ steps: localStorage.getItem('denoising_strength') })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main>
      <PageTitle>Create new image</PageTitle>
      <div className="mt-2 mb-2">
        <div className="flex flex-row gap-[8px] items-start">
          {input.sourceImage && (
            <ImageSquare
              imageDetails={{ base64String: input.sourceImage }}
              imageType={input.imageType}
              size={120}
            />
          )}
          {input.sourceImage && (
            <div
              className="absolute top-[2px] right-[2px] bg-blue-500 cursor-pointer"
              onClick={() => {
                setInput({
                  img2img: false,
                  imgType: '',
                  source_image: ''
                })
              }}
            >
              <CloseIcon />
            </div>
          )}
          <TextArea
            name="prompt"
            className="block bg-white p-2.5 w-full text-lg text-black rounded-lg max-h-[250px] border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Image prompt..."
            onChange={handleChangeValue}
            // @ts-ignore
            onKeyDown={onEnterPress}
            value={input.prompt}
          />
        </div>
        {hasError && (
          <div className="mt-2 text-red-500 font-semibold">
            Error: {hasError}
          </div>
        )}
        <div className="mt-4 mb-4 w-full flex flex-row">
          <AdvancedOptions
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
          />
          <div className="w-1/2 flex flex-row justify-end gap-2">
            <Button
              title="Clear current input"
              btnType="secondary"
              onClick={() => {
                return setInput({
                  numImages: 1,
                  prompt: '',
                  seed: '',
                  parentJobId: '',
                  negative: ''
                })
              }}
            >
              <span>
                <TrashIcon />
              </span>
              <span className="hidden md:inline-block">Clear</span>
            </Button>
            <Button
              title="Create new image"
              onClick={handleSubmit}
              disabled={pending}
              width="100px"
            >
              <span>{pending ? '' : <SquarePlusIcon />}</span>
              {pending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </div>
      {showAdvanced && (
        <AdvancedOptionsPanel
          handleChangeInput={handleChangeValue}
          handleImageUpload={handleImageUpload}
          handleOrientationSelect={handleOrientationSelect}
          input={input}
          setInput={setInput}
        />
      )}
    </main>
  )
}

export default Home
