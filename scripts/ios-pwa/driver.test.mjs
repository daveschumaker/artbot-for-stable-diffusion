import assert from 'node:assert/strict'
import test from 'node:test'
import { Driver } from './driver.mjs'

const names = [
  'artbot-test.manifest.json',
  'artbot-test-0001.artbot-part',
  'artbot-test-0002.artbot-part'
]
// Native UI transport is simulated; the real adapter still selects requested
// cells, waits for dismissal, and validates the web input delivery boundary.
class PickerDriver extends Driver {
  constructor(files) {
    super('', '', '')
    this.files = files
    this.open = true
  }
  async web(script) {
    if (script.includes('files].map')) return this.files
    if (script.includes('filter(file=>file.size===0)'))
      return this.files
        .filter((file) => file.size === 0)
        .map((file) => file.name)
    return false
  }
  async exists() {
    return this.open
  }
  async button(label) {
    if (label === 'Open') this.open = false
  }
  async command(method, route, body) {
    if (method === 'GET') return false
    if (route === '/elements')
      return body.value.includes('BEGINSWITH')
        ? [{ 'element-6066-11e4-a52e-4f735466cecf': 'selected-cell' }]
        : []
    return null
  }
  async click() {}
  async snapshot() {}
  async waitWeb() {
    if (
      JSON.stringify(this.files.map((file) => file.name).sort()) !==
      JSON.stringify([...names].sort())
    )
      throw new Error('Timed out: native FileList matches the requested files')
  }
}
const readable = (name) => ({ name, size: 42 })
test('a complete readable native delivery is accepted', async () => {
  await new PickerDriver(names.map(readable)).openFiles(
    'Verify saved backup',
    'ArtBot Backups',
    names
  )
})
test('a selected manifest omitted by the provider has a distinct recoverable delivery error', async () => {
  await assert.rejects(
    new PickerDriver(names.slice(1).map(readable)).openFiles(
      'Verify saved backup',
      'ArtBot Backups',
      names
    ),
    (error) => {
      assert.equal(error.name, 'IncompleteNativeFiles')
      assert.deepEqual(error.missing, [names[0]])
      assert.deepEqual(error.received, names.slice(1))
      return true
    }
  )
})
test('an unexpected file never enters the incomplete-delivery recovery path', async () => {
  await assert.rejects(
    new PickerDriver([readable('another-backup.json')]).openFiles(
      'Verify saved backup',
      'ArtBot Backups',
      names
    ),
    /Timed out/
  )
})
test('a complete zero-byte delivery still fails as unavailable, not as checksum success', async () => {
  const files = names.map(readable)
  files[1].size = 0
  await assert.rejects(
    new PickerDriver(files).openFiles(
      'Verify saved backup',
      'ArtBot Backups',
      names
    ),
    { name: 'UnavailableNativeFiles' }
  )
})

for (const [label, files] of [
  ['an empty delivery', []],
  ['duplicate delivered names', [readable(names[1]), readable(names[1])]]
]) {
  test(`${label} never enters automatic reselection`, async () => {
    await assert.rejects(
      new PickerDriver(files).openFiles(
        'Verify saved backup',
        'ArtBot Backups',
        names
      ),
      /Timed out/
    )
  })
}
