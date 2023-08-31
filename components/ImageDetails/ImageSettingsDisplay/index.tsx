import { IconCodeDots, IconList, IconSettings } from '@tabler/icons-react'
import clsx from 'clsx'
import Linker from 'components/UI/Linker'
import CreateImageRequest from 'models/CreateImageRequest'
import { useState } from 'react'
import { SourceProcessing } from 'types/horde'
import { cleanDataForApiRequestDisplay } from 'utils/imageUtils'
import styles from './component.module.css'

export default function ImageSettingsDisplay({
  imageDetails
}: {
  imageDetails: CreateImageRequest
}) {
  const [showRequestParams, setShowRequestParams] = useState(false)

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
        <div className="mt-2 ml-4 w-full flex flex-row justify-start max-w-[768px]">
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
