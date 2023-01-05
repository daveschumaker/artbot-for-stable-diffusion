const https = require('https')
const http = require('http')
const { URL } = require('url')

/**
 * Get file size from URL (in bytes) without downloading it.
 * @param {(string|URL)} url URL to get file size from
 * @param {number} [timeout=10000] Timeout in milliseconds
 * @param {number} [maxRedirects=5] Maximum number of redirects to follow
 * @return {Promise<number>} File size in bytes
 */
const ufs = (url, timeout = 10000, maxRedirects = 5) => {
  return new Promise((res, rej) => {
    if (url instanceof URL) {
      url = url.toString()
    }
    if (typeof url !== 'string')
      rej(new TypeError('url must be a string or instance of URL'))
    if (typeof timeout !== 'number')
      rej(new TypeError('timeout must be a number'))
    if (typeof maxRedirects !== 'number')
      rej(new TypeError('maxRedirects must be a number'))
    if (maxRedirects < 0) rej(new Error('maxRedirects must be greater than 0'))

    let req = url.startsWith('https://')
      ? https.get(url, { timeout })
      : http.get(url, { timeout })
    req.once('response', (r) => {
      req.destroy()
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        if (maxRedirects === 0) {
          return rej(new Error('Too many redirects'))
        }
        return res(ufs(r.headers.location, timeout, maxRedirects - 1))
      }
      let c = parseInt(r.headers['content-length'])
      if (!isNaN(c)) res(c)
      else rej("Couldn't get file size")
    })
    req.once('error', (e) => {
      req.destroy()
      rej(e)
    })
    req.once('timeout', (e) => {
      req.destroy()
      rej(e)
    })
  })
}
module.exports = ufs
