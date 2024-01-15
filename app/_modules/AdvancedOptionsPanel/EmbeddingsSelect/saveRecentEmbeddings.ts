import { MAX_TI_CACHE } from '_constants'
import { Embedding } from '_types/civitai'

export const handleSaveRecentEmbedding = (embedding: Embedding) => {
  // Check if the local storage already has an array stored
  let existingArray = localStorage.getItem('recentEmbeddings')
  let newArray

  if (existingArray) {
    // Parse the existing array from the local storage
    newArray = JSON.parse(existingArray)

    // Check if the object with the same id already exists in the array
    const existingObjectIndex = newArray.findIndex(
      (obj: any) => obj.id === embedding.id
    )

    if (existingObjectIndex !== -1) {
      // Remove the existing object from the array
      newArray.splice(existingObjectIndex, 1)
    }

    // Add the object to the front of the array
    newArray.unshift(embedding)

    if (newArray.length > MAX_TI_CACHE) {
      newArray = newArray.slice(0, MAX_TI_CACHE)
    }
  } else {
    // Create a new array with the object
    newArray = [embedding]
  }

  // Store the updated array back in the local storage
  localStorage.setItem('recentEmbeddings', JSON.stringify(newArray))
}
