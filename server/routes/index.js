const express = require('express')
const router = express.Router()

// Individual route files
const modelRoutes = require('./modelRoutes.js')
const statusRoutes = require('./statusRoutes.js')

router.use('/artbot/api/v1/models', modelRoutes)
router.use('/artbot/api/v1/status', statusRoutes)

module.exports = router
