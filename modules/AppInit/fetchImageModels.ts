import {
  modelStore,
  setAvailableModels,
  setModelDetails
} from '../../store/modelStore'

// TODO: Switch over to fetching from AI Horde after initial load.
let isInitial = false

// TODO: Handle waiting for server response / pending request

async function loadAvailableModels() {
  try {
    const availableResp = await fetch(`/artbot/api/models-available`)
    const { models: availableModels } = await availableResp.json()

    // On initial server boot, models may not be loaded. If this happens, wait a few seconds and try again.
    if (availableModels.length <= 1) {
      setTimeout(() => {
        loadAvailableModels()
      }, 1000)

      return
    }

    const currentModelCount = Object.keys(
      modelStore.state.availableModels
    ).length

    // Prevent overwriting existing models data if API encounters an error.
    const validCount = currentModelCount > 1 && availableModels.length > 1

    if (validCount || currentModelCount === 0) {
      setAvailableModels(availableModels)
    }
  } catch (e: any) {}
}

async function loadModelDetails() {
  try {
    // TODO: Move up
    const detailsResp = await fetch(`/artbot/api/model-details`)
    const { details: modelDetails } = await detailsResp.json()

    // On initial server boot, models may not be loaded. If this happens, wait a few seconds and try again.
    if (Object.keys(modelDetails).length === 0) {
      setTimeout(() => {
        loadModelDetails()
      }, 1000)

      return
    }

    if (Object.keys(modelDetails).length >= 1) {
      setModelDetails(modelDetails)
    }
  } catch (e: any) {}
}

export default async function fetchImageModels() {
  if (!isInitial) isInitial = true

  await loadAvailableModels()
  await loadModelDetails()
}
