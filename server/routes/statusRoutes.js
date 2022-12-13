const { getServerSettings } = require('../cache/serverStatus.js')

const express = require('express')
const { updateImageCount, getImageCount } = require('../cache/perf.js')
const router = express.Router()

router.get('/image-count', async (req, res) => {
  const totalImages = getImageCount()

  res.send({
    success: true,
    totalImages
  })
})

router.post('/new-image', async (req, res) => {
  updateImageCount()

  res.send({
    success: true
  })
})

router.get('/message', async (req, res) => {
  const { message, enrollPct, showBetaOption } = getServerSettings()

  res.send({
    success: true,
    message,
    enrollPct,
    showBetaOption
  })
})

module.exports = router
