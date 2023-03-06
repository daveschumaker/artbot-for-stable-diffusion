const express = require('express')
const { getHordePerformanceCache } = require('../cache/hordeInfo')
const router = express.Router()

router.get('/performance', async (req, res) => {
  const perfStats = getHordePerformanceCache()

  res.send({
    success: true,
    perfStats
  })
})

module.exports = router
