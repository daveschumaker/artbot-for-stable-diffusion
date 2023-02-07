require('dotenv').config()
const fs = require('fs')

const cache = {
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

const getImageCount = () => {
  return cache.totalImages
}

const updateImageCount = () => {
  cache.totalImages += 1
}

const initLoadCount = () => {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

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

const countTotal = async () => {
  const data = {
    totalImages: cache.totalImages
  }
  try {
    await fetch(`http://localhost:4001/api/v1/artbot/counter`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    // eh, it's okay if nothing happens.
  }
}

// Once an hour, update counter with latest total image count.
setInterval(() => {
  countTotal()
}, 60000 * 60)

module.exports = {
  getImageCount,
  initLoadCount,
  updateImageCount
}
