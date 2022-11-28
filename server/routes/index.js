const express = require('express')
const router = express.Router()

// Individual route files
const modelRoutes = require('./modelRoutes.js')

router.use('/artbot/api/v1/models', modelRoutes)

module.exports = router
