const buildInfo = require('../../build_info.json')
const { build } = buildInfo
const { getClusterSettings } = require('../cache/serverStatus.js')

const express = require('express')
const {
  updateImageCount,
  getImageCount,
  adjustCount
} = require('../cache/perf.js')
const router = express.Router()

router.get('/heartbeat', async (req, res) => {
  res.send({
    success: true,
    build
  })
})

router.get('/image-count', async (req, res) => {
  const totalImages = getImageCount()

  res.send({
    success: true,
    totalImages
  })
})

// Handle pesky issue where server reboot sometimes causes in-memory counter to get wiped out.
// This allows me to restore image counter from internal API without rebooting server.
router.get('/adjust-image-count', async (req, res) => {
  const isLocal = req.connection.localAddress === req.connection.remoteAddress

  if (isLocal && !isNaN(req.query.count)) {
    adjustCount(req.query.count)
  }

  res.send({
    success: true
  })
})

router.post('/new-image', async (req, res) => {
  updateImageCount()

  res.send({
    success: true
  })
})

router.get('/cluster-settings', async (req, res) => {
  res.send({
    ...getClusterSettings()
  })
})

module.exports = router
