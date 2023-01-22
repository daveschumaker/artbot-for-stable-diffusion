import { toast } from 'react-toastify'
import { useCallback, useEffect, useState } from 'react'
import { RATE_IMAGE_CUTOFF_SEC, RATING_QUALITY_MAP } from '../../constants'
import AppSettings from '../../models/AppSettings'
import { getImageDetails, updateCompletedJob } from '../../utils/db'
import StarRating from '../StarRating'
import { clientHeader } from '../../utils/appUtils'
import useComponentState from '../../hooks/useComponentState'

interface IProps {
  jobId: string
}

interface IImageDetails {
  hordeImageId: string
  id: number
  shareImagesExternally: boolean
  timestamp: number
  userRating: null | number
}

const initState = {
  hordeImageId: '',
  id: 0,
  shareImagesExternally: false,
  timestamp: 0,
  userRating: null
}

const RateMyImage = ({ jobId }: IProps) => {
  const [pending, setPending] = useState(false)
  const [imageDetails, setImageDetails] = useState<IImageDetails>({
    ...initState
  })

  const currentTimeStamp = Date.now() / 1000
  const createTimeStamp = imageDetails?.timestamp / 1000

  const fetchImageDetails = useCallback(async () => {
    const data = await getImageDetails(jobId)
    setImageDetails(data)
  }, [jobId])

  const [componentState, setComponentState] = useComponentState({
    rateImage: -Infinity,
    rateQuality: -Infinity
  })

  useEffect(() => {
    fetchImageDetails()
  }, [pending, jobId, fetchImageDetails])

  const rateImage = useCallback(
    (rating: number) => {
      if (pending) {
        return
      }

      setComponentState({
        rateImage: rating
      })
    },
    [pending, setComponentState]
  )

  const rateQuality = (rating: number) => {
    if (pending) {
      return
    }

    setComponentState({
      rateQuality: rating
    })
  }

  const rateImageRequest = useCallback(async () => {
    if (pending) {
      return
    }

    setPending(true)

    const ratingData = {
      ratings: [
        {
          id: imageDetails.hordeImageId,
          rating: componentState.rateImage,
          artifacts: RATING_QUALITY_MAP[componentState.rateQuality]
        }
      ]
    }

    try {
      const res = await fetch(
        `https://stablehorde.net/api/v2/generate/rate/${jobId}`,
        {
          method: 'POST',
          body: JSON.stringify(ratingData),
          headers: {
            'Content-Type': 'application/json',
            'Client-Agent': clientHeader()
          }
        }
      )

      const data = await res.json()
      const { reward, message } = data

      if (reward) {
        let totalRated = AppSettings.get('imagesRated') || 0
        let kudosEarned = AppSettings.get('kudosEarnedByRating') || 0
        totalRated++
        kudosEarned += reward

        AppSettings.save('imagesRated', totalRated)
        AppSettings.save('kudosEarnedByRating', kudosEarned)
        setPending(false)

        await updateCompletedJob(
          imageDetails.id,
          Object.assign({}, imageDetails, {
            userRating: componentState.rateImage,
            userQuality: componentState.rateQuality
          })
        )

        toast.success('Thanks for rating your image!', {
          pauseOnFocusLoss: false,
          position: 'top-center',
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          theme: 'light'
        })
      }

      if (
        message === 'This generation appears already rated' ||
        message.indexOf('not found') >= 0
      ) {
        setPending(false)
        await updateCompletedJob(
          imageDetails.id,
          Object.assign({}, imageDetails, {
            userRating: componentState.rateImage,
            userQuality: componentState.rateQuality
          })
        )

        return
      }
    } catch (err) {
      setPending(false)
      await updateCompletedJob(
        imageDetails.id,
        Object.assign({}, imageDetails, {
          userRating: componentState.rateImage,
          userQuality: componentState.rateQuality
        })
      )

      return
    }
  }, [
    componentState.rateImage,
    componentState.rateQuality,
    imageDetails,
    jobId,
    pending
  ])

  useEffect(() => {
    if (
      componentState.rateImage === -Infinity ||
      componentState.rateQuality === -Infinity
    ) {
      return
    }

    rateImageRequest()
  }, [componentState.rateImage, componentState.rateQuality, rateImageRequest])

  if (currentTimeStamp - createTimeStamp > RATE_IMAGE_CUTOFF_SEC) {
    return null
  }

  if (!imageDetails?.shareImagesExternally) {
    return null
  }

  if (imageDetails?.userRating !== null && imageDetails?.userRating >= 0) {
    return null
  }

  // return <StarRating disabled={pending} onStarClick={rateImage} />

  return (
    <>
      <div className="mt-2 flex flex-col align-center items-center w-full">
        <div>
          How much do <em>you</em> like this image?
        </div>
        <div className="flex flex-row items-center gap-2">
          <span className="text-xs">worst</span>
          <StarRating
            disabled={componentState.ratingPending}
            onStarClick={rateImage}
          />
          <span className="text-xs">best</span>
        </div>
      </div>
      <div className="mt-2 flex flex-col align-center items-center w-full">
        <div>Image quality? (flaws, artifacts, etc)</div>
        <div className="flex flex-row items-center gap-2">
          <span className="text-xs">worst</span>
          <StarRating
            count={5}
            disabled={componentState.ratingPending}
            onStarClick={rateQuality}
          />
          <span className="text-xs">best</span>
        </div>
      </div>
    </>
  )
}

export default RateMyImage
