import sharp from 'sharp'

const names = [
  'AlbedoBase XL (SDXL)',
  'Deliberate',
  'Dreamshaper',
  'Realistic Vision',
  'DreamShaper Inpainting',
  'Anything Diffusion',
  'stable_diffusion',
  'Z-Image-Turbo'
]
const json = (body, status = 200) => ({
  status,
  contentType: 'application/json',
  headers: { 'access-control-allow-origin': '*' },
  body: JSON.stringify(body)
})

// External-service boundary only. State survives browser restarts; no real API
// requests or credentials are written to disk. Local application assets pass on.
export function createHorde({ basePath = '/artbot' } = {}) {
  const jobs = new Map()
  const submissions = []
  let released = false
  let releasedThrough = 0
  let outage = false
  let maxActive = 0
  const cancellations = []
  const interrogations = []
  const urlImports = []
  const unexpected = new Set()
  return {
    jobs,
    submissions,
    cancellations,
    interrogations,
    urlImports,
    unexpected,
    release() {
      released = true
    },
    releaseFirst(count) {
      releasedThrough = count
    },
    setOutage(value) {
      outage = value
    },
    summary() {
      return {
        submissions: submissions.length,
        maxActive,
        cancellations: cancellations.length,
        unexpected: [...unexpected]
      }
    },
    async install(context) {
      await context.route('**/*', async (route) => {
        const req = route.request()
        const url = new URL(req.url())
        if (!['http:', 'https:'].includes(url.protocol)) return route.continue()
        if (url.hostname === 'tinybots.net') {
          if (
            !url.pathname.startsWith(`${basePath}/api/`) ||
            url.pathname.endsWith('/server-info')
          )
            return route.continue()
          if (url.pathname.endsWith('/models/available'))
            return route.fulfill(
              json({
                success: true,
                models: names.map((name) => ({
                  name,
                  count: 5,
                  performance: 100000,
                  queued: 0,
                  eta: 5,
                  type: 'image'
                }))
              })
            )
          if (url.pathname.endsWith('/models/details'))
            return route.fulfill(
              json({
                success: true,
                models: Object.fromEntries(
                  names.map((name) => [
                    name,
                    {
                      name,
                      baseline: name.includes('XL')
                        ? 'stable_diffusion_xl'
                        : 'stable diffusion 1',
                      description: 'Regression fixture',
                      inpainting: name.includes('Inpainting'),
                      nsfw: false,
                      trigger: [],
                      type: 'ckpt',
                      version: '1'
                    }
                  ])
                )
              })
            )
          if (url.pathname.endsWith('/img-from-url')) {
            urlImports.push(req.postDataJSON())
            const bytes = await sharp({
              create: {
                width: 256,
                height: 256,
                channels: 3,
                background: 'blue'
              }
            })
              .webp()
              .toBuffer()
            return route.fulfill(
              json({
                success: true,
                imageType: 'image/webp',
                imgBase64String: bytes.toString('base64'),
                height: 256,
                width: 256
              })
            )
          }
          return route.fulfill(
            json(url.pathname.includes('showcase') ? [] : { success: true })
          )
        }
        if (url.hostname.endsWith('.r2.cloudflarestorage.com')) {
          const id = url.pathname.split('/').pop().replace('.webp', '')
          const job = jobs.get(id)
          if (!job)
            return route.fulfill(json({ message: 'unknown image' }, 404))
          const bytes = await sharp({
            create: {
              width: job.width,
              height: job.height,
              channels: 3,
              background: { r: 20 + job.index, g: 80, b: 160 }
            }
          })
            .webp()
            .toBuffer()
          return route.fulfill({
            status: 200,
            contentType: 'image/webp',
            headers: { 'access-control-allow-origin': '*' },
            body: bytes
          })
        }
        if (
          url.hostname === 'aihorde.net' ||
          url.hostname === 'dev.aihorde.net'
        ) {
          if (outage) return route.abort('internetdisconnected')
          if (req.method() === 'OPTIONS')
            return route.fulfill({
              status: 204,
              headers: {
                'access-control-allow-origin': '*',
                'access-control-allow-headers': '*',
                'access-control-allow-methods': '*'
              }
            })
          const endpoint = url.pathname
          if (
            endpoint.endsWith('/interrogate/async') &&
            req.method() === 'POST'
          ) {
            interrogations.push(req.postDataJSON())
            return route.fulfill(json({ id: 'snapshot-interrogation' }, 202))
          }
          if (endpoint.includes('/interrogate/status/'))
            return route.fulfill(
              json({
                state: 'done',
                forms: [
                  {
                    form: 'caption',
                    state: 'done',
                    result: { caption: 'a snapshot test image' }
                  }
                ]
              })
            )
          if (
            endpoint.includes('/find_user') ||
            endpoint.includes('/sharedkeys/')
          )
            return route.fulfill(
              json({
                id: 1234,
                username: 'Regression fixture',
                kudos: 10000000,
                trusted: true,
                concurrency: 10,
                records: {},
                worker_ids: [],
                sharedkey_ids: []
              })
            )
          if (endpoint.endsWith('/generate/async') && req.method() === 'POST') {
            const body = req.postDataJSON()
            const index = submissions.length + 1
            const id = `comparison-job-${index}`
            // Retain parameters in memory for assertions, never headers/API keys.
            submissions.push(body)
            jobs.set(id, {
              index,
              width: body.params.width,
              height: body.params.height,
              model: body.models[0],
              done: false,
              canceled: false
            })
            maxActive = Math.max(
              maxActive,
              [...jobs.values()].filter((j) => !j.done && !j.canceled).length
            )
            return route.fulfill(json({ id, kudos: 5 }, 202))
          }
          const match = endpoint.match(/\/generate\/(check|status)\/([^/]+)$/)
          if (match) {
            const [, type, id] = match
            const job = jobs.get(id)
            if (!job)
              return route.fulfill(json({ message: 'Unknown job' }, 404))
            if (req.method() === 'DELETE') {
              job.canceled = true
              cancellations.push(id)
              return route.fulfill(json({ generations: [], kudos: 0 }))
            }
            const done = released || job.index <= releasedThrough
            if (type === 'check')
              return route.fulfill(
                json({
                  done,
                  faulted: false,
                  finished: done ? 1 : 0,
                  processing: done ? 0 : 1,
                  waiting: 0,
                  wait_time: done ? 0 : 60,
                  queue_position: 0,
                  is_possible: true,
                  kudos: 5
                })
              )
            job.done = done
            return route.fulfill(
              json({
                done,
                faulted: false,
                kudos: 5,
                shared: false,
                generations: done
                  ? [
                      {
                        id: `generation-${job.index}`,
                        img: `https://fixture.r2.cloudflarestorage.com/${id}.webp`,
                        seed: String(1000 + job.index),
                        model: job.model,
                        censored: false,
                        worker_id: 'fixture-worker',
                        worker_name: 'Regression fixture'
                      }
                    ]
                  : []
              })
            )
          }
          if (endpoint.endsWith('/workers')) return route.fulfill(json([]))
          return route.fulfill(
            json({
              queued_requests: 0,
              queued_megapixelsteps: 0,
              worker_count: 10,
              thread_count: 10,
              past_minute_megapixelsteps: 1000
            })
          )
        }
        // Log host only; URLs can contain user secrets.
        unexpected.add(url.hostname)
        return route.abort('blockedbyclient')
      })
    }
  }
}
