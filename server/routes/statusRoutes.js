const { getServerSettings } = require('../cache/serverStatus.js')

const express = require('express')
const router = express.Router()

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
