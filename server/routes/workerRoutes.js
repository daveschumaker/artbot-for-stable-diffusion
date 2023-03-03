const express = require('express')
const { getWorkerDetails } = require('../cache/workerDetails')
const router = express.Router()

router.get('/current', async (req, res) => {
  const workers = getWorkerDetails()

  res.send({
    success: true,
    workers
  })
})

module.exports = router
