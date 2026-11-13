import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

// Fixture transport only. This never reads or writes the application's database.
// Let Files receive/register the document through its own Save to Files dialog;
// writing directly into File Provider Storage bypasses that native operation.
function transferPanel(name, base64) {
  document.getElementById('artbot-native-fixture-transfer')?.remove()
  const file = new File(
    [Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))],
    name,
    {
      type: name.endsWith('.json')
        ? 'application/json'
        : 'application/octet-stream'
    }
  )
  const panel = document.createElement('div')
  panel.id = 'artbot-native-fixture-transfer'
  panel.style =
    'position:fixed;inset:0;z-index:2147483647;background:white;color:black;padding:20px;overflow:auto'
  const heading = document.createElement('h1')
  heading.textContent = 'Synthetic test file transfer'
  const filename = document.createElement('p')
  filename.textContent = name
  const status = document.createElement('p')
  const button = document.createElement('button')
  button.textContent = 'Share/save transferred file'
  button.style = 'padding:20px;margin-top:20px'
  // The bytes are ready before this native tap. Share only the actual file.
  button.onclick = () => {
    button.disabled = true
    navigator.share({ files: [file] }).then(
      () => {
        status.textContent = 'Share sheet closed.'
      },
      (error) => {
        status.textContent = 'Transfer failed: ' + error.message
      }
    )
  }
  panel.append(heading, filename, button, status)
  document.body.append(panel)
  return true
}

export async function receiveExternalFile(driver, device, folder, name, bytes) {
  assert.equal(path.basename(name), name)
  assert.equal(path.basename(folder), folder)
  assert.ok(bytes.length > 0, 'Synthetic transfer must contain bytes')
  const target = path.join(device.files, folder, name)
  await assert.rejects(access(target), { code: 'ENOENT' })
  const expected = createHash('sha256').update(bytes).digest('hex')
  await driver.web(`return (${transferPanel.toString()})(...arguments)`, [
    name,
    bytes.toString('base64')
  ])
  try {
    await driver.share('Share/save transferred file', folder, async () => {
      try {
        const saved = await readFile(target)
        return (
          saved.length === bytes.length &&
          createHash('sha256').update(saved).digest('hex') === expected
        )
      } catch (error) {
        if (error.code === 'ENOENT') return false
        throw error
      }
    })
    return {
      name,
      folder,
      size: bytes.length,
      sha256: expected,
      method: 'native-save-to-files'
    }
  } finally {
    await driver.web(
      "document.getElementById('artbot-native-fixture-transfer')?.remove();return true"
    )
  }
}
