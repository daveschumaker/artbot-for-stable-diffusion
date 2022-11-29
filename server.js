const express = require('express')
const next = require('next')

const { initModelDataFetch } = require('./server/cache/models')
const { initServerStatusFetch } = require('./server/cache/serverStatus')
const routes = require('./server/routes/index.js')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  try {
    await app.prepare()
    const server = express()

    initModelDataFetch()
    initServerStatusFetch()

    server.get('/', (req, res) => {
      res.redirect('/artbot')
    })

    server.use(routes)

    server.all('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) {
        if (err) throw err
      }

      console.log(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`)
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})
