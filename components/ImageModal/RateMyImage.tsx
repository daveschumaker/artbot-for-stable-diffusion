import { toast } from 'react-toastify'
import { useCallback, useEffect, useState } from 'react'
import { RATE_IMAGE_CUTOFF_SEC } from '../../constants'
import AppSettings from '../../models/AppSettings'
import { getImageDetails, updateCompletedJob } from '../../utils/db'
import StarRating from '../StarRating'
import { clientHeader } from '../../utils/appUtils'

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

  useEffect(() => {
    fetchImageDetails()
  }, [pending, jobId, fetchImageDetails])

  if (currentTimeStamp - createTimeStamp > RATE_IMAGE_CUTOFF_SEC) {
    return null
  }

  if (!imageDetails?.shareImagesExternally) {
    return null
  }

  if (imageDetails?.userRating !== null && imageDetails?.userRating >= 0) {
    return null
  }

  const rateImage = async (rating: number) => {
    if (pending) {
      return
    }

    setPending(true)

    const ratingData = {
      ratings: [
        {
          id: imageDetails.hordeImageId,
          rating
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
            userRating: rating
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
            userRating: rating
          })
        )

        return
      }
    } catch (err) {
      setPending(false)
      await updateCompletedJob(
        imageDetails.id,
        Object.assign({}, imageDetails, {
          userRating: rating
        })
      )

      return
    }
  }

  return (
    <div>
      <StarRating disabled={pending} onStarClick={rateImage} />
    </div>
  )
}

export default RateMyImage
