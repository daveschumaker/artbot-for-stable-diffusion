const { getServerMessage } = require('../cache/serverStatus.js')

const express = require('express')
const router = express.Router()

router.get('/message', async (req, res) => {
  const { message } = getServerMessage()

  res.send({
    success: true,
    message
  })
})

module.exports = router
