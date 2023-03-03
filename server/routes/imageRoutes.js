const express = require('express')
const router = express.Router()

router.get('/:shortlink', async (req, res) => {
  const { shortlink } = req.params

  if (shortlink) {
    const resp = await fetch(
      `${process.env.SHORTLINK_SERVICE}/api/v1/shortlink/image/${shortlink}`
    )
    const data = (await resp.json()) || {}
    const { base64 } = data

    if (base64) {
      const img = Buffer.from(base64, 'base64')
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
      })
      return res.end(img)
    }

    return res.send('')
  }
})

router.get('/', async (req, res) => {
  res.send({
    success: true
  })
})

module.exports = router
