// Test-process filesystem boundary: keep server settings/counters separate from
// the developer's real home directory without changing HOME or application code.
const os = require('node:os')
const path = require('node:path')
const directory = process.env.ARTBOT_TEST_DATA_DIR
if (!directory || !path.isAbsolute(directory)) {
  throw new Error(
    'ARTBOT_TEST_DATA_DIR must be an absolute test-data directory'
  )
}
os.homedir = () => directory
