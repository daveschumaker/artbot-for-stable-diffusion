require('dotenv').config()
const LocalStorage = require('node-localstorage').LocalStorage
const __DEV__ = process.env.NODE_ENV !== 'production'

const dataPath = __DEV__
  ? process.env.DEV_MODEL_CHANGE_DB
  : process.env.PROD_MODEL_CHANGE_DB

const localStorage = new LocalStorage(dataPath, 10485760)

// Store latest instance of model details fetched from remote API.
// Use to compare against new requests.
let cachedModelDetails = null

// In-memory cache for model changes.
let cachedModelChanges = []

const storageActions = {
  load() {
    try {
      const data = localStorage.getItem('updates') || ''
      const parsedChanges = JSON.parse(data) || []
      cachedModelChanges = [...parsedChanges]
      return parsedChanges
    } catch (err) {
      return []
    }
  },
  set(modelChange = {}) {
    try {
      const data = storageActions.load()
      data.push(modelChange)
      const trimmedArray = data.slice(-100) || []
      cachedModelChanges = [...trimmedArray]
      localStorage.setItem('updates', JSON.stringify(trimmedArray))
      return
    } catch (err) {
      return
    }
  }
}

const loadInitChanges = () => {
  storageActions.load()
}

const modelActions = {
  add(modelName, version) {
    return {
      message: `New model added: "${modelName}", version: ${version}`,
      status: 'ADDED',
      modelName,
      version,
      timestamp: Date.now()
    }
  },
  remove(modelName) {
    return {
      message: `Model removed: ${modelName}`,
      status: 'REMOVED',
      modelName,
      timestamp: Date.now()
    }
  },
  update(modelName, version) {
    return {
      message: `Model updated: new version of "${modelName}" - version ${version}`,
      modelName,
      version,
      status: 'UPDATED',
      timestamp: Date.now()
    }
  }
}

const cloneModelDetails = (modelDetails = {}) => {
  cachedModelDetails = Object.assign(
    {},
    JSON.parse(JSON.stringify(modelDetails))
  )
}

const modelDiff = (modelDetails = {}) => {
  if (!cachedModelDetails) {
    cloneModelDetails(modelDetails)
    return
  }

  // Check for empty object or error state in incoming models.
  if (
    modelDetails && // null and undefined check
    Object.keys(modelDetails).length === 0 &&
    Object.getPrototypeOf(modelDetails) === Object.prototype
  ) {
    return
  }

  // Check if any models have been removed
  for (const key in cachedModelDetails) {
    if (!modelDetails[key]) {
      // modelUpdatesCache.push(modelActions.remove(key))
      storageActions.set(modelActions.remove(key))
    }
  }

  // Check latest modelDetails against cache for any changes
  for (const key in modelDetails) {
    if (!cachedModelDetails[key]) {
      const version = modelDetails[key].version
      // modelUpdatesCache.push(modelActions.add(key, version))
      storageActions.set(modelActions.add(key, version))
    }

    if (modelDetails[key] && cachedModelDetails[key]) {
      if (modelDetails[key].version !== cachedModelDetails[key].version) {
        console.log(modelDetails[key])
        const version = modelDetails[key].version
        // modelUpdatesCache.push(modelActions.update(key, version))
        storageActions.set(modelActions.update(key, version))
      }
    }
  }

  // Finally, update cachedModelDetails for future comparison.
  cloneModelDetails(modelDetails)
}

const fetchModelChanges = () => {
  return cachedModelChanges || []
}

module.exports = {
  fetchModelChanges,
  loadInitChanges,
  modelDiff
}
