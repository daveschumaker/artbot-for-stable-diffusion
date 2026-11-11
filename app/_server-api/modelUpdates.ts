require('dotenv').config()
import appRoot from 'app-root-path'
import os from 'os'
import { LocalStorage } from 'node-localstorage'

const isProd = process.env.NODE_ENV === 'production'
const homeDirectory = isProd ? os.homedir() : appRoot + '/__local_db'
const dataPath = homeDirectory + '/.ArtBot_ModelChanges'

const localStorage = new LocalStorage(dataPath, 10485760)

// In-memory cache for model changes.
let cachedModelChanges: any[] = []

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

export const fetchModelChanges = () => {
  return cachedModelChanges || []
}
