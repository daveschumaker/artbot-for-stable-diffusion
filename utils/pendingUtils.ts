import { CreatePendingJob } from '../types'
import { uuidv4 } from './appUtils'
import { orientationDetails } from './imageUtils'

interface ImageSize {
  orientation: string
  height: number
  width: number
}

export const createPendingJob = (imageParams: CreatePendingJob) => {
  const { prompt } = imageParams
  let { numImages = 1 } = imageParams
  let jobsToSend: Array<CreatePendingJob> = []

  if (!prompt || !prompt?.trim()) {
    return []
  }

  if (isNaN(numImages) || numImages < 1 || numImages > 20) {
    numImages = 1
  }

  // Used in tracking groups of related images over multiple
  // generation events. e.g., if someone makes a bunch of photos of robots
  // and then comes back a few days later to pick up where they left off.
  // All those images should logically be grouped together.
  if (!imageParams.parentJobId) {
    imageParams.parentJobId = uuidv4()
  }

  // Used in tracking groups of images created per generation event.
  // e.g., if someone makes a group of 20 photos of robots, they will have the
  // same timestamp. Then later come back and make another group, they
  // will have a different timestamp.
  imageParams.jobTimestamp = Date.now()

  for (let i = 0; i < numImages; i++) {
    // Create a temporary uuid for easier lookups.
    // Will be replaced later when job is accepted
    // by API
    const clonedParams = Object.assign({}, imageParams)
    clonedParams.jobId = uuidv4()
    clonedParams.jobStartTimestamp = Date.now()

    const imageSize: ImageSize = orientationDetails(
      clonedParams.orientationType || 'square'
    )
    clonedParams.orientation = imageSize.orientation
    clonedParams.height = imageSize.height
    clonedParams.width = imageSize.width

    jobsToSend.push(clonedParams)
  }

  return jobsToSend
}
