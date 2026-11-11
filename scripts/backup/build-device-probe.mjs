import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)
const webpack = require('next/dist/compiled/webpack/webpack').webpack
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const output = path.resolve(
  process.argv[2] || '/tmp/artbot-backup-device-probe.js'
)
await new Promise((resolve, reject) =>
  webpack(
    {
      mode: 'production',
      target: 'web',
      entry: path.join(root, 'e2e/fixtures/backupDeviceProbe.ts'),
      output: { path: path.dirname(output), filename: path.basename(output) },
      resolve: {
        extensions: ['.ts', '.js'],
        modules: [path.join(root, 'node_modules')]
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: path.join(root, 'scripts/backup/ts-loader.cjs')
          }
        ]
      },
      plugins: [new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })],
      optimization: { minimize: false },
      devtool: false
    },
    (error, stats) =>
      error || stats.hasErrors()
        ? reject(
            error || new Error(stats.toString({ all: false, errors: true }))
          )
        : resolve()
  )
)
console.log(`Device probe built: ${output}`)
