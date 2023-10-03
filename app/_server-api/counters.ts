require('dotenv').config()
import appRoot from 'app-root-path'
import cron from 'node-cron'
import fs from 'fs'
import os from 'os'

const cache: any = {
  previousHour: null,
  totalImages: 0
}

const isProd = process.env.NODE_ENV === 'production'
const homeDirectory = isProd ? os.homedir() : appRoot + '/__local_db'
const filePath = homeDirectory + '/ArtBot_ImageCount.txt'

const saveCache = () => {
  fs.writeFile(filePath, String(cache.totalImages), function (err) {
    if (err) return console.log(err)
  })
}

export const getImageCount = () => {
  return cache.totalImages
}

export const updateImageCount = () => {
  cache.totalImages += 1
}

export const initLoadImageCount = () => {
  cron.schedule('0 * * * *', () => {
    logCountTotal()
  })

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8') || ''
    const [totalImages] = data.split('#')

    cache.totalImages = Number(totalImages)

    setInterval(() => {
      saveCache()
    }, 30000)
  } else {
    fs.writeFile(filePath, String(cache.totalImages), function (err) {
      if (err) return console.log(err)
    })
  }
}

const logCountTotal = async () => {
  const data: any = {
    totalImages: getImageCount()
  }

  if (cache.previousHour !== null) {
    data.velocity1hr = getImageCount() - cache.previousHour
  }

  cache.previousHour = getImageCount()

  try {
    await fetch(`http://localhost:4001/api/v1/artbot/counter`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return {
      success: true
    }
  } catch (err) {
    // eh, it's okay if nothing happens.
    return {
      success: true
    }
  }
}
