import {
  IconCodeDots,
  IconCopy,
  IconExternalLink,
  IconList,
  IconSettings
} from '@tabler/icons-react'
import clsx from 'clsx'
import Linker from 'app/_components/Linker'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import { useState } from 'react'
import { InjectTi, SourceProcessing } from '_types/horde'
import { cleanDataForApiRequestDisplay } from 'app/_utils/imageUtils'
import styles from './component.module.css'
import { arrayHasValue } from 'app/_utils/validationUtils'
import FlexRow from 'app/_components/FlexRow'
import { showSuccessToast } from 'app/_utils/notificationUtils'

export default function ImageSettingsDisplay({
  imageDetails
}: {
  imageDetails: CreateImageRequest
}) {
  const [showRequestParams, setShowRequestParams] = useState(false)

  const handleCopy = () => {
    const prettyJson = JSON.stringify(
      cleanDataForApiRequestDisplay(imageDetails),
      null,
      2
    )

    navigator?.clipboard?.writeText(prettyJson).then(() => {
      showSuccessToast({
        message: 'Request parameters copied to your clipboard!'
      })
    })
  }

  const modelName =
    // @ts-ignore // imageDetails.model is deprecated. Old instances of ArtBot may still use this.
    imageDetails && (imageDetails?.models[0] || imageDetails?.model)
  const isImg2Img =
    imageDetails.source_processing === SourceProcessing.Img2Img ||
    imageDetails.source_image

  return (
    <div
      id="image-params-wrapper"
      className="flex flex-col items-center justify-start w-full mt-3"
    >
      <div className="text-[16px] tablet:text-[18px] px-4 w-full max-w-[768px]">
        <div className="flex flex-row items-center gap-2 text-sm font-bold">
          <IconSettings stroke={1.5} />
          Image details
        </div>
        <div className="mt-2 ml-4 w-full gap-2 flex flex-row justify-start max-w-[768px]">
          <div
            className="flex flex-row items-center gap-2 text-sm cursor-pointer"
            onClick={() => {
              setShowRequestParams(!showRequestParams)
            }}
          >
            {showRequestParams ? (
              <IconList stroke={1.5} />
            ) : (
              <IconCodeDots stroke={1.5} />
            )}
            {showRequestParams
              ? 'show image details'
              : 'show request parameters'}
          </div>
          {showRequestParams && (
            <>
              <div>{' | '}</div>
              <div
                className="flex flex-row items-center gap-2 text-sm cursor-pointer"
                onClick={handleCopy}
              >
                <IconCopy stroke={1.5} />
                Copy to clipboard
              </div>
            </>
          )}
        </div>
        <div className="flex flex-row">
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
              'p-4',
              styles['image-details']
            ])}
          >
            {showRequestParams && (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(
                  cleanDataForApiRequestDisplay(imageDetails),
                  null,
                  2
                )}
              </pre>
            )}
            {!showRequestParams && (
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
                  <strong>Worker ID:</strong> {imageDetails.worker_id}
                </li>
                <li>
                  <strong>Worker name:</strong> {imageDetails.worker_name}
                </li>
                <li>&zwnj;</li>
                <li>
                  <strong>Sampler:</strong> {imageDetails.sampler}
                </li>
                {modelName ? (
                  <li>
                    <strong>Model:</strong>{' '}
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
                  <li>
                    <strong>Model version:</strong> {imageDetails.modelVersion}
                  </li>
                )}
                {imageDetails.kudos && (
                  <li>
                    <strong>Kudos cost:</strong>{' '}
                    <Linker
                      href="/faq#kudos"
                      passHref
                      className="text-cyan-500"
                    >
                      {imageDetails.kudos.toFixed(2)}
                    </Linker>
                  </li>
                )}
                <li>&zwnj;</li>
                <li>
                  <strong>Seed:</strong> {imageDetails.seed}
                </li>
                <li>
                  <strong>Steps:</strong> {imageDetails.steps}
                </li>
                <li>
                  <strong>Guidance / cfg scale:</strong>{' '}
                  {imageDetails.cfg_scale}
                </li>
                {isImg2Img && imageDetails.denoising_strength && (
                  <li>
                    <strong>Denoise:</strong>{' '}
                    {Number(imageDetails.denoising_strength).toFixed(2)}
                  </li>
                )}
                {arrayHasValue(imageDetails.loras) && (
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
                                {lora.label || `(CivitAI ID: ${lora.name})`}
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
                )}
                <li>&zwnj;</li>
                <li>
                  <strong>Height:</strong> {imageDetails.height}px
                </li>
                <li>
                  <strong>Width:</strong> {imageDetails.width}px
                </li>
                <li>&zwnj;</li>
                <li>
                  <strong>Karras:</strong>{' '}
                  {imageDetails.karras ? 'true' : 'false'}
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
                  <strong>tiled:</strong>{' '}
                  {imageDetails.tiling ? 'true' : 'false'}
                </li>
                <li>&zwnj;</li>
                {imageDetails.control_type && (
                  <li>
                    <strong>Control type:</strong> {imageDetails.control_type}
                  </li>
                )}
                {imageDetails.image_is_control && (
                  <li>
                    <strong>Control map:</strong>{' '}
                    {imageDetails.image_is_control}
                  </li>
                )}
              </ul>
            )}
          </div>
          {/* {
              // @ts-ignore
              size.width >= 800 && isModal && (
                <div className="w-[154px]">
                  <AdContainer id="cardbonads_img_modal" />
                </div>
              )
            } */}
        </div>
      </div>
    </div>
  )
}
