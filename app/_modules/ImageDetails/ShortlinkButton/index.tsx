import { IconRefresh, IconShare } from '@tabler/icons-react'
import { createShortlink } from 'app/_api/createShortlink'
import { baseHost, basePath } from 'BASE_PATH'
import clsx from 'clsx'
import ImageParamsForApi from 'app/_data-models/ImageParamsForApi'
import { useState } from 'react'
import { userInfoStore } from 'app/_store/userStore'
import { getImageDetails, updateCompletedJob } from 'app/_utils/db'
import { generateBase64Thumbnail } from 'app/_utils/imageUtils'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import styles from './component.module.css'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'

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

    navigator?.clipboard
      ?.writeText(`${hostname}${basePath}?i=${_shortlink}`)
      .then(() => {
        showSuccessToast({ message: 'Shortlink URL copied to your clipboard!' })
      })
    // .catch((err) => {
    //   alert(err)
    // })
  }

  const getShortlink = async () => {
    const updatedImageDetails = await getImageDetails(imageDetails.jobId)

    if (updatedImageDetails.shortlink) {
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

      copyShortlink(shortlink)
    }

    setShortlinkPending(false)
  }

  return (
    <div
      className={clsx(
        styles['button-icon'],
        shortlinkPending && styles.buttonLoading
      )}
      onClick={async () => {
        getShortlink()
      }}
    >
      {shortlinkPending && (
        <IconRefresh className={styles.spinner} stroke={1.5} />
      )}
      {!shortlinkPending && <IconShare stroke={1.5} />}
    </div>
  )
}
