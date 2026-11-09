const Module = require('module')

// jsdom loads the optional `canvas` package if it can resolve it, then crashes
// if its native binary isn't built. Tests don't need it, so hide it from jsdom.
const resolveFilename = Module._resolveFilename
Module._resolveFilename = function (request, parent, ...rest) {
  if (request === 'canvas' && parent?.filename?.includes('/jsdom/')) {
    const error = new Error("Cannot find module 'canvas'")
    error.code = 'MODULE_NOT_FOUND'
    throw error
  }

  return resolveFilename.call(this, request, parent, ...rest)
}

const { TestEnvironment } = require('jest-environment-jsdom')

// jsdom doesn't expose structuredClone, which fake-indexeddb requires.
class JsdomWithIndexedDb extends TestEnvironment {
  // The default "browser" condition selects Dexie's ESM build, which Jest can't load.
  customExportConditions = ['node', 'node-addons']

  async setup() {
    await super.setup()
    this.global.structuredClone = structuredClone
  }
}

module.exports = JsdomWithIndexedDb
