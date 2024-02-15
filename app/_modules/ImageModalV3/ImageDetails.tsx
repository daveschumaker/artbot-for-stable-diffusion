import {
  IconPlaylistAdd,
  IconPlaylistX,
  IconSettings
} from '@tabler/icons-react'
import FlexCol from 'app/_components/FlexCol'
import FlexRow from 'app/_components/FlexRow'
import Linker from 'app/_components/Linker'
import clsx from 'clsx'
import { useContext } from 'react'
import { ImageDetailsContext } from './ImageDetailsProvider'

export default function ImageDetails() {
  const context = useContext(ImageDetailsContext)
  const { imageDetails } = context
  return (
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
          {/* <li>
            <strong>Model:</strong>{' '}
            <Linker
              href={`/images?model=${imageDetails.models[0]}`}
              passHref
              className="text-cyan-500"
            >
              {imageDetails.models[0]}
            </Linker>
          </li> */}
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
            <strong>Hi-res fix:</strong> {imageDetails.hires ? 'true' : 'false'}
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
    </div>
  )
}
