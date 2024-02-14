import ImageModel from 'app/_data-models/v2/ImageModel'
import { db } from './dexie'

export const addImageToDexie = async (image: ImageModel) => {
  try {
    await db.image_files.add({
      ...image
    })
  } catch (err) {
    console.log(`Error: Unable to add image to IndexedDb`)
    console.log(err)
  }
}

export const deleteImageFromDexie = async (hordeId: string) => {
  await db.image_files.where('hordeId').equals(hordeId).delete()
}

export const getImageByHordeId = async (hordeId: string) => {
  return await db.image_files.where('hordeId').equals(hordeId).first()
}

// This is silly and should only be used for debugging purposes,
// as jobIds can contain multiple images.
export const getImageByJobId = async (jobId: string) => {
  return await db.image_files.where('jobId').equals(jobId).first()
}

interface GetAllImagesOptions {
  imageIdsOnly?: boolean
}

export const getAllImagesByJobId = async (
  jobId: string,
  options: GetAllImagesOptions = {}
): Promise<ImageModel[] | string[]> => {
  const images: ImageModel[] = await db.image_files
    .where('jobId')
    .equals(jobId)
    .toArray()
  images.sort((a, b) => {
    // Check if both have blobs or neither have blobs
    if ((a.blob === null) === (b.blob === null)) {
      // If both have blobs or neither have blobs, sort by id
      // @ts-ignore
      return a.id - b.id
    }
    // If only one has a blob, it should come first
    return a.blob === null ? 1 : -1
  })

  if ('imageIdsOnly' in options) {
    return images.map((image: ImageModel) => {
      return image.hordeId
    })
  } else {
    return images
  }
}

// TODO: In order to sort by "unique jobIds", I'll need to query the
// "completed" table instead of the "image_files" table. Then somehow,
// map the jobId to the first available image for that job.
// Additionally, I should return number of images for each job.

export const getAllImages = async (
  options: GetAllImagesOptions = {}
): Promise<ImageModel[] | string[]> => {
  const images: ImageModel[] = await db.image_files.toArray()

  images.sort((a, b) => {
    // Check if both have blobs or neither have blobs
    if ((a.blob === null) === (b.blob === null)) {
      // If both have blobs or neither have blobs, sort by id in descending order
      // @ts-ignore
      return b.id - a.id // Change made here to sort by most recent first
    }
    // If only one has a blob, it should come first
    return a.blob === null ? 1 : -1
  })

  if ('imageIdsOnly' in options) {
    return images.map((image: ImageModel) => {
      return image.hordeId
    })
  } else {
    return images
  }
}

export const getFirstImagePerJobID = async (
  options: GetAllImagesOptions = {}
): Promise<ImageModel[] | string[]> => {
  // Step 1: Get list of unique JobIDs from db.completed
  const uniqueJobIDs: string[] = await db.completed
    .toArray()
    .then((completed) => {
      // Assuming 'completed' is an array of objects where each has a 'jobId' property
      return completed
        .map((item) => item.jobId)
        .filter((value, index, self) => self.indexOf(value) === index)
    })

  // Step 2: For each JobID, find the first matching image in db.image_files and collect them
  const firstImagesPerJobID: ImageModel[] = []

  for (const jobId of uniqueJobIDs) {
    const matchingImage = await db.image_files.where({ jobId }).first()
    if (matchingImage) {
      firstImagesPerJobID.push(matchingImage)
    }
  }

  firstImagesPerJobID.sort((a, b) => {
    // Check if both have blobs or neither have blobs
    if ((a.blob === null) === (b.blob === null)) {
      // If both have blobs or neither have blobs, sort by id in descending order
      // @ts-ignore
      return b.id - a.id // Change made here to sort by most recent first
    }
    // If only one has a blob, it should come first
    return a.blob === null ? 1 : -1
  })

  // Step 3: Return the images or imageIds based on the options
  if ('imageIdsOnly' in options) {
    return firstImagesPerJobID.map((image) => image.hordeId)
  } else {
    return firstImagesPerJobID
  }
}

// TODO: Lookup uniqueKeys for a sort of "Select Distinct" when viewing list of images:
// https://dexie.org/docs/Collection/Collection.uniqueKeys()
