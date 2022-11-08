/* eslint-disable @next/next/no-img-element */
import { useEffect, useReducer, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import { createImageJob } from '../utils/imageCache'
import PageTitle from '../components/UI/PageTitle'
import {
  getCachedPrompt,
  loadEditPrompt,
  SourceProcessing,
  updatedCachedPrompt
} from '../utils/promptUtils'
import TextArea from '../components/UI/TextArea'
import { Button } from '../components/UI/Button'
import TrashIcon from '../components/icons/TrashIcon'
import SquarePlusIcon from '../components/icons/SquarePlusIcon'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import CloseIcon from '../components/icons/CloseIcon'
import ImageSquare from '../components/ImageSquare'
import { validSampler } from '../utils/validationUtils'
import OptionsPanel from '../components/CreatePage/OptionsPanel'
import { clearCanvasStore, getCanvasStore } from '../store/canvasStore'

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
    imageType: editMode ? loadEditPrompt().imageType : '',
    orientationType: editMode ? loadEditPrompt().orientation : 'square',
    height: editMode ? loadEditPrompt().height : 512,
    width: editMode ? loadEditPrompt().width : 512,
    numImages: 1,
    prompt: editMode ? loadEditPrompt().prompt : '',
    sampler: editMode ? loadEditPrompt().sampler : 'k_euler_a',
    cfg_scale: editMode ? loadEditPrompt().cfg_scale : 9,
    steps: editMode ? loadEditPrompt().steps : 32,
    seed: '',
    denoising_strength: editMode ? loadEditPrompt().denoising_strength : 0.75,
    karras: editMode ? loadEditPrompt().karras : false,
    // use_gfpgan: true,
    // use_real_esrgan: true,
    parentJobId: editMode ? loadEditPrompt().parentJobId : '',
    negative: editMode ? loadEditPrompt().negative : '',
    source_image: editMode ? loadEditPrompt().source_image : '',
    source_mask: editMode ? loadEditPrompt().source_mask : '',
    source_processing: editMode
      ? loadEditPrompt().source_processing
      : SourceProcessing.Prompt,
    models: editMode ? loadEditPrompt().models : ['stable_diffusion'],
    useAllModels: false
  }

  const [hasValidationError, setHasValidationError] = useState(false)
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
      localStorage.setItem('denoising_strength', event.target.value)
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

    if (hasValidationError || pending) {
      return
    }

    setPending(true)

    if (!input?.prompt || input?.prompt.trim() === '') {
      setHasError('Please enter a prompt to continue.')
      setPending(false)
      return
    }

    const imageJobData = {
      ...input
    }

    if (getCanvasStore().cached && getCanvasStore().canvasRef) {
      imageJobData.canvasStore = { ...getCanvasStore() }
    }

    // Handle weird error that's been cropping up where canvas is empty but inpainting is true:
    if (
      !getCanvasStore().canvasRef &&
      input.source_processing === SourceProcessing.InPainting
    ) {
      setInput({
        source_processing: SourceProcessing.Prompt
      })
    }

    const res = await createImageJob(imageJobData)

    // @ts-ignore
    const { status, message } = res

    if (res?.success) {
      clearCanvasStore()
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
    } else if (status === 'INVALID_API_KEY') {
      setHasError(
        'Invalid API key sent to the server. Check your settings and re-enter your key.'
      )
      setPending(false)
    } else if (message) {
      setHasError(`Stable Horde API error: ${message}`)
      setPending(false)
    } else {
      setHasError(
        'The server did not respond to the image request. Please try again shortly.'
      )
      setPending(false)
    }
  }

  const onEnterPress = (e: KeyboardEvent) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    if (getCachedPrompt()) {
      setInput({ prompt: getCachedPrompt() })
    }

    if (!query.edit) {
      if (localStorage.getItem('orientation')) {
        setInput({ orientationType: localStorage.getItem('orientation') })
      }

      if (localStorage.getItem('sampler')) {
        const valid = validSampler(localStorage.getItem('sampler') || '')
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
        setInput({
          denoising_strength: localStorage.getItem('denoising_strength')
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main>
      <PageTitle>
        Create new image{' '}
        {input.source_processing === 'outpainting' && '(outpainting)'}
        {input.source_processing === 'inpainting' && '(inpainting)'}
        {input.source_processing === 'img2img' && '(img2img)'}
      </PageTitle>
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
                  source_image: '',
                  source_processing: SourceProcessing.Prompt,
                  source_mask: ''
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
        {hasValidationError && (
          <div className="mt-2 text-red-500 font-semibold">
            Please correct all input errors before continuing
          </div>
        )}
        {hasError && (
          <div className="mt-2 text-red-500 font-semibold">
            Error: {hasError}
          </div>
        )}
        <div className="mt-4 mb-4 w-full flex flex-row justify-end">
          <div className="w-1/2 flex flex-row justify-end gap-2">
            <Button
              title="Clear current input"
              btnType="secondary"
              onClick={() => {
                clearCanvasStore()
                return setInput({
                  numImages: 1,
                  prompt: '',
                  seed: '',
                  parentJobId: '',
                  negative: '',
                  source_processing: SourceProcessing.Prompt,
                  source_image: '',
                  source_mask: ''
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
              disabled={hasValidationError || pending}
              width="100px"
            >
              <span>{pending ? '' : <SquarePlusIcon />}</span>
              {pending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </div>
      <OptionsPanel
        handleChangeInput={handleChangeValue}
        handleImageUpload={handleImageUpload}
        handleOrientationSelect={handleOrientationSelect}
        input={input}
        setInput={setInput}
        setHasValidationError={setHasValidationError}
      />
    </main>
  )
}

export default Home
