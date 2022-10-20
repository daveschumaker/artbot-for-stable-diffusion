/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'

import { deleteCompletedImage } from '../utils/db'
import ConfirmationModal from './ConfirmationModal'
import { useCallback, useState } from 'react'
import TrashIcon from './icons/TrashIcon'
import DownloadIcon from './icons/DownloadIcon'
import { Button } from './Button'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import RefreshIcon from './icons/RefreshIcon'
import UploadIcon from './icons/UploadIcon'
import Link from 'next/link'
import {
  copyEditPrompt,
  downloadImage,
  rerollImage,
  uploadImg2Img
} from '../controllers/imageDetailsCommon'

interface ImageDetails {
  img2img?: boolean
  jobId: string
  timestamp: number
  prompt: string
  height?: number
  width?: number
  cfg_scale?: string
  steps?: number
  sampler?: string
  seed: number
  negative?: string
  base64String: string
  denoising_strength?: number
  parentJobId?: string
  model?: string
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

  const [pending, setPending] = useState(false)
  const [pendingDownload, setPendingDownload] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDeleteImageClick = async (jobId: string) => {
    await deleteCompletedImage(jobId)
    onDelete()
    trackEvent({
      event: 'DELETE_IMAGE',
      context: 'ImagePage'
    })

    setShowDeleteModal(false)
  }

  const handleCopyPromptClick = (imageDetails: any) => {
    copyEditPrompt(imageDetails)

    trackEvent({
      event: 'COPY_PROMPT',
      context: 'ImagePage'
    })
    trackGaEvent({
      action: 'btn_delete_img',
      params: {
        context: 'ImagePage'
      }
    })

    router.push(`/?edit=true`)
  }

  const handleUploadClick = (imageDetails: any) => {
    uploadImg2Img(imageDetails)

    trackEvent({
      event: 'IMG2IMG_CLICK',
      context: 'ImagePage'
    })
    trackGaEvent({
      action: 'btn_img2img',
      params: {
        context: 'ImagePage'
      }
    })

    router.push(`/?edit=true`)
  }

  const handleDownloadClick = async (imageDetails: any) => {
    if (pendingDownload) {
      return
    }

    setPendingDownload(true)

    const imageDownload = await downloadImage(imageDetails)
    const { success } = imageDownload

    if (success) {
      trackEvent({
        event: 'DOWNLOAD_PNG',
        context: 'ImagePage'
      })
      trackGaEvent({
        action: 'btn_download_png',
        params: {
          context: 'ImagePage'
        }
      })
    }
    setPendingDownload(false)
  }

  const handleRerollClick = useCallback(
    async (imageDetails: any) => {
      if (pending) {
        return
      }

      setPending(true)

      const reRollStatus = await rerollImage(imageDetails)
      const { success } = reRollStatus

      if (success) {
        trackEvent({
          event: 'REROLL_IMAGE',
          context: 'ImagePage'
        })
        trackGaEvent({
          action: 'btn_reroll',
          params: {
            context: 'ImagePage'
          }
        })
        router.push('/pending')
      }
    },
    [pending, router]
  )

  return (
    <div className="mt-2 text-left">
      {showDeleteModal && (
        <ConfirmationModal
          onConfirmClick={() => handleDeleteImageClick(imageDetails.jobId)}
          closeModal={() => setShowDeleteModal(false)}
        />
      )}
      <div className="pt-2 font-mono">{imageDetails.prompt}</div>
      <div className="font-mono text-xs mt-2">
        -- Settings --
        <ul>
          Job:{' '}
          <Link href={`/job/${imageDetails.parentJobId}`} passHref>
            <a
              className="text-cyan-500"
              onClick={() => {
                trackEvent({
                  event: 'JOB_DETAILS_CLICK',
                  context: 'ImagePage'
                })
              }}
            >
              {imageDetails.parentJobId}
            </a>
          </Link>
          {imageDetails.img2img && <li>Source: img2img</li>}
          {imageDetails.negative && (
            <li>Negative prompt: {imageDetails.negative}</li>
          )}
          <li>Sampler: {imageDetails.sampler}</li>
          <li>
            Model:{' '}
            {imageDetails.model ? imageDetails.model : 'stable_diffusion'}
          </li>
          <li>Seed: {imageDetails.seed}</li>
          <li>Steps: {imageDetails.steps}</li>
          <li>cfg scale: {imageDetails.cfg_scale}</li>
          {imageDetails.img2img && imageDetails.denoising_strength && (
            <li>Denoise: {imageDetails.denoising_strength}</li>
          )}
        </ul>
      </div>
      <div className="font-mono text-xs mt-2">
        Created: {new Date(imageDetails.timestamp).toLocaleString()}
      </div>
      <div className="mt-2 w-full flex flex-row">
        <div className="inline-block w-3/4 flex flex-row gap-2">
          <Button
            title="Copy and re-edit prompt"
            // @ts-ignore
            onClick={() => handleCopyPromptClick(imageDetails)}
          >
            <span className="inline-block md:hidden">Copy</span>
            <span className="hidden md:inline-block">Copy prompt</span>
          </Button>
          <Button
            title="Use for img2img"
            // @ts-ignore
            onClick={() => handleUploadClick(imageDetails)}
          >
            <UploadIcon className="mx-auto" />
          </Button>
          <Button
            title="Download PNG"
            onClick={() => handleDownloadClick(imageDetails)}
            disabled={pendingDownload}
          >
            <DownloadIcon className="mx-auto" />
          </Button>
        </div>
        <div className="inline-block w-1/4 flex flex-row justify-end gap-2">
          <Button
            title="Request new image with same settings"
            onClick={() => handleRerollClick(imageDetails)}
            disabled={pending}
          >
            <RefreshIcon className="mx-auto" />
          </Button>
          <Button
            title="Delete image"
            btnType="secondary"
            onClick={() => setShowDeleteModal(true)}
          >
            <TrashIcon className="mx-auto" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ImageDetails
