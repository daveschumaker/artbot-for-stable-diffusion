/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { useCallback } from 'react'

import { deleteCompletedImage, updateCompletedJob } from '../../../utils/db'
import ConfirmationModal from '../../ConfirmationModal'
import TrashIcon from '../../icons/TrashIcon'
import { Button } from '../../UI/Button'
import { trackEvent, trackGaEvent } from '../../../api/telemetry'
import RefreshIcon from '../../icons/RefreshIcon'
import {
  copyEditPrompt,
  rerollImage
} from '../../../controllers/imageDetailsCommon'
import Linker from '../../UI/Linker'
import CopyIcon from '../../icons/CopyIcon'
import ImageSquare from '../../ImageSquare'
import { SourceProcessing } from '../../../utils/promptUtils'
import ShareIcon from '../../icons/ShareIcon'
import DownloadIcon from '../../icons/DownloadIcon'
import useComponentState from '../../../hooks/useComponentState'
import {
  downloadFile,
  generateBase64Thumbnail
} from '../../../utils/imageUtils'
import AdContainer from '../../AdContainer'
import styles from './imageDetails.module.css'
import Img2ImgModal from '../Img2ImgModal'
import { useWindowSize } from '../../../hooks/useWindowSize'
import ImageParamsForApi from '../../../models/ImageParamsForApi'
import { userInfoStore } from '../../../store/userStore'
import { createShortlink } from '../../../api/createShortlink'
import AppSettings from '../../../models/AppSettings'
import PromptInputSettings from '../../../models/PromptInputSettings'

interface ImageDetails {
  id: number
  upscaled?: boolean
  img2img?: boolean
  jobId: string
  timestamp: number
  prompt: string
  height: number
  width: number
  cfg_scale: number
  steps?: number
  sampler?: string
  seed: number
  negative?: string
  base64String: string
  denoising_strength?: number
  parentJobId?: string
  model?: string
  modelVersion: string
  imageType?: string
  source_image?: string
  shortlink?: string
  orientation: string
  tiling: boolean
  karras: boolean
  hires: boolean
  clipskip: number
  worker_id?: string
  stylePreset: string
  post_processing: Array<string>
  models: Array<string>
  source_processing: SourceProcessing
}

interface ImageDetailsProps {
  imageDetails: ImageDetails
  onDelete: () => void
}

const ImageDetails = ({
  imageDetails,
  onDelete = () => {}
}: ImageDetailsProps) => {
  const router = useRouter()
  const size = useWindowSize()

  const [componentState, setComponentState] = useComponentState({
    pending: false,
    shortlinkPending: false,
    shortlink: '',
    showDeleteModal: false,
    showImg2ImgModal: false
  })

  // Older images are missing the correct models field and can cause an exception
  // Check for updated models reference and modify as needed:
  let models = ['stable_diffusion']

  if (imageDetails.models && imageDetails.models[0]) {
    models = [imageDetails.models[0]]
  } else if (!imageDetails.models && imageDetails.model) {
    models = [imageDetails.model]
  }

  imageDetails.models = models

  const handleDeleteImageClick = async (jobId: string) => {
    await deleteCompletedImage(jobId)
    onDelete()
    trackEvent({
      event: 'DELETE_IMAGE',
      context: '/pages/image/[id]'
    })

    setComponentState({ showDeleteModal: false })
  }

  const handleCopyPromptClick = (imageDetails: any) => {
    if (AppSettings.get('savePromptOnCreate')) {
      PromptInputSettings.set('prompt', imageDetails.prompt)
    }

    copyEditPrompt(imageDetails)

    trackEvent({
      event: 'COPY_PROMPT',
      context: '/pages/image/[id]'
    })
    trackGaEvent({
      action: 'btn_delete_img',
      params: {
        context: '/pages/image/[id]'
      }
    })

    router.push(`/?edit=true`)
  }

  const copyShortlink = (shortlink: string) => {
    const hostname =
      window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://tinybots.net'
    navigator?.clipboard
      ?.writeText(`${hostname}/artbot?i=${shortlink}`)
      .then(() => {
        toast.success('URL copied!', {
          pauseOnFocusLoss: false,
          position: 'top-center',
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          theme: 'light'
        })
      })
  }

  const getShortlink = async () => {
    if (imageDetails.shortlink || componentState.shortlink) {
      copyShortlink(imageDetails.shortlink || componentState.shortlink)
      return
    }

    if (componentState.shortlinkPending) {
      return
    }

    setComponentState({ shortlinkPending: true })

    const resizedImage = await generateBase64Thumbnail(
      imageDetails.base64String,
      imageDetails.jobId,
      512,
      768,
      0.7
    )

    const data = {
      // @ts-ignore
      imageParams: new ImageParamsForApi(imageDetails),
      imageBase64: resizedImage,
      username: userInfoStore.state.username
    }

    const shortlinkData = await createShortlink(data)
    const { shortlink } = shortlinkData

    if (shortlink) {
      await updateCompletedJob(
        imageDetails.id,
        Object.assign({}, imageDetails, {
          shortlink
        })
      )

      copyShortlink(shortlink)
    }

    setComponentState({ shortlinkPending: false, shortlink })
  }

  const handleRerollClick = useCallback(
    async (imageDetails: any) => {
      if (componentState.pending) {
        return
      }

      setComponentState({ pending: true })

      trackEvent({
        event: 'REROLL_IMAGE_CLICK',
        context: '/pages/image/[id]'
      })

      const reRollStatus = await rerollImage(imageDetails)
      const { success } = reRollStatus

      if (success) {
        trackEvent({
          event: 'REROLL_IMAGE',
          context: '/pages/image/[id]'
        })
        trackGaEvent({
          action: 'btn_reroll',
          params: {
            context: '/pages/image/[id]'
          }
        })
        router.push('/pending')
      }
    },
    [componentState.pending, router, setComponentState]
  )

  const modelName = imageDetails.models[0] || imageDetails.model
  const imageUpscaled =
    imageDetails?.post_processing?.indexOf('RealESRGAN_x4plus') >= 0
  const isImg2Img =
    imageDetails.source_processing === SourceProcessing.Img2Img ||
    imageDetails.img2img

  let showAd = false
  if (typeof size.width !== 'undefined') {
    if (size?.width > 1130 && size?.width < 1279) {
      showAd = false
    } else if (size?.width > 1388 && size?.width < 1440) {
      showAd = false
    } else if (size?.width > 1639) {
      showAd = false
    } else {
      showAd = true
    }
  }

  return (
    <div className="mt-2 text-left">
      {componentState.showImg2ImgModal && (
        <Img2ImgModal
          handleClose={() => setComponentState({ showImg2ImgModal: false })}
          imageDetails={imageDetails}
        />
      )}
      {componentState.showDeleteModal && (
        <ConfirmationModal
          onConfirmClick={() => handleDeleteImageClick(imageDetails.jobId)}
          closeModal={() => setComponentState({ showDeleteModal: false })}
        />
      )}
      <div className="pt-2 font-mono">{imageDetails.prompt}</div>
      <div className="font-mono text-xs mt-2 w-full flex flex-row justify-between">
        <div>
          -- Image Details --
          <ul>
            <li>Worker ID: {imageDetails.worker_id}</li>
            <li>
              Job:{' '}
              <Linker
                href={`/job/${imageDetails.parentJobId}`}
                passHref
                className="text-cyan-500"
                onClick={() => {
                  trackEvent({
                    event: 'JOB_DETAILS_CLICK',
                    context: '/pages/image/[id]'
                  })
                }}
              >
                {imageDetails.parentJobId}
              </Linker>
            </li>
            {imageUpscaled && <li>UPSCALED IMAGE</li>}
            {isImg2Img && <li>Source: img2img</li>}
            {imageDetails.negative && (
              <li>Negative prompt: {imageDetails.negative}</li>
            )}
            {imageDetails.stylePreset && (
              <li>Style preset: {imageDetails.stylePreset}</li>
            )}
            <li>
              Height:{' '}
              {imageUpscaled ? imageDetails.height * 4 : imageDetails.height} px
            </li>
            <li>
              Width:{' '}
              {imageUpscaled ? imageDetails.width * 4 : imageDetails.width} px
            </li>
            <li>Sampler: {imageDetails.sampler}</li>
            <li>Karras: {imageDetails.karras ? 'true' : 'false'}</li>
            <li>Hi-res fix: {imageDetails.hires ? 'true' : 'false'}</li>
            <li>
              CLIP skip: {imageDetails.clipskip ? imageDetails.clipskip : 1}
            </li>
            {modelName ? (
              <li>
                Model:{' '}
                <Linker
                  href={`/images?model=${modelName}`}
                  passHref
                  className="text-cyan-500"
                >
                  {modelName}
                </Linker>
              </li>
            ) : null}
            {imageDetails.modelVersion && (
              <li>Model version: {imageDetails.modelVersion}</li>
            )}
            <li>Seed: {imageDetails.seed}</li>
            <li>Steps: {imageDetails.steps}</li>
            <li>cfg scale: {imageDetails.cfg_scale}</li>
            {isImg2Img && imageDetails.denoising_strength && (
              <li>
                Denoise: {Number(imageDetails.denoising_strength).toFixed(2)}
              </li>
            )}
            <li>tiled: {imageDetails.tiling ? 'true' : 'false'}</li>
          </ul>
        </div>
        {!imageDetails.source_image && showAd && (
          <div className="max-w-[200px] pl-[16px] items-start">
            <AdContainer minSize={0} maxSize={1400} />
          </div>
        )}
        {imageDetails.source_image && (
          <div>
            <div className="mb-2">img2img source:</div>
            <div
              className="relative cursor-pointer"
              onClick={() => setComponentState({ showImg2ImgModal: true })}
            >
              <ImageSquare
                imageDetails={{ base64String: imageDetails.source_image }}
                imageType={imageDetails.imageType}
                size={120}
              />
            </div>
            <div
              className="mt-2 flex flex-row justify-center cursor-pointer text-cyan-500 font-[700]"
              onClick={() => setComponentState({ showImg2ImgModal: true })}
            >
              view details
            </div>
          </div>
        )}
      </div>
      <div className="font-mono text-xs mt-2">
        Created: {new Date(imageDetails.timestamp).toLocaleString()}
      </div>
      <div className="mt-2 w-full flex flex-row">
        <div className="w-3/4 flex flex-row gap-2">
          <Button
            title="Copy and re-edit prompt"
            // @ts-ignore
            onClick={() => handleCopyPromptClick(imageDetails)}
          >
            <CopyIcon />
            <span className="inline-block md:hidden">Copy</span>
            <span className="hidden md:inline-block">Copy prompt</span>
          </Button>
          {imageDetails.source_processing === SourceProcessing.Prompt && (
            <Button
              title="Share link"
              onClick={async () => {
                getShortlink()
              }}
            >
              <ShareIcon />
              <span className="inline-block md:hidden">Share</span>
              <span className="hidden md:inline-block">Share link</span>
            </Button>
          )}
          <Button
            title="Download"
            // @ts-ignore
            onClick={() => downloadFile(imageDetails)}
          >
            <DownloadIcon />
            <span className="hidden md:inline-block">Download</span>
          </Button>
        </div>
        <div className="w-1/2 flex flex-row justify-end gap-2">
          <Button
            title="Request new image with same settings"
            onClick={() => handleRerollClick(imageDetails)}
            disabled={componentState.pending}
          >
            <RefreshIcon className="mx-auto" />
            <span className={styles['mobile-hide-text']}>Reroll Image</span>
          </Button>
          <Button
            title="Delete image"
            theme="secondary"
            onClick={() => setComponentState({ showDeleteModal: true })}
          >
            <TrashIcon className="mx-auto" />
            <span className={styles['mobile-hide-text']}>Delete image</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ImageDetails
