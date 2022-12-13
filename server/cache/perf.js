require('dotenv').config()
const fs = require('fs')

const cache = {
  totalImages: 0
}

const saveCache = () => {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  fs.writeFile(
    process.env.PROD_COUNT_FILE,
    String(cache.totalImages),
    function (err) {
      if (err) return console.log(err)
    }
  )
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

module.exports = {
  getImageCount,
  initLoadCount,
  updateImageCount
}
