const { getServerSettings } = require('../cache/serverStatus.js')

const express = require('express')
const router = express.Router()

router.get('/message', async (req, res) => {
  const { message, enrollPct } = getServerSettings()

  res.send({
    success: true,
    message,
    enrollPct
  })
})

module.exports = router
