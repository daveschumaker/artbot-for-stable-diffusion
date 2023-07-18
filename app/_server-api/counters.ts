require('dotenv').config()
import cron from 'node-cron'
import fs from 'fs'

const cache: any = {
  previousHour: null,
  totalImages: 0
}

const saveCache = () => {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  if (process.env.PROD_COUNT_FILE) {
    fs.writeFile(
      process.env.PROD_COUNT_FILE,
      String(cache.totalImages),
      function (err) {
        if (err) return console.log(err)
      }
    )
  }
}

export const getImageCount = () => {
  return cache.totalImages
}

export const updateImageCount = () => {
  cache.totalImages += 1
}

export const initLoadImageCount = () => {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  cron.schedule('0 * * * *', () => {
    logCountTotal()
  })

  if (
    process.env.PROD_COUNT_FILE &&
    fs.existsSync(process.env.PROD_COUNT_FILE)
  ) {
    const data = fs.readFileSync(process.env.PROD_COUNT_FILE, 'utf8') || ''
    const [totalImages] = data.split('#')

    cache.totalImages = Number(totalImages)

    setInterval(() => {
      saveCache()
    }, 60000)
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
