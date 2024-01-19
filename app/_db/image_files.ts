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
  options: GetAllImagesOptions
) => {
  if ('imageIdsOnly' in options) {
    return await db.image_files
      .where('jobId')
      .equals(jobId)
      .map((image: ImageModel) => {
        return image.hordeId
      })
  } else {
    return await db.image_files.where('jobId').equals(jobId)
  }
}

// TODO: Lookup uniqueKeys for a sort of "Select Distinct" when viewing list of images:
// https://dexie.org/docs/Collection/Collection.uniqueKeys()
