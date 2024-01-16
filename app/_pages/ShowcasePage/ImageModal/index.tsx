'use client'

/* eslint-disable @next/next/no-img-element */
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/slide.css'
import styles from './component.module.css'
import {
  IconCopy,
  IconDotsVertical,
  IconExternalLink,
  IconEyeOff,
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
import { useStore } from 'statery'
import { userInfoStore } from 'app/_store/userStore'
import { publishToShowcase } from 'app/_modules/SharedImageView/controller'
import { IconWall } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { arrayHasValue } from 'app/_utils/validationUtils'
import Linker from 'app/_components/Linker'
import { fetchModelVersion } from 'app/_api/civitai/modelversion'

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
  const [loraDetails, setLoraDetails] = useState<any>({})

  const [showTiles, setShowTiles] = useState(false)
  const [tileSize, setTileSize] = useState('256px')

  const { role } = useStore(userInfoStore)
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

  const handleTileClick = (size: string) => {
    setTileSize(size)
    setShowTiles(true)
  }

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    if (queryParams.get('view_tiles')) {
      setShowTiles(true)
    }
  }, [])

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)

    if (showTiles && !queryParams.get('view_tiles')) {
      queryParams.set('view_tiles', 'true')
      window.history.pushState(null, '', `?${queryParams.toString()}`)
    } else if (!showTiles && queryParams.get('view_tiles')) {
      queryParams.delete('view_tiles')
      window.history.pushState(null, '', `?${queryParams.toString()}`)
    }
  }, [showTiles])

  useEffect(() => {
    // Function to fetch details
    const fetchDetails = async () => {
      const details: any = {}
      for (const lora of params.loras) {
        if (lora.is_version) {
          const detail = await fetchModelVersion(lora.name)
          details[lora.name] = detail
        }
      }
      setLoraDetails(details)
    }

    // Call the function
    if (params.loras) {
      fetchDetails()
    }
  }, [params.loras])

  return (
    <>
      {showTiles && (
        <div
          className="z-[102] fixed top-0 left-0 right-0 bottom-0 bg-repeat"
          onClick={() => setShowTiles(false)}
          style={{
            backgroundImage: `url("https://s3.amazonaws.com/tinybots.artbot/artbot/images/${imageDetails.shortlink}.webp")`,
            backgroundSize: tileSize
          }}
        ></div>
      )}
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
            {role === 'admin' && (
              <Menu
                menuButton={
                  <MenuButton className={styles.MenuButton}>
                    <IconEyeOff stroke={1.5} />
                  </MenuButton>
                }
                transition
              >
                <MenuItem
                  className="text-sm"
                  onClick={() => publishToShowcase({ shortlink })}
                >
                  (admin) Publish to showcase
                </MenuItem>
              </Menu>
            )}
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
            {params.tiling && (
              <Menu
                className={styles.MenuButton}
                menuButton={
                  <MenuButton>
                    <IconWall stroke={1.5} />
                  </MenuButton>
                }
                transition
                menuClassName={styles['menu']}
              >
                <MenuItem
                  className="text-sm"
                  onClick={() => handleTileClick('64px')}
                >
                  64px tiles
                </MenuItem>
                <MenuItem
                  className="text-sm"
                  onClick={() => handleTileClick('128px')}
                >
                  128px tiles
                </MenuItem>
                <MenuItem
                  className="text-sm"
                  onClick={() => handleTileClick('256px')}
                >
                  256px tiles
                </MenuItem>
                <MenuItem
                  className="text-sm"
                  onClick={() => handleTileClick('512px')}
                >
                  512px tiles
                </MenuItem>
                <MenuItem
                  className="text-sm"
                  onClick={() => handleTileClick('1024px')}
                >
                  1024px tiles
                </MenuItem>
              </Menu>
            )}
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
              {arrayHasValue(params.loras) && (
                <>
                  <li>
                    <strong>LoRAs:</strong>
                    {params.loras.map((lora: any, i: number) => {
                      if (
                        lora.is_version &&
                        !loraDetails[lora.name] &&
                        loraDetails[lora.name] !== false
                      ) {
                        return <div key={lora.name}>Loading...</div>
                      } else if (
                        lora.is_version &&
                        loraDetails[lora.name] === false
                      ) {
                        return (
                          <div key={lora.name}>Unable to load LoRA details</div>
                        )
                      }

                      return (
                        <div
                          key={`ts_${i}`}
                          style={{ paddingTop: i > 0 ? '4px' : 'unset' }}
                        >
                          {'- '}
                          <Linker
                            inline
                            href={`https://civitai.com/models/${
                              lora.is_version
                                ? `${
                                    loraDetails[lora.name].modelId
                                  }?modelVersionId=${lora.name}`
                                : `${lora.name}`
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            passHref
                            className="text-cyan-500"
                          >
                            <FlexRow gap={8}>
                              {lora.is_version
                                ? loraDetails[lora.name].model.name
                                : lora.name}
                              <IconExternalLink stroke={1.5} size={16} />
                            </FlexRow>
                          </Linker>
                          <div>&nbsp;&nbsp;Strength: {lora.model}</div>
                          <div>
                            &nbsp;&nbsp;CLIP: {isNaN(lora.clip) ? 1 : lora.clip}
                          </div>
                        </div>
                      )
                    })}
                  </li>
                  <li>&zwnj;</li>
                </>
              )}
              <li>
                <strong>Hi-res fix:</strong>{' '}
                {params.hires_fix ? 'true' : 'false'}
              </li>
              <li>
                <strong>Karras:</strong> {params.karras ? 'true' : 'false'}
              </li>
              {params.tiling && (
                <li>
                  <strong>Tiling:</strong>
                  {' true'}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
