require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const next = require('next')
const { initHordePerfMonitor } = require('./server/cache/hordeInfo')

const { initModelDataFetch } = require('./server/cache/models')
const { initLoadCount } = require('./server/cache/perf')
const { initServerStatusFetch } = require('./server/cache/serverStatus')
const { initWorkerDetailsFetch } = require('./server/cache/workerDetails')
const routes = require('./server/routes/index.js')

initLoadCount()

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  try {
    await app.prepare()
    const server = express()

    // parse application/json
    server.use(bodyParser.json({ limit: '5mb' }))
    server.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }))

    initModelDataFetch()
    initServerStatusFetch()
    initWorkerDetailsFetch()
    initHordePerfMonitor()

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

      console.log('\n--- ArtBot Server Online --')
      console.log(new Date())
      console.log(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`)
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})
