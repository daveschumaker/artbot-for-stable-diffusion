/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { deleteCompletedImage } from '../../../utils/db'
import ConfirmationModal from '../../ConfirmationModal'
import { useCallback, useState } from 'react'
import TrashIcon from '../../icons/TrashIcon'
import DownloadIcon from '../../icons/DownloadIcon'
import { Button } from '../../UI/Button'
import { trackEvent, trackGaEvent } from '../../../api/telemetry'
import RefreshIcon from '../../icons/RefreshIcon'
import UploadIcon from '../../icons/UploadIcon'
import {
  copyEditPrompt,
  downloadImage,
  rerollImage,
  uploadImg2Img
} from '../../../controllers/imageDetailsCommon'
import CopyIcon from '../../icons/CopyIcon'

interface ImageDetails {
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
}

interface ImageDetailsProps {
  imageDetails: ImageDetails
  onDelete: () => void
}

const StyledPanel = styled.div`
  background-color: ${(props) => props.theme.cardBackground};
  border-top: 2px solid ${(props) => props.theme.text};
  color: ${(props) => props.theme.grayText};
`

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
      context: 'ImageCard'
    })
    trackGaEvent({
      action: 'btn_delete_img',
      params: {
        context: 'ImageCard'
      }
    })
    setShowDeleteModal(false)
  }

  const handleCopyPromptClick = (imageDetails: any) => {
    copyEditPrompt(imageDetails)

    trackEvent({
      event: 'COPY_PROMPT',
      context: 'ImageCard'
    })
    trackGaEvent({
      action: 'btn_copy_prompt',
      params: {
        context: 'ImageCard'
      }
    })

    router.push(`/?edit=true`)
  }

  const handleDownloadClick = async (imageDetails: any) => {
    if (pendingDownload) {
      return
    }

    setPendingDownload(true)

    await downloadImage(imageDetails)

    trackEvent({
      event: 'DOWNLOAD_PNG',
      context: 'ImageCard'
    })

    trackGaEvent({
      action: 'btn_download_png',
      params: {
        context: 'ImageCard'
      }
    })
    setPendingDownload(false)
  }

  const handleUploadClick = (imageDetails: any) => {
    uploadImg2Img(imageDetails)

    trackEvent({
      event: 'IMG2IMG_CLICK',
      context: 'ImageCard'
    })
    trackGaEvent({
      action: 'btn_img2img',
      params: {
        context: 'ImageCard'
      }
    })

    router.push(`/?edit=true`)
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
          context: 'ImageCard'
        })
        trackGaEvent({
          action: 'btn_reroll',
          params: {
            context: 'ImageCard'
          }
        })
        router.push('/pending')
      }

      setPending(false)
    },
    [pending, router]
  )

  return (
    <StyledPanel className="text-left p-4">
      {showDeleteModal && (
        <ConfirmationModal
          onConfirmClick={() => handleDeleteImageClick(imageDetails.jobId)}
          closeModal={() => setShowDeleteModal(false)}
        />
      )}
      <div>{imageDetails.prompt}</div>
      <div className="font-mono text-xs mt-2">
        Created: {new Date(imageDetails.timestamp).toLocaleString()}
      </div>
      <div className="mt-2 w-full w-full flex flex-row">
        <div className="inline-block w-3/4 flex flex-row gap-2">
          <Button
            title="Copy and re-edit prompt"
            onClick={() => handleCopyPromptClick(imageDetails)}
          >
            <CopyIcon />
            <span className="inline-block md:hidden">Copy</span>
            <span className="hidden md:inline-block">Copy prompt</span>
          </Button>
          <Button
            title="Use for img2img"
            //@ts-ignore
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
            theme="secondary"
            onClick={() => setShowDeleteModal(true)}
          >
            <TrashIcon className="mx-auto" />
          </Button>
        </div>
      </div>
    </StyledPanel>
  )
}

export default ImageDetails
