const { getAvailableModels, getModelDetails } = require('../cache/models.js')

const express = require('express')
const router = express.Router()

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

router.get('/', async (req, res) => {
  res.send({
    success: true
  })
})

module.exports = router
