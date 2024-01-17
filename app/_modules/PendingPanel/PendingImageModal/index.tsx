import {
  IconAlertTriangle,
  IconLoader,
  IconPhotoUp,
  IconPlaylistAdd,
  IconPlaylistX,
  IconSettings,
  IconStackPush,
  IconTrash
} from '@tabler/icons-react'
import { JobStatus } from '_types'
import FlexCol from 'app/_components/FlexCol'
import FlexRow from 'app/_components/FlexRow'
import Linker from 'app/_components/Linker'
import clsx from 'clsx'
import styles from './pendingImageModal.module.css'
import { Button } from 'app/_components/Button'
import { deletePendingJobFromApi } from 'app/_api/deletePendingJobFromApi'
import {
  deletePendingJob,
  getPendingJob,
  updatePendingJobV2
} from 'app/_controllers/pendingJobsCache'
import { useState } from 'react'

const showDiscordBlurb = (errorMessage: string) => {
  if (
    errorMessage === 'The worker was unable to process this request. Try again?'
  ) {
    return false
  }

  if (errorMessage === 'Unable to create image. Please try again soon.') {
    return false
  }

  return true
}

export default function PendingImageModal({
  handleClose = () => {},
  imageDetails
}: {
  handleClose?: () => any
  imageDetails: any
}) {
  const [pendingJob] = useState<any>(getPendingJob(imageDetails.jobId))

  const serverHasJob =
    imageDetails?.jobStatus === JobStatus.Queued ||
    imageDetails?.jobStatus === JobStatus.Processing

  const handleRetryJob = async () => {
    updatePendingJobV2(
      Object.assign({}, imageDetails, { jobStatus: JobStatus.Waiting })
    )
    handleClose()
  }

  const handleDeleteJob = async () => {
    if (serverHasJob) {
      deletePendingJobFromApi(imageDetails.jobId)
    }

    deletePendingJob(imageDetails.jobId)
    handleClose()
  }

  return (
    <div style={{ marginTop: '4px' }}>
      {pendingJob.jobStatus === JobStatus.Processing && (
        <FlexCol className={styles.contrastTextBackground}>
          <FlexRow gap={8} pb={2}>
            <IconLoader size={32} stroke={1.5} /> <strong>Status:</strong> Image
            processing
          </FlexRow>
          {pendingJob.queue_position >= 0 && (
            <FlexRow pb={8}>
              <div style={{ fontSize: '14px' }}>
                Queue position: {pendingJob.queue_position} <br /> Est. wait:{' '}
                {pendingJob.wait_time} s
              </div>
            </FlexRow>
          )}
        </FlexCol>
      )}
      {pendingJob.is_possible === false && (
        <FlexCol className={styles.contrastTextBackground}>
          <FlexRow gap={8} pb={8}>
            <span>
              <strong>Warning:</strong> There are currently no workers available
              to process this image. You can continue to wait a few minutes for
              a worker to come online, or adjust your image settings (e.g.,
              model, dimensions or post processors) and try again.
            </span>
          </FlexRow>
        </FlexCol>
      )}
      {(pendingJob.jobStatus === JobStatus.Requested ||
        pendingJob.jobStatus === JobStatus.Queued) && (
        <FlexCol className={styles.contrastTextBackground}>
          <FlexRow gap={8} pb={8}>
            <IconStackPush size={32} stroke={1.5} />
            <strong>Status:</strong> Image request submitted to AI Horde
          </FlexRow>
          {pendingJob.queue_position >= 0 && (
            <FlexRow pb={8}>
              <div style={{ fontSize: '14px' }}>
                Queue position: {pendingJob.queue_position} <br /> Est. wait:{' '}
                {pendingJob.wait_time} s
              </div>
            </FlexRow>
          )}
        </FlexCol>
      )}
      {pendingJob.jobStatus === JobStatus.Waiting && (
        <FlexCol className={styles.contrastTextBackground}>
          <FlexRow gap={8} pb={8}>
            <IconPhotoUp size={32} stroke={1.5} /> <strong>Status:</strong>{' '}
            Waiting to submit image request.
          </FlexRow>
        </FlexCol>
      )}
      {imageDetails.jobStatus === JobStatus.Error && (
        <FlexCol className={styles.contrastTextBackground}>
          {imageDetails.errorStatus !== 'JOB_CANCELED_CENSORED' && (
            <FlexRow gap={8} pb={8}>
              <IconAlertTriangle
                size={32}
                stroke={1.5}
                color="rgb(234 179 8)"
              />{' '}
              <strong>Error:</strong> {imageDetails.errorMessage}
            </FlexRow>
          )}
          {imageDetails.errorStatus === 'JOB_CANCELED_CENSORED' && (
            <FlexRow
              gap={8}
              pb={8}
              style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}
            >
              <IconAlertTriangle
                size={32}
                stroke={1.5}
                color="rgb(234 179 8)"
              />
              <div style={{ fontSize: '14px' }}>
                <strong>Error:</strong> The GPU worker returned a safety check
                warning and was unable to generate the image as requested.
                Sometimes, this error is a false positive and you can try
                submitting your request again. If this continues to happen,
                please modify your prompt or seed and try again.
              </div>
            </FlexRow>
          )}
          {showDiscordBlurb(imageDetails.errorMessage) && (
            <FlexRow pb={8}>
              <div style={{ fontSize: '14px' }}>
                Not sure what this means? Please visit the{' '}
                <Linker
                  href="https://discord.gg/3DxrhksKzn"
                  target="_blank"
                  rel="noreferrer"
                >
                  Stable Horde Discord channel
                </Linker>{' '}
                for more further help and information.
              </div>
            </FlexRow>
          )}
        </FlexCol>
      )}
      <div></div>
      <div>
        <FlexCol style={{ marginBottom: '8px' }}>
          <FlexRow className="w-full text-sm font-bold flex flex-row gap-2 items-center">
            <IconPlaylistAdd stroke={1} />
            Prompt
          </FlexRow>
          <div className="w-full text-sm ml-[8px] break-words">
            {imageDetails.prompt}
          </div>
        </FlexCol>
        {imageDetails.negative && (
          <FlexCol style={{ marginBottom: '8px' }}>
            <FlexRow className="w-full text-sm font-bold flex flex-row gap-2 items-center">
              <IconPlaylistX stroke={1} />
              Negative prompt
            </FlexRow>
            <div className="w-full text-sm ml-[8px] break-words">
              {imageDetails.negative}
            </div>
          </FlexCol>
        )}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <FlexRow className="w-full text-sm font-bold flex flex-row gap-2 items-center">
          <IconSettings stroke={1} />
          Image details
        </FlexRow>
        <div
          className={clsx([
            'bg-slate-800',
            'font-mono',
            'text-white',
            'text-sm',
            'overflow-x-auto',
            'mt-2',
            'mx-4',
            'rounded-md',
            'pt-4',
            'px-4'
          ])}
        >
          <ul>
            {imageDetails.timestamp && (
              <li>
                <strong>Created:</strong>{' '}
                {new Date(imageDetails.timestamp).toLocaleString()}
              </li>
            )}
            <li>
              <strong>Job ID:</strong> {imageDetails.jobId}
            </li>
            <li>&zwnj;</li>
            <li>
              <strong>Sampler:</strong> {imageDetails.sampler}
            </li>
            <li>
              <strong>Model:</strong>{' '}
              <Linker
                href={`/images?model=${imageDetails.models[0]}`}
                passHref
                className="text-cyan-500"
              >
                {imageDetails.models[0]}
              </Linker>
            </li>
            <li>&zwnj;</li>
            <li>
              <strong>Seed:</strong>{' '}
              {imageDetails.seed ? imageDetails.seed : '(random)'}
            </li>
            <li>
              <strong>Steps:</strong> {imageDetails.steps}
            </li>
            <li>
              <strong>Guidance / cfg scale:</strong> {imageDetails.cfg_scale}
            </li>
            {/* {isImg2Img && imageDetails.denoising_strength && (
              <li>
                <strong>Denoise:</strong>{' '}
                {Number(imageDetails.denoising_strength).toFixed(2)}
              </li>
            )} */}
            {/* {arrayHasValue(imageDetails.loras) && (
              <>
                <li>&zwnj;</li>
                <li>
                  <strong>LoRAs:</strong>
                  {imageDetails.loras.map((lora, i: number) => {
                    return (
                      <div
                        key={`ts_${i}`}
                        style={{ paddingTop: i > 0 ? '4px' : 'unset' }}
                      >
                        {'- '}
                        <Linker
                          inline
                          href={`https://civitai.com/models/${lora.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          passHref
                          className="text-cyan-500"
                        >
                          <FlexRow gap={8}>
                            {lora.label}
                            <IconExternalLink stroke={1.5} size={16} />
                          </FlexRow>
                        </Linker>
                        <div>&nbsp;&nbsp;Strength: {lora.model}</div>
                        <div>&nbsp;&nbsp;CLIP: {lora.clip}</div>
                      </div>
                    )
                  })}
                </li>
              </>
            )}
            {arrayHasValue(imageDetails.tis) && (
              <>
                <li>&zwnj;</li>
                <li>
                  <strong>Embeddings:</strong>
                  {imageDetails.tis.map((ti, i: number) => {
                    return (
                      <div
                        key={`ts_${i}`}
                        style={{ paddingTop: i > 0 ? '4px' : 'unset' }}
                      >
                        {'- '}
                        <Linker
                          inline
                          href={`https://civitai.com/models/${ti.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          passHref
                          className="text-cyan-500"
                        >
                          <FlexRow gap={8}>
                            {ti.name}
                            <IconExternalLink stroke={1.5} size={16} />
                          </FlexRow>
                        </Linker>
                        <div>
                          &nbsp;&nbsp;Strength: {ti.strength}{' '}
                          {ti.inject_ti === InjectTi.NegPrompt
                            ? '(negative prompt)'
                            : ''}
                        </div>
                      </div>
                    )
                  })}
                </li>
              </>
            )} */}
            <li>&zwnj;</li>
            <li>
              <strong>Height:</strong> {imageDetails.height}px
            </li>
            <li>
              <strong>Width:</strong> {imageDetails.width}px
            </li>
            <li>&zwnj;</li>
            <li>
              <strong>Karras:</strong> {imageDetails.karras ? 'true' : 'false'}
            </li>
            <li>
              <strong>Hi-res fix:</strong>{' '}
              {imageDetails.hires ? 'true' : 'false'}
            </li>
            <li>
              <strong>CLIP skip:</strong>{' '}
              {imageDetails.clipskip ? imageDetails.clipskip : 1}
            </li>
            <li>
              <strong>tiled:</strong> {imageDetails.tiling ? 'true' : 'false'}
            </li>
            <li>&zwnj;</li>
            {imageDetails.control_type && (
              <li>
                <strong>Control type:</strong> {imageDetails.control_type}
              </li>
            )}
            {imageDetails.image_is_control && (
              <li>
                <strong>Control map:</strong> {imageDetails.image_is_control}
              </li>
            )}
          </ul>
        </div>
        <FlexRow justifyContent="flex-end" mt={8} gap={8}>
          {imageDetails.jobStatus === JobStatus.Error && (
            <Button onClick={handleRetryJob}>
              <div className={styles.MobileHideText}>Retry</div>
            </Button>
          )}
          {(pendingJob.jobStatus === JobStatus.Waiting ||
            pendingJob.jobStatus === JobStatus.Queued ||
            imageDetails.jobStatus === JobStatus.Error) && (
            <Button theme="secondary" onClick={handleDeleteJob}>
              <IconTrash />
              <div className={styles.MobileHideText}>
                {imageDetails.jobStatus === JobStatus.Error
                  ? 'Remove'
                  : 'Cancel'}
              </div>
            </Button>
          )}
        </FlexRow>
      </div>
    </div>
  )
}
