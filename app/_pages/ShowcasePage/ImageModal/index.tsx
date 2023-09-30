'use client'

/* eslint-disable @next/next/no-img-element */
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/slide.css'
import styles from './component.module.css'
import {
  IconCopy,
  IconDotsVertical,
  IconPlaylistAdd,
  IconPlaylistX,
  IconRefresh,
  IconSettings,
  IconShare
} from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import FlexCol from 'app/_components/FlexCol'
import clsx from 'clsx'
import { baseHost, basePath } from 'BASE_PATH'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import { useRouter } from 'next/navigation'
import ImageApiParamsToPromptInput from 'app/_data-models/ImageApiParamsToPromptInput'
import { savePromptV2 } from 'app/_utils/promptUtils'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { uuidv4 } from 'app/_utils/appUtils'
import { rerollImage } from 'app/_controllers/imageDetailsCommon'

interface SharedImageDetails {
  image_params: any
  shortlink: string
}

export default function ImageModal({
  handleClose = () => {},
  imageDetails
}: {
  handleClose?: () => any
  imageDetails: SharedImageDetails
}) {
  const router = useRouter()
  const { image_params, shortlink } = imageDetails
  const { models, params } = image_params

  const [positivePrompt, negativePrompt] = image_params.prompt.split('###')

  const copyPrompt = () => {
    navigator?.clipboard?.writeText(image_params.prompt).then(() => {
      showSuccessToast({
        message: 'Prompt copied to your clipboard!'
      })
    })
  }

  const copyShortlink = () => {
    const hostname =
      window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : baseHost

    navigator?.clipboard
      ?.writeText(`${hostname}${basePath}?i=${shortlink}`)
      .then(() => {
        showSuccessToast({
          message: 'Shortlink URL copied to your clipboard!'
        })
      })
  }

  return (
    <div
      id="showcase-image-modal"
      style={{ marginBottom: '64px', width: 'calc(100% - 16px)' }}
    >
      <div>
        <div
          style={{
            margin: '0 auto',
            maxWidth: 512,
            width: image_params.width,
            height: image_params.height,
            paddingBottom: '8px'
          }}
        >
          <img
            className={styles.ShowcaseImage}
            src={`https://s3.amazonaws.com/tinybots.artbot/artbot/images/${imageDetails.shortlink}.webp`}
            alt={imageDetails.image_params.prompt}
            style={{
              borderRadius: '4px',
              margin: '0 auto',
              width: image_params.width,
              height: image_params.height
            }}
          />
        </div>
        <div className={styles.MenuWrapper}>
          <Menu
            menuButton={
              <MenuButton className={styles.MenuButton}>
                <IconDotsVertical stroke={1.5} />
              </MenuButton>
            }
            transition
          >
            <MenuItem
              className="text-sm"
              onClick={() => {
                router.push(
                  `/create?prompt=${encodeURIComponent(image_params.prompt)}`
                )
                handleClose()
              }}
            >
              Use prompt from this image
            </MenuItem>
            <MenuItem
              className="text-sm"
              onClick={() => {
                const newImageParams = new ImageApiParamsToPromptInput(
                  image_params
                )
                console.log(`newImageParams`, newImageParams)
                savePromptV2(newImageParams)
                router.push(`/create?edit=true`)
                handleClose()
              }}
            >
              Use all settings from this image
            </MenuItem>
          </Menu>
          <Menu
            menuButton={
              <MenuButton className={styles.MenuButton}>
                <IconCopy stroke={1.5} />
              </MenuButton>
            }
            transition
          >
            <MenuItem className="text-sm" onClick={copyPrompt}>
              Copy prompt
            </MenuItem>
          </Menu>
          <Menu
            menuButton={
              <MenuButton className={styles.MenuButton}>
                <IconShare stroke={1.5} />
              </MenuButton>
            }
            transition
          >
            <MenuItem className="text-sm" onClick={copyShortlink}>
              Share image (copy link to clipboard)
            </MenuItem>
          </Menu>
          <Menu
            menuButton={
              <MenuButton className={styles.MenuButton}>
                <IconRefresh stroke={1.5} />
              </MenuButton>
            }
            transition
          >
            <MenuItem
              className="text-sm"
              onClick={async () => {
                const newImageParams = new ImageApiParamsToPromptInput(
                  image_params
                )
                const newImageRequest = new CreateImageRequest(
                  newImageParams as DefaultPromptInput
                )
                newImageRequest.jobId = uuidv4()
                // const reRollStatus = await rerollImage(newImageRequest)
                await rerollImage(newImageRequest)

                router.push(`/pending`)
                handleClose()
              }}
            >
              Generate new image using these settings
            </MenuItem>
          </Menu>
        </div>
        <FlexCol style={{ marginBottom: '8px' }}>
          <FlexRow className="w-full text-sm font-bold flex flex-row gap-2 items-center">
            <IconPlaylistAdd stroke={1} />
            Prompt
          </FlexRow>
          <div className="w-full text-sm ml-[8px] break-words">
            {positivePrompt}
          </div>
        </FlexCol>
        {negativePrompt && negativePrompt.trim().length > 0 && (
          <FlexCol style={{ marginBottom: '8px' }}>
            <FlexRow className="w-full text-sm font-bold flex flex-row gap-2 items-center">
              <IconPlaylistX stroke={1} />
              Negative prompt
            </FlexRow>
            <div className="w-full text-sm ml-[8px] break-words">
              {negativePrompt}
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
            'p-4'
          ])}
        >
          <ul>
            <li>
              <strong>Model:</strong> {models[0]}
            </li>
            <li>
              <strong>Sampler:</strong> {params.sampler_name}
            </li>
            <li>&zwnj;</li>
            <li>
              <strong>Steps:</strong> {params.steps}
            </li>
            <li>
              <strong>Guidance / cfg scale:</strong> {params.cfg_scale}
            </li>
            <li>
              <strong>CLIP skip:</strong> {params.clip_skip}
            </li>
            <li>
              <strong>Seed:</strong> {params.seed}
            </li>
            <li>&zwnj;</li>
            <li>
              <strong>Height:</strong> {params.height} px
            </li>
            <li>
              <strong>Width:</strong> {params.width} px
            </li>
            <li>&zwnj;</li>
            <li>
              <strong>Hi-res fix:</strong> {params.hires_fix ? 'true' : 'false'}
            </li>
            <li>
              <strong>Karras:</strong> {params.karras ? 'true' : 'false'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
