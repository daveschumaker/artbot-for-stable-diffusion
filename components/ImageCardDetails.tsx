/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'

import { createImageJob } from '../utils/imageCache'
import { deleteCompletedImage } from '../utils/db'
import { savePrompt } from '../utils/promptUtils'
import ConfirmationModal from './ConfirmationModal'
import { useCallback, useState } from 'react'
import TrashIcon from './icons/TrashIcon'
import RecycleIcon from './icons/RecycleIcon'
import DownloadIcon from './icons/DownloadIcon'

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

const ImageDetails = ({
  imageDetails,
  onDelete = () => {}
}: ImageDetailsProps) => {
  const router = useRouter()

  const [pending, setPending] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDeleteImageClick = async (jobId: string) => {
    await deleteCompletedImage(jobId)
    onDelete()
    setShowDeleteModal(false)
  }

  const handleCopyPromptClick = (imageDetails: {
    prompt?: string
    parentJobId?: string
    negative?: string
  }) => {
    savePrompt({
      prompt: imageDetails.prompt,
      parentJobId: imageDetails.parentJobId,
      negative: imageDetails.negative
    })

    router.push(`/?edit=true`)
  }

  const handleDownloadClick = async (imageDetails: any) => {
    const res = await fetch(`/artbot/api/get-png`, {
      method: 'POST',
      body: JSON.stringify({
        imgString: imageDetails.base64String
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await res.json()
    const { success } = data

    if (success) {
      const filename = imageDetails.prompt
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .slice(0, 254)
      var a = document.createElement('a')
      a.href = 'data:image/png;base64,' + data.base64String
      a.download = filename + '.png'
      a.click()
    }
  }

  const handleRerollClick = useCallback(
    async (imageDetails: any) => {
      if (pending) {
        return
      }

      setPending(true)
      const cleanParams = Object.assign({}, imageDetails)

      delete cleanParams.base64String
      delete cleanParams.id
      delete cleanParams.jobId
      delete cleanParams.queue_position
      delete cleanParams.seed
      delete cleanParams.success
      delete cleanParams.timestamp
      delete cleanParams.wait_time

      const res = await createImageJob({
        ...cleanParams
      })

      if (res.success) {
        router.push('/pending')
      }
    },
    [pending, router]
  )

  return (
    <div className="text-left border-t-[1px] p-4">
      {showDeleteModal && (
        <ConfirmationModal
          onConfirmClick={() => handleDeleteImageClick(imageDetails.jobId)}
          closeModal={() => setShowDeleteModal(false)}
        />
      )}
      <div className="font-mono">{imageDetails.prompt}</div>
      <div className="font-mono text-xs mt-2">
        Created: {new Date(imageDetails.timestamp).toLocaleString()}
      </div>
      <div className="mt-2 w-full table">
        <div className="inline-block w-3/4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded align-top"
            onClick={() => handleCopyPromptClick(imageDetails)}
          >
            Copy prompt
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded ml-2 h-[40px] w-[40px] align-top"
            onClick={() => handleRerollClick(imageDetails)}
          >
            <RecycleIcon className="mx-auto" />
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded ml-2 h-[40px] w-[40px] align-top"
            onClick={() => handleDownloadClick(imageDetails)}
          >
            <DownloadIcon className="mx-auto" />
          </button>
        </div>
        <div className="inline-block w-1/4 text-right">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold rounded ml-2 h-[40px] w-[40px] align-top"
            onClick={() => setShowDeleteModal(true)}
          >
            <TrashIcon className="mx-auto" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageDetails
