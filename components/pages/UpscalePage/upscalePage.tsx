/* eslint-disable @next/next/no-img-element */
import { checkInterrogate } from 'api/checkInterrogate'
import { requestIterrogate } from 'api/requestInterrogate'
import UpscalerOptions from 'components/CreatePage/AdvancedOptionsPanel/UpscalerOptions'
import Uploader from 'components/CreatePage/Uploader'
import PhotoUpIcon from 'components/icons/PhotoUpIcon'
import SettingsIcon from 'components/icons/SettingsIcon'
import SquarePlusIcon from 'components/icons/SquarePlusIcon'
import TrashIcon from 'components/icons/TrashIcon'
import { Button } from 'components/UI/Button'
import PageTitle from 'components/UI/PageTitle'
import Section from 'components/UI/Section'
import { useCallback, useEffect, useReducer } from 'react'

interface ComponentState {
  apiError?: string
  jobId: string
  pending: false
}

interface UpscaleJob {
  source_image: string
  height?: number
  width?: number
  post_processing: string[]
}

const UpscalePage = () => {
  const initialInput: UpscaleJob = {
    source_image: '',
    post_processing: []
  }

  const initialComponentState: ComponentState = {
    jobId: '',
    pending: false
  }

  const [componentState, setComponentState] = useReducer(
    (state: any, newState: any) => {
      return { ...state, ...newState }
    },
    initialComponentState as ComponentState // <-- this gives me proper type signatures for componentState stuff. Sweet!
  )

  const [input, setInput] = useReducer((state: any, newState: any) => {
    return { ...state, ...newState }
  }, initialInput as UpscaleJob)

  const checkInterrogationStatus = useCallback(async () => {
    try {
      const data = await checkInterrogate(componentState.jobId)
      const { state, forms = [] } = data

      if (state === 'faulted') {
        setComponentState({
          apiError: 'Unable to check image request...',
          jobComplete: false,
          jobPending: false
        })

        return
      }

      if (state === 'done') {
        console.log(`forms?`, forms)
      }
    } catch (err) {}
  }, [componentState.jobId])

  const handleSaveImage = (data: any) => {
    setInput({
      height: data.height,
      width: data.width,
      source_image: data.source_image
    })
  }

  const handleSubmit = async () => {
    if (componentState.pending) {
      return
    }

    setComponentState({ pending: true })

    try {
      const interrogationTypes: Array<{ [key: string]: string }> = []

      input.post_processing.forEach((processor: string) =>
        interrogationTypes.push({ name: processor })
      )

      const data = await requestIterrogate({
        interrogationTypes,
        source_image: input.source_image
      })

      const { jobId, success } = data

      if (success && jobId) {
        setComponentState({ jobId })
      }
    } catch (err) {}
  }

  const resetInput = () => {
    setInput({ ...initialInput })
  }

  useEffect(() => {
    let interval: any

    if (componentState.pending === true && componentState.jobId) {
      interval = setInterval(() => {
        checkInterrogationStatus()
      }, 6500)
    }

    return () => clearInterval(interval)
  }, [checkInterrogationStatus, componentState.jobId, componentState.pending])

  return (
    <>
      <PageTitle>Image upscale / post-processing</PageTitle>
      <Section first>
        <div className="text-[16px] tablet:text-[18px] w-full max-w-[768px]">
          <div className="text-sm font-bold flex flex-row gap-2 items-center mb-[4px]">
            <PhotoUpIcon />
            Upload image
          </div>
        </div>
        {!input.source_image && (
          <Uploader handleSaveImage={handleSaveImage} type="upscale" />
        )}
        {input.source_image && (
          <div className="flex flex-col w-full align-center justify-center">
            <img
              src={`data:${input.imageType};base64,${input.source_image}`}
              alt="Uploaded image for ControlNet"
              style={{
                boxShadow: '2px 2px 4px 1px rgba(0, 0, 0, 0.75)',
                margin: '0 auto',
                maxWidth: `1024px`,
                maxHeight: `100%`,
                width: '100%'
              }}
            />
            <div className="flex flex-row w-full justify-end mt-2">
              <Button
                theme="secondary"
                onClick={() => {
                  setInput({ source_image: '' })
                }}
              >
                <TrashIcon />
                Remove image?
              </Button>
            </div>
          </div>
        )}
      </Section>
      <Section>
        <div className="text-[16px] tablet:text-[18px] w-full max-w-[768px]">
          <div className="text-sm font-bold flex flex-row gap-2 items-center mb-[4px]">
            <SettingsIcon />
            Advanced options
          </div>
        </div>
        <UpscalerOptions input={input} setInput={setInput} />
      </Section>
      <Section>
        <div className="mt-2 mb-4 w-full flex flex-col md:flex-row gap-2 justify-end items-start">
          <div className="flex flex-row justify-end gap-2 sm:mt-0">
            <Button
              title="Clear current input"
              theme="secondary"
              onClick={resetInput}
            >
              <span>
                <TrashIcon />
              </span>
              <span>Reset all?</span>
            </Button>
            <Button
              title="Create new image"
              onClick={handleSubmit}
              // @ts-ignore
              disabled={componentState.pending}
              width="100px"
            >
              <span>{componentState.pending ? '' : <SquarePlusIcon />}</span>
              {componentState.pending ? 'Processing...' : 'Process'}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}

export default UpscalePage
