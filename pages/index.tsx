/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useReducer, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import { createImageJob } from '../utils/imageCache'
import PageTitle from '../components/PageTitle'
import {
  getCachedPrompt,
  loadEditPrompt,
  updatedCachedPrompt
} from '../utils/promptUtils'
import { useStore } from 'statery'
import { appInfoStore } from '../store/appStore'
import Link from 'next/link'
import TextArea from '../components/TextArea'
import { Button } from '../components/Button'
import PhotoIcon from '../components/icons/PhotoIcon'
import { DropdownContent } from '../components/Dropdown/DropdownContent'
import { DropdownItem } from '../components/Dropdown/DropdownItem'
import TrashIcon from '../components/icons/TrashIcon'
import SquarePlusIcon from '../components/icons/SquarePlusIcon'
import { KeypressEvent } from '../types'
import DotsVerticalIcon from '../components/icons/DotsVerticalIcon'
import DotsHorizontalIcon from '../components/icons/DotsHorizontalIcon'
import Panel from '../components/Panel'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import ImageSquare from '../components/ImageSquare'
import { UploadButton } from '../components/UploadButton'
import { getBase64 } from '../utils/imageUtils'
import CloseIcon from '../components/icons/CloseIcon'

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

  const appState = useStore(appInfoStore)
  const { trusted } = appState

  const [pageFeatures, setPageFeatures] = useReducer(
    (state: any, newState: any) => ({ ...state, ...newState }),
    {
      showOrientationDropdown: false,
      disableOrientationBtn: false
    }
  )

  const editMode = query.edit

  const initialState = {
    img2img: editMode ? loadEditPrompt().img2img : false,
    imageType: '',
    orientation: editMode ? loadEditPrompt().orientation : 'square',
    numImages: 1,
    prompt: editMode ? loadEditPrompt().prompt : '',
    height: editMode ? loadEditPrompt().height : 512,
    width: editMode ? loadEditPrompt().width : 512,
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
    models: ['stable_diffusion']
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
  }, [showAdvanced])

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

  const toggleOrientationDropdown = () => {
    if (pageFeatures.disableOrientationBtn) {
      return
    }

    setPageFeatures({ showOrientationDropdown: true })
  }

  const handleOrientationSelect = (orientation: string, options?: any) => {
    localStorage.setItem('orientation', orientation)

    if (orientation === 'landscape-16x9') {
      setInput({ height: 576, width: 1024, orientation: 'landscape-16x9' })
    } else if (orientation === 'landscape') {
      setInput({ height: 512, width: 768, orientation: 'landscape' })
    } else if (orientation === 'portrait') {
      setInput({ height: 768, width: 512, orientation: 'portrait' })
    } else if (orientation === 'square') {
      setInput({ height: 512, width: 512, orientation: 'square' })
    } else if (orientation === 'phone-bg') {
      setInput({ height: 1024, width: 448, orientation: 'phone-bg' })
    } else if (orientation === 'ultrawide') {
      setInput({ height: 448, width: 1024, orientation: 'ultrawide' })
    } else {
      setInput({ height: 512, width: 512, orientation: 'square' })
    }

    if (!options?.initLoad) {
      trackEvent({
        event: 'ORIENTATION_CLICK',
        label: orientation,
        context: `createPage`
      })
    }
    setPageFeatures({ showOrientationDropdown: false })
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

    if (res.success) {
      updatedCachedPrompt('')
      trackEvent({
        event: input.img2img ? 'NEW_IMG2IMG_REQUEST' : 'NEW_IMAGE_REQUEST',
        dimensions: `h ${input.height} x w ${input.width}`,
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
    } else if (res.status === 'INVALID_API_KEY') {
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

    // if (loadEditPrompt().img2img) {
    //   console.log('222')
    //   console.log(`loadEditPrompt().img2img`, loadEditPrompt())
    //   setShowAdvanced(true)
    //   setInput({
    //     img2img: true,
    //     parentJobId: loadEditPrompt().parentJobId,
    //     base64String: loadEditPrompt().base64String
    //   })
    //   updatedCachedPrompt(loadEditPrompt().prompt)
    //   clearPrompt()
    // } else if (loadEditPrompt().copyPrompt) {
    //   console.log(`333`)
    //   setShowAdvanced(true)
    //   setInput({
    //     prompt: loadEditPrompt().prompt,
    //     parentJobId: loadEditPrompt().parentJobId,
    //     negative: loadEditPrompt().negative
    //   })
    //   updatedCachedPrompt(loadEditPrompt().prompt)
    //   clearPrompt()
    // }

    if (query.edit) {
      setShowAdvanced(true)
    }

    if (!query.edit) {
      // Load preferences from localStorage:
      if (localStorage.getItem('orientation')) {
        handleOrientationSelect(
          localStorage.getItem('orientation') || 'square',
          {
            initLoad: true
          }
        )
      }

      if (localStorage.getItem('sampler')) {
        setInput({ sampler: localStorage.getItem('sampler') })
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
          {input.source_image && (
            <div
              style={{ position: 'relative', height: '100px', width: '120px' }}
            >
              <ImageSquare
                imageDetails={{ base64String: input.source_image }}
                imageType={input.imageType}
                size={120}
              />
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
          <div className="w-1/2 flex flex-row gap-2">
            <Button
              title="Show advanced options"
              onClick={handleShowAdvancedOptions}
            >
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
                  {input.orientation === 'landscape-16x9' && `Landscape`}
                  {input.orientation === 'landscape' && `Landscape`}
                  {input.orientation === 'portrait' && `Portrait`}
                  {input.orientation === 'phone-bg' && `Phone wallpaper`}
                  {input.orientation === 'ultrawide' && `Ultrawide`}
                  {input.orientation === 'square' && `Square`}
                </span>
              </Button>
              <DropdownContent
                handleClose={() => {
                  handeOutsideClick()
                }}
                open={pageFeatures.showOrientationDropdown}
              >
                <DropdownItem
                  active={input.orientation === 'landscape-16x9'}
                  onClick={() => {
                    handleOrientationSelect('landscape-16x9')
                  }}
                >
                  Landscape 16 x 9
                </DropdownItem>
                <DropdownItem
                  active={input.orientation === 'landscape'}
                  onClick={() => {
                    handleOrientationSelect('landscape')
                  }}
                >
                  Landscape 3 x 2
                </DropdownItem>
                <DropdownItem
                  active={input.orientation === 'portrait'}
                  onClick={() => {
                    handleOrientationSelect('portrait')
                  }}
                >
                  Portrait 2 x 3
                </DropdownItem>
                <DropdownItem
                  active={input.orientation === 'phone-bg'}
                  onClick={() => {
                    handleOrientationSelect('phone-bg')
                  }}
                >
                  Phone wallpaper 9 x 21
                </DropdownItem>
                <DropdownItem
                  active={input.orientation === 'ultrawide'}
                  onClick={() => {
                    handleOrientationSelect('ultrawide')
                  }}
                >
                  Ultrawide 21 x 9
                </DropdownItem>
                <DropdownItem
                  active={input.orientation === 'square'}
                  onClick={() => {
                    handleOrientationSelect('square')
                  }}
                >
                  Square
                </DropdownItem>
              </DropdownContent>
            </div>
          </div>
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
        <Panel>
          <div className="mb-2">
            <div className="inline-block w-[160px]">Negative prompt:</div>
            <div className="inline-block w-[160px] md:w-[320px]">
              <input
                type="text"
                className="text-black w-full rounded-lg p-1 border border-slate-500"
                name="negative"
                onChange={handleChangeValue}
                value={input.negative}
              />
            </div>
            <div
              className="inline-block w-[24px] bg-blue-500 hover:bg-blue-700 ml-2 text-center cursor-pointer"
              onClick={() => setInput({ negative: '' })}
            >
              X
            </div>
            <div className="block w-full text-xs mt-1">
              (Add words or phrases to demphasize from your desired image)
            </div>
          </div>
          <div className="mb-2">
            <div className="inline-block w-[124px]">Sampler:</div>
            <div className="inline-block w-[124px]">
              <select
                className="text-black w-full p-1 rounded-lg border border-slate-500"
                name="sampler"
                onChange={handleChangeValue}
                value={input.sampler}
              >
                {!input.img2img && <option value="DDIM">ddim</option>}
                <option value="k_dpm_2_a">k_dpm_2_a</option>
                <option value="k_dpm_2">k_dpm_2</option>
                <option value="k_euler_a">k_euler_a</option>
                <option value="k_euler">k_euler</option>
                <option value="k_heun">k_heun</option>
                <option value="k_lms">k_lms</option>
                {!input.img2img && <option value="PLMS">plms</option>}
              </select>
            </div>
          </div>
          <div className="mb-2">
            <div className="inline-block w-[124px]">Steps:</div>
            <div className="inline-block w-[50px]">
              <input
                type="text"
                className="text-black w-full p-1 rounded-lg border border-slate-500"
                name="steps"
                onChange={handleChangeValue}
                value={input.steps}
              />
            </div>
          </div>
          <div className="mb-2">
            <div className="inline-block w-[124px]">Guidance:</div>
            <div className="inline-block w-[50px]">
              <input
                type="text"
                className="text-black w-full rounded-lg p-1 border border-slate-500"
                name="cfg_scale"
                onChange={handleChangeValue}
                value={input.cfg_scale}
              />
            </div>
          </div>
          {input.img2img && (
            <div className="mb-2">
              <div className="inline-block w-[124px]">Denoise:</div>
              <div className="inline-block w-[50px]">
                <input
                  type="text"
                  className="text-black w-full rounded-lg p-1 border border-slate-500"
                  name="denoising_strength"
                  onChange={handleChangeValue}
                  value={input.denoising_strength}
                />
              </div>
            </div>
          )}
          <div className="mb-2">
            <div className="inline-block w-[124px]">Seed:</div>
            <div className="inline-block w-[124px]">
              <input
                type="text"
                className="text-black w-full rounded-lg p-1 border border-slate-500"
                name="seed"
                onChange={handleChangeValue}
                value={input.seed}
              />
            </div>
            <div
              className="inline-block w-[24px] bg-blue-500 hover:bg-blue-700 ml-2 text-center cursor-pointer"
              onClick={() => setInput({ seed: '' })}
            >
              X
            </div>
            <div className="block w-full text-xs mt-1">
              (Leave seed blank for random)
            </div>
          </div>
          <div className="mb-2">
            <div className="inline-block w-[124px]"># of images:</div>
            <div className="inline-block w-[124px]">
              <select
                className="text-black w-full p-1 rounded-lg border border-slate-500"
                name="numImages"
                onChange={handleChangeValue}
                value={input.numImages}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
              </select>
            </div>
          </div>
        </Panel>
      )}
      <div className="mt-2">
        <h2 className="font-bold mb-2">Resources and tips</h2>
        <ul>
          <li>
            <Link href="https://lexica.art/">
              <a className="text-sm text-cyan-400" target="_blank">
                Lexica - Prompt Search Engine
              </a>
            </Link>
          </li>
          <li>
            <Link href="https://publicprompts.art/">
              <a className="text-sm text-cyan-400" target="_blank">
                Public Prompts Collection
              </a>
            </Link>
          </li>
          <li>
            <Link href="https://github.com/Maks-s/sd-akashic">
              <a className="text-sm text-cyan-400" target="_blank">
                Stable Diffusion Artist Studies
              </a>
            </Link>
          </li>
          <li>
            <Link href="https://promptomania.com/stable-diffusion-prompt-builder/">
              <a className="text-sm text-cyan-400" target="_blank">
                Stable Diffusion Prompt Builder
              </a>
            </Link>
          </li>
        </ul>
      </div>
    </main>
  )
}

export default Home
