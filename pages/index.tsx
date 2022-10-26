/* eslint-disable @next/next/no-img-element */
import { useEffect, useReducer, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { createImageJob } from '../utils/imageCache'
import PageTitle from '../components/PageTitle'
import {
  getCachedPrompt,
  loadEditPrompt,
  updatedCachedPrompt
} from '../utils/promptUtils'
import { useStore } from 'statery'
import { appInfoStore } from '../store/appStore'
import TextArea from '../components/TextArea'
import { Button } from '../components/Button'
import TrashIcon from '../components/icons/TrashIcon'
import SquarePlusIcon from '../components/icons/SquarePlusIcon'
import { KeypressEvent } from '../types'
import Panel from '../components/Panel'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import { AdvancedOptions } from '../components/CreatePage/AdditionalOptions'
import SectionTitle from '../components/SectionTitle'
import Tooltip from '../components/Tooltip'
import Select from '../components/Select'
import Input from '../components/Input'
import PhotoIcon from '../components/icons/PhotoIcon'
import { DropdownContent } from '../components/Dropdown/DropdownContent'
import { DropdownItem } from '../components/Dropdown/DropdownItem'
import RelatedImages from '../components/CreatePage/RelatedImages'
import Modal from '../components/Modal/modal'
import FileUploader from '../components/FileUploader'
import UploadIcon from '../components/icons/UploadIcon'
import ImageUploadDisplay from '../components/CreatePage/ImageUploadDisplay'

interface InputTarget {
  name: string
  value: string
}
interface InputEvent {
  target: InputTarget
}

interface StyledPanelProps {
  open: boolean
}

const StyledPanel = styled.div<StyledPanelProps>`
  opacity: ${(props) => (props.open ? '1' : '0')};
  max-height: ${(props) => (props.open ? '100%' : '0')};
  transition: all 0.4s;
`

const Home: NextPage = () => {
  const router = useRouter()
  const { query } = router

  const appState = useStore(appInfoStore)
  const { models } = appState

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

  const [pageFeatures, setPageFeatures] = useReducer(
    (state: any, newState: any) => ({ ...state, ...newState }),
    {
      showUploaderModal: false,
      showRelatedImagesDropdown: false,
      showOrientationDropdown: false,
      disableOrientationBtn: false
    }
  )
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

    setPageFeatures({ showUploaderModal: false })
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

  const toggleOrientationDropdown = () => {
    if (pageFeatures.disableOrientationBtn) {
      return
    }

    setPageFeatures({ showOrientationDropdown: true })
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
      // if (localStorage.getItem('orientation')) {
      //   handleOrientationSelect(
      //     localStorage.getItem('orientation') || 'square',
      //     {
      //       initLoad: true
      //     }
      //   )
      // }

      if (localStorage.getItem('orientation')) {
        setInput({ orientationType: localStorage.getItem('orientation') })
      }

      // TODO: fix me later
      if (localStorage.getItem('sampler')) {
        // setInput({ sampler: localStorage.getItem('sampler') })
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
      {pageFeatures.showUploaderModal && (
        <Modal
          handleClose={() => setPageFeatures({ showUploaderModal: false })}
        >
          <FileUploader handleUpload={handleImageUpload} />
        </Modal>
      )}
      <PageTitle>Create new image</PageTitle>
      <div className="mt-2 mb-2">
        <div className="flex flex-row gap-2">
          <Button
            title="Select image orientation"
            onClick={() => setPageFeatures({ showUploaderModal: true })}
          >
            <UploadIcon className="mx-auto" /> Upload (img2img)
          </Button>
          <div className="mb-4">
            <Button
              title="Select image orientation"
              onClick={toggleOrientationDropdown}
            >
              <span>
                <PhotoIcon />
              </span>
              <span className="inline-block">
                {input.orientationType === 'landscape-16x9' && `Landscape`}
                {input.orientationType === 'landscape' && `Landscape`}
                {input.orientationType === 'portrait' && `Portrait`}
                {input.orientationType === 'phone-bg' && `Phone wallpaper`}
                {input.orientationType === 'ultrawide' && `Ultrawide`}
                {input.orientationType === 'square' && `Square`}
                {input.orientationType === 'random' && `Random!`}
              </span>
            </Button>
            <DropdownContent
              handleClose={() => {
                handeOutsideClick()
              }}
              open={pageFeatures.showOrientationDropdown}
            >
              <DropdownItem
                active={input.orientationType === 'landscape-16x9'}
                onClick={() => {
                  handleOrientationSelect('landscape-16x9')
                }}
              >
                Landscape 16 x 9
              </DropdownItem>
              <DropdownItem
                active={input.orientationType === 'landscape'}
                onClick={() => {
                  handleOrientationSelect('landscape')
                }}
              >
                Landscape 3 x 2
              </DropdownItem>
              <DropdownItem
                active={input.orientationType === 'portrait'}
                onClick={() => {
                  handleOrientationSelect('portrait')
                }}
              >
                Portrait 2 x 3
              </DropdownItem>
              <DropdownItem
                active={input.orientationType === 'phone-bg'}
                onClick={() => {
                  handleOrientationSelect('phone-bg')
                }}
              >
                Phone wallpaper 9 x 21
              </DropdownItem>
              <DropdownItem
                active={input.orientationType === 'ultrawide'}
                onClick={() => {
                  handleOrientationSelect('ultrawide')
                }}
              >
                Ultrawide 21 x 9
              </DropdownItem>
              <DropdownItem
                active={input.orientationType === 'square'}
                onClick={() => {
                  handleOrientationSelect('square')
                }}
              >
                Square
              </DropdownItem>
              <DropdownItem
                active={input.orientationType === 'random'}
                onClick={() => {
                  handleOrientationSelect('random')
                }}
              >
                Random
              </DropdownItem>
            </DropdownContent>
          </div>
        </div>
        <div className="flex flex-row gap-[8px] items-start">
          <ImageUploadDisplay
            handleUpload={handleImageUpload}
            imageType={input.imageType}
            sourceImage={input.source_image}
            resetImage={() => {
              setInput({
                img2img: false,
                imgType: '',
                source_image: ''
              })
            }}
          />
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
      <StyledPanel open={showAdvanced}>
        {showAdvanced && (
          <Panel className="relative">
            <div className="absolute" style={{ top: '-23px', left: '17px' }}>
              |
            </div>
            <div className="mb-2">
              <SectionTitle>Advanced options</SectionTitle>
              {input.parentJobId && (
                <>
                  <div className="mt-2 inline-block w-[124px]">
                    {' '}
                    Parent Job{' '}
                    <Tooltip width="180px">
                      This image will be related to an existing image within
                      your browser cache.
                    </Tooltip>{' '}
                  </div>
                  <div
                    className="inline-block ml-4 text-cyan-500 cursor-pointer"
                    onClick={() => {
                      {
                        !pageFeatures.showRelatedImagesDropdown &&
                          trackEvent({
                            event: 'ADVANCED_RELATED_IMAGES_CLICK',
                            context: `createPage`
                          })
                      }
                      setPageFeatures({
                        showRelatedImagesDropdown:
                          !pageFeatures.showRelatedImagesDropdown
                      })
                    }}
                  >
                    {pageFeatures.showRelatedImagesDropdown && `[ - Hide ]`}
                    {!pageFeatures.showRelatedImagesDropdown && `[ + View ]`}
                  </div>
                  <div
                    className="inline-block ml-4 text-red-500 cursor-pointer"
                    onClick={() => {
                      setInput({ parentJobId: '' })
                      trackEvent({
                        event: 'ADVANCED_REMOVE_RELATED_IMAGES_CLICK',
                        context: `createPage`
                      })
                    }}
                  >
                    [ Remove ]
                  </div>
                  {pageFeatures.showRelatedImagesDropdown && (
                    <RelatedImages jobId={input.parentJobId} />
                  )}
                </>
              )}
              <div className="mb-2">
                Negative prompt
                <Tooltip width="180px">
                  Add words or phrases to demphasize from your desired image
                </Tooltip>
              </div>
              <Input
                // @ts-ignore
                className="mb-2"
                type="text"
                name="negative"
                onChange={handleChangeValue}
                // @ts-ignore
                value={input.negative}
                width="100%"
              />
              <div className="w-full flex flex-row justify-end gap-2 mb-4">
                <Button
                  title="Clear negative input"
                  btnType="secondary"
                  onClick={() => setInput({ negative: '' })}
                >
                  Clear
                </Button>
                <Button
                  title="Save negative prompt"
                  onClick={() => {}}
                  width="100px"
                >
                  Save
                </Button>
              </div>
            </div>
            <div className="mb-2">
              <div className="inline-block w-[124px]">Sampler</div>
              <div className="inline-block">
                <Select
                  name="sampler"
                  //@ts-ignore
                  onChange={handleChangeValue}
                  value={input.sampler}
                  width="180px"
                >
                  {!input.img2img && <option value="DDIM">ddim</option>}
                  <option value="k_dpm_2_a">k_dpm_2_a</option>
                  <option value="k_dpm_2">k_dpm_2</option>
                  <option value="k_euler_a">k_euler_a</option>
                  <option value="k_euler">k_euler</option>
                  <option value="k_heun">k_heun</option>
                  <option value="k_lms">k_lms</option>
                  {!input.img2img && <option value="PLMS">plms</option>}
                  <option value="random">random</option>
                </Select>
              </div>
            </div>
            <div className="mb-2">
              <div className="inline-block w-[124px]">Steps</div>
              <div className="inline-block">
                <Input
                  type="text"
                  name="steps"
                  onChange={handleChangeValue}
                  value={input.steps}
                />
              </div>
            </div>
            <div className="mb-2">
              <div className="inline-block w-[124px]">
                Guidance
                <Tooltip width="200px">
                  Higher numbers follow the prompt more closely. Lower numbers
                  give more creativity.
                </Tooltip>
              </div>
              <div className="inline-block">
                <Input
                  type="text"
                  name="cfg_scale"
                  onChange={handleChangeValue}
                  value={input.cfg_scale}
                />
              </div>
            </div>
            {input.img2img && (
              <div className="mb-2">
                <div className="inline-block w-[124px]">Denoise</div>
                <div className="inline-block">
                  <Input
                    type="text"
                    name="denoising_strength"
                    onChange={handleChangeValue}
                    value={input.denoising_strength}
                  />
                </div>
              </div>
            )}
            <div className="mb-2">
              <div className="inline-block w-[124px]">
                Seed
                <Tooltip width="140px">Leave seed blank for random.</Tooltip>
              </div>
              <div className="inline-block">
                <Input
                  type="text"
                  name="seed"
                  onChange={handleChangeValue}
                  value={input.seed}
                  width="200px"
                />
              </div>
            </div>
            <div className="mb-2">
              <div className="inline-block w-[124px]">
                Model
                <Tooltip width="240px">
                  Models currently available within the horde. Numbers in
                  paranthesis indicate number of works. Generally, these models
                  will generate images quicker.
                </Tooltip>
              </div>
              <div className="inline-block">
                <Select
                  name="models"
                  onChange={(e: any) => {
                    if (e.target.value === 'random') {
                      setInput({ models: [''] })
                    } else {
                      setInput({ models: [e.target.value] })
                    }
                  }}
                  value={input.models[0]}
                  width="200px"
                >
                  {models.map((model, i) => {
                    return (
                      <option
                        //@ts-ignore
                        key={`${model.name}_select_${i}`}
                        // @ts-ignore
                        value={model.name}
                      >
                        {model
                          ? // @ts-ignore
                            model.name +
                            // @ts-ignore
                            (model.count ? ` (${model.count})` : '')
                          : ''}
                      </option>
                    )
                  })}
                  <option value="random">random</option>
                </Select>
              </div>
            </div>
            <div className="mb-2">
              <div className="inline-block w-[124px]"># of images</div>
              <div className="inline-block">
                <Select
                  name="numImages"
                  onChange={handleChangeValue}
                  value={input.numImages}
                  width="75px"
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
                </Select>
              </div>
            </div>
          </Panel>
        )}
      </StyledPanel>
    </main>
  )
}

export default Home
