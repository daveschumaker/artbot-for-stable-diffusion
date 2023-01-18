const express = require('express')
const router = express.Router()

const { getAvailableModels, getModelDetails } = require('../cache/models.js')
const { fetchModelChanges } = require('../cache/modelUpdates.js')

router.get('/available', async (req, res) => {
  const { timestamp, models } = getAvailableModels()

  res.send({
    success: true,
    timestamp,
    models
  })
})

router.get('/details', async (req, res) => {
  const { timestamp, models } = getModelDetails()

  res.send({
    success: true,
    timestamp,
    models
  })
})

router.get('/updates', async (req, res) => {
  const changes = fetchModelChanges()
  const timestamp = Date.now()

  res.send({
    success: true,
    changes,
    timestamp
  })
})

router.get('/', async (req, res) => {
  res.send({
    success: true
  })
})

module.exports = router
