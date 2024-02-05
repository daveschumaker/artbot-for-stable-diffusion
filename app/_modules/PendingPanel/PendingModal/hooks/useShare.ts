import { baseHost, basePath } from 'BASE_PATH'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import { useContext, useState } from 'react'
import { ImageDetailsContext } from '../ImageDetailsProvider'
import { getImageDetails, updateCompletedJob } from 'app/_utils/db'
import { createShortlink } from 'app/_api/createShortlink'
import ImageParamsForApi from 'app/_data-models/ImageParamsForApi'
import { userInfoStore } from 'app/_store/userStore'
import { generateBase64Thumbnail } from 'app/_utils/imageUtils'
import { blobToBase64 } from 'app/_utils/blobUtils'
import { getImageByHordeId } from 'app/_db/image_files'

interface ShortLinkOptions {
  showcase?: boolean
}

type UseShareReturnType = [
  boolean,
  (options?: ShortLinkOptions) => Promise<void>
]

export default function useShare(): UseShareReturnType {
  const context = useContext(ImageDetailsContext)
  const { currentImageId, imageDetails } = context
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

    navigator?.clipboard?.writeText(`${hostname}${basePath}?i=${_shortlink}`)
  }

  const getShortlink = async (options: ShortLinkOptions = {}) => {
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

    const image = await getImageByHordeId(currentImageId)

    if (!image || !image.blob) {
      setShortlinkPending(false)
      return
    }

    const base64FromBlob = (await blobToBase64(image.blob)).split(',')[1]
    const resizedImage = await generateBase64Thumbnail(
      base64FromBlob as string,
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

    if (options.showcase) {
      await fetch(`${basePath}/api/showcase-submit`, {
        method: 'POST',
        body: JSON.stringify({ shortlink }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      showSuccessToast({
        message: 'Community showcase request sent!'
      })
    } else {
      showSuccessToast({ message: 'Shortlink URL copied to your clipboard!' })
    }

    setShortlinkPending(false)
  }

  return [shortlinkPending, getShortlink]
}
