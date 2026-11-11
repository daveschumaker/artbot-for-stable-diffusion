// Stands in for CSS modules in Jest. Each class name maps to itself, so
// `styles.foo` is 'foo'. '__esModule' is false so a default import gets this
// object rather than its 'default' key.
module.exports = new Proxy(
  {},
  {
    get: (target, key) => (key === '__esModule' ? false : key)
  }
)
