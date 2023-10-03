import { basePath } from 'BASE_PATH'

let isPending = false

interface IModelUpdatesResponse {
  success: boolean
  changes: Array<IModelUpdate>
  timestamp: number
}

interface IModelUpdate {
  modelName: string
  timestamp: number
  status: string
}

export const fetchModelUpdates = async () => {
  if (isPending) {
    return
  }

  isPending = true
  // let modelUpdates: Array<any> = []

  try {
    const res = await fetch(`${basePath}/api/models/updates`)
    const data: IModelUpdatesResponse = await res.json()
    const { success, changes = [], timestamp } = data

    isPending = false
    if (success) {
      return {
        success: true,
        changes,
        timestamp
      }
    }

    return {
      success: true,
      changes: [],
      timestamp: Date.now()
    }
  } catch (err) {
    console.log(`Warning: Unable to fetch available models. API offline?`)
    isPending = false
    return {
      success: true,
      changes: [],
      timestamp: Date.now()
    }
  }
}
