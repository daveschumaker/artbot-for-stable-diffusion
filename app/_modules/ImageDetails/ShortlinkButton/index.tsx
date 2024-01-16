import { IconRefresh, IconShare } from '@tabler/icons-react'
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/slide.css'

import { createShortlink } from 'app/_api/createShortlink'
import { baseHost, basePath } from 'BASE_PATH'
import clsx from 'clsx'
import ImageParamsForApi from 'app/_data-models/ImageParamsForApi'
import { useState } from 'react'
import { userInfoStore } from 'app/_store/userStore'
import { getImageDetails, updateCompletedJob } from 'app/_utils/db'
import { generateBase64Thumbnail } from 'app/_utils/imageUtils'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import styles from './component.module.css'

export default function ShortlinkButton({
  imageDetails
}: {
  imageDetails: CreateImageRequest
}) {
  const [shortlinkPending, setShortlinkPending] = useState(false)

  const copyShortlink = (_shortlink: string) => {
    const hostname =
      window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : baseHost

    console.log(
      `New shortlink: ${window.location.protocol}//${window.location.hostname}${
        window.location.port ? ':' + window.location.port : ''
      }${basePath}?i=${_shortlink} `
    )

    navigator?.clipboard
      ?.writeText(`${hostname}${basePath}?i=${_shortlink}`)
      .then(() => {
        showSuccessToast({ message: 'Shortlink URL copied to your clipboard!' })
      })
  }

  const getShortlink = async () => {
    const updatedImageDetails = await getImageDetails(imageDetails.jobId)

    if (updatedImageDetails.shortlink) {
      if (window?.location?.hostname !== 'tinybots.net') {
        console.log(`Shortlink exists. Copied:`, updatedImageDetails.shortlink)
      }

      copyShortlink(updatedImageDetails.shortlink)
      return
    }

    if (shortlinkPending) {
      return
    }

    setShortlinkPending(true)

    const resizedImage = await generateBase64Thumbnail(
      imageDetails.base64String as string,
      imageDetails.jobId as string,
      512,
      768,
      0.9
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

      if (window?.location?.hostname !== 'tinybots.net') {
        console.log(`Shortlink copied:`, shortlink)
      }

      copyShortlink(shortlink)
    }

    setShortlinkPending(false)
  }

  const requestShowcase = async () => {
    const updatedImageDetails = await getImageDetails(imageDetails.jobId)

    if (shortlinkPending) {
      return
    }

    if (imageDetails.showcaseRequested) {
      showSuccessToast({
        message: 'Community showcase request sent!'
      })
    }

    setShortlinkPending(true)

    let shortlink
    if (updatedImageDetails.shortlink) {
      shortlink = updatedImageDetails.shortlink
    } else {
      const resizedImage = await generateBase64Thumbnail(
        imageDetails.base64String as string,
        imageDetails.jobId as string,
        512,
        768,
        0.9
      )

      const data = {
        // @ts-ignore
        imageParams: new ImageParamsForApi(imageDetails),
        imageBase64: resizedImage,
        username: userInfoStore.state.username
      }

      const shortlinkData = await createShortlink(data)
      shortlink = shortlinkData.shortlink

      if (shortlink) {
        await updateCompletedJob(
          imageDetails.id,
          Object.assign({}, imageDetails, {
            shortlink,
            showcaseRequested: true
          })
        )
      }
    }

    if (shortlink) {
      await fetch(`${basePath}/api/showcase-submit`, {
        method: 'POST',
        body: JSON.stringify({ shortlink }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    showSuccessToast({
      message: 'Community showcase request sent!'
    })

    setShortlinkPending(false)
  }

  return (
    <div
      className={clsx(
        styles['button-icon'],
        shortlinkPending && styles.buttonLoading
      )}
    >
      <Menu
        menuButton={
          <MenuButton>
            {shortlinkPending && (
              <IconRefresh className={styles.spinner} stroke={1.5} />
            )}
            {!shortlinkPending && <IconShare stroke={1.5} />}
          </MenuButton>
        }
        transition
        menuClassName={styles['menu']}
      >
        <MenuItem
          className="text-sm"
          onClick={async () => {
            getShortlink()
          }}
        >
          {imageDetails.shortlink ? 'Copy ' : 'Create '}
          shareable link
        </MenuItem>
        <MenuItem
          className="text-sm"
          disabled={imageDetails.showcaseRequested}
          onClick={async () => {
            if (!imageDetails.showcaseRequested) {
              requestShowcase()
            } else {
              showSuccessToast({
                message: 'Community showcase request sent!'
              })
            }
          }}
        >
          {!imageDetails.showcaseRequested
            ? 'Request showcase consideration'
            : 'Community showcase requested'}
        </MenuItem>
      </Menu>
    </div>
  )
}
