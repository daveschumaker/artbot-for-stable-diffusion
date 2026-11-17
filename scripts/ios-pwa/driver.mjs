import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

export async function poll(description, action, timeout = 60000) {
  const end = Date.now() + timeout
  let last
  while (Date.now() < end) {
    try {
      const value = await action()
      if (value) return value
    } catch (error) {
      last = error
    }
    await delay(300)
  }
  throw Error(`Timed out: ${description}${last ? ` (${last.message})` : ''}`)
}

export class UnavailableNativeFiles extends Error {
  constructor(files) {
    super(
      'Native Files delivered unavailable zero-byte files: ' + files.join(', ')
    )
    this.name = 'UnavailableNativeFiles'
    this.files = files
  }
}
export class IncompleteNativeFiles extends Error {
  constructor(expected, received) {
    const missing = expected.filter((name) => !received.includes(name))
    super('Native Files omitted selected files: ' + missing.join(', '))
    this.name = 'IncompleteNativeFiles'
    this.expected = expected
    this.received = received
    this.missing = missing
    this.files = missing
  }
}

export class Driver {
  constructor(server, artifacts, origin) {
    this.server = server
    this.artifacts = artifacts
    this.origin = origin
  }
  async request(method, route, body, timeout = 180000) {
    const response = await fetch(`${this.server}${route}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeout)
    })
    const { value } = await response.json()
    if (!response.ok || value?.error)
      throw Error(`${method} ${route}: ${value?.error}: ${value?.message}`)
    return value
  }
  command(method, route, body) {
    return this.request(method, `/session/${this.id}${route}`, body)
  }
  mobile(script, args = {}) {
    return this.command('POST', '/execute/sync', { script, args: [args] })
  }
  async start(udid, derivedData, port, streamPort) {
    const result = await this.request(
      'POST',
      '/session',
      {
        capabilities: {
          alwaysMatch: {
            platformName: 'iOS',
            'appium:automationName': 'XCUITest',
            'appium:udid': udid,
            'appium:bundleId': 'com.apple.mobilesafari',
            'appium:noReset': true,
            'appium:newCommandTimeout': 300,
            'appium:wdaLaunchTimeout': 180000,
            'appium:showXcodeLog': true,
            'appium:includeSafariInWebviews': true,
            'appium:additionalWebviewBundleIds': ['*'],
            'appium:derivedDataPath': derivedData,
            'appium:wdaLocalPort': port,
            'appium:wdaRemotePort': port,
            'appium:mjpegServerPort': streamPort
          }
        }
      },
      300000
    )
    this.id = result.sessionId
    await this.command('POST', '/timeouts', { script: 90000, implicit: 0 })
  }
  async stop() {
    if (this.id)
      await this.request('DELETE', `/session/${this.id}`).finally(() => {
        this.id = undefined
      })
  }
  async native() {
    await this.command('POST', '/context', { name: 'NATIVE_APP' })
  }
  source() {
    return this.command('GET', '/source')
  }
  async exists(predicate) {
    const elements = await this.command('POST', '/elements', {
      using: '-ios predicate string',
      value: `(${predicate}) AND visible == true`
    })
    return elements.length > 0
  }
  async wait(predicate) {
    await poll(predicate, () => this.exists(predicate))
  }
  async click(predicate) {
    // Resolve and capture the same element in one lookup. A separate exists
    // check followed by find races native sheet transitions.
    const element = await poll(predicate, async () => {
      const elements = await this.command('POST', '/elements', {
        using: '-ios predicate string',
        value: `(${predicate}) AND visible == true`
      })
      return elements[0]
    })
    await this.command(
      'POST',
      `/element/${element['element-6066-11e4-a52e-4f735466cecf']}/click`,
      {}
    )
  }
  button(label) {
    return this.click(
      `type == "XCUIElementTypeButton" AND (name == ${JSON.stringify(
        label
      )} OR label == ${JSON.stringify(label)}) AND enabled == true`
    )
  }
  cell(label) {
    return this.click(
      `type == "XCUIElementTypeCell" AND label == ${JSON.stringify(label)}`
    )
  }
  async webContext() {
    this.context = await poll(
      'ArtBot webview with the correct installation mode',
      async () => {
        const contexts = await this.mobile('mobile: getContexts', {
          waitForWebviewMs: 1000
        })
        for (const context of contexts.filter((entry) =>
          entry.url?.startsWith(`${this.origin}/`)
        )) {
          try {
            await this.command('POST', '/context', { name: context.id })
            const standalone = await this.command('POST', '/execute/sync', {
              script: 'return navigator.standalone === true',
              args: []
            })
            if (standalone === (this.standalone === true)) {
              this.webview = { ...context, standalone }
              return context.id
            }
          } finally {
            await this.native()
          }
        }
        return undefined
      }
    )
  }
  async web(script, args = [], asynchronous = false) {
    if (!this.context) await this.webContext()
    await this.command('POST', '/context', { name: this.context })
    try {
      return await this.command(
        'POST',
        `/execute/${asynchronous ? 'async' : 'sync'}`,
        { script, args }
      )
    } finally {
      await this.native()
    }
  }
  async audit(fn) {
    // Web Inspector can lose an executeAsync callback across a navigation.
    // Keep the read-only audit in the page and poll its small result instead.
    const key = `__artbotNativeAudit_${crypto.randomUUID()}`
    if (!this.context) await this.webContext()
    // Keep the inspector attached for the entire asynchronous IDB read. Native
    // UI operations resume after the audit, rather than between every poll.
    await this.command('POST', '/context', { name: this.context })
    const execute = (script, args) =>
      this.command('POST', '/execute/sync', { script, args })
    const start = () =>
      execute(
        `const state={phase:'Starting',timerFired:false};window[arguments[0]]=state;setTimeout(()=>{state.timerFired=true},0);state.promise=(${fn.toString()})(phase=>{state.phase=phase}).then(result=>{state.result=result}).catch(error=>{state.error=error.message});return true`,
        [key]
      )
    try {
      await start()
      const state = await poll('native database audit', async () => {
        const value = await execute(
          'const s=window[arguments[0]];return s ? {phase:s.phase,timerFired:s.timerFired,visible:document.visibilityState,result:s.result,error:s.error} : null',
          [key]
        )
        // A document replacement may discard observation, but never restarts
        // preparation or restore. Only these independent reads are repeated.
        if (!value) {
          await start()
          return false
        }
        this.auditPhase = `${value.phase}; visible=${value.visible}; timer=${value.timerFired}`
        return value.error || value.result ? value : false
      })
      if (state.error) throw Error(state.error)
      return state.result
    } catch (error) {
      throw Error(
        `${error.message}; last audit phase: ${this.auditPhase || 'Starting'}`
      )
    } finally {
      await execute('delete window[arguments[0]];return true', [key]).catch(
        () => {}
      )
      await this.native()
    }
  }
  async waitWeb(description, script, args = []) {
    if (!this.context) await this.webContext()
    await this.command('POST', '/context', { name: this.context })
    try {
      return await poll(description, () =>
        this.command('POST', '/execute/sync', { script, args })
      )
    } finally {
      await this.native()
    }
  }
  async scrollButton(label) {
    await poll('visible button after layout settles: ' + label, async () => {
      await this.web(
        `const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===arguments[0]);if(!button)throw Error('Missing '+arguments[0]);button.scrollIntoView({block:'center'});return true`,
        [label]
      )
      return this.exists(
        `type == "XCUIElementTypeButton" AND name == ${JSON.stringify(label)}`
      )
    })
  }
  async snapshot(name) {
    await mkdir(this.artifacts, { recursive: true })
    await writeFile(
      path.join(this.artifacts, `${name}.xml`),
      await this.source()
    )
    await writeFile(
      path.join(this.artifacts, `${name}.png`),
      Buffer.from(await this.command('GET', '/screenshot'), 'base64')
    )
  }
  async installPWA() {
    await this.mobile('mobile: deepLink', {
      url: `${this.origin}/artbot?backup_lab=1`,
      bundleId: 'com.apple.mobilesafari'
    })
    await this.webContext()
    await this.waitWeb(
      'ArtBot loaded',
      'return window._artbotDb?.isOpen() === true'
    )
    await poll('Safari share action after first-use tip', async () => {
      if (await this.exists('name == "ShareButton"')) return true
      if (
        await this.exists(
          'type == "XCUIElementTypeButton" AND name == "xmark.circle.fill" AND label == "Close"'
        )
      )
        await this.click(
          'type == "XCUIElementTypeButton" AND name == "xmark.circle.fill" AND label == "Close"'
        )
      else if (await this.exists('name == "MoreMenuButton"'))
        await this.button('MoreMenuButton')
      return false
    })
    await this.button('ShareButton')
    await this.wait(
      'type == "XCUIElementTypeCell" AND (label == "View More" OR label == "Add to Home Screen")'
    )
    if (
      await this.exists(
        'type == "XCUIElementTypeCell" AND label == "View More"'
      )
    )
      await this.cell('View More')
    // The share action and installation form can overlap in accessibility
    // snapshots during their transition. Act only on a settled form; if iOS
    // returns to the share sheet, open the form again before adding the icon.
    const homeAction =
      'type == "XCUIElementTypeCell" AND label == "Add to Home Screen"'
    let settled = 0
    await poll('Home Screen installation form', async () => {
      if (await this.exists(homeAction)) {
        settled = 0
        await this.click(homeAction)
        return false
      }
      if (
        await this.exists('type == "XCUIElementTypeButton" AND name == "Add"')
      )
        return ++settled >= 2
      settled = 0
      return false
    })
    await this.button('Add')
    await this.mobile('mobile: pressButton', { name: 'home' })
    await this.launchIcon()
    this.standalone = true
    this.context = undefined
    await this.webContext()
    await this.waitWeb(
      'standalone app and database',
      'return navigator.standalone === true && isSecureContext && window._artbotDb?.isOpen() === true'
    )
  }
  async launchIcon() {
    const icon =
      'type == "XCUIElementTypeIcon" AND (name == "ArtBot" OR name == "ArtBot Test")'
    // After a reboot WDA can keep Safari as its active application even after
    // pressing Home. Scope icon queries and page swipes to SpringBoard itself.
    await this.command('POST', '/appium/settings', {
      settings: { defaultActiveApplication: 'com.apple.springboard' }
    })
    try {
      await this.wait('type == "XCUIElementTypeIcon"')
      for (let page = 0; page < 4; page++) {
        if (await this.exists(icon)) {
          await this.click(icon)
          return
        }
        await this.mobile('mobile: swipe', { direction: 'left' })
      }
      throw Error('ArtBot Home Screen icon was not found')
    } finally {
      await this.command('POST', '/appium/settings', {
        settings: { defaultActiveApplication: 'com.apple.webapp' }
      })
    }
  }
  async reopen() {
    await this.mobile('mobile: terminateApp', { bundleId: 'com.apple.webapp' })
    await this.mobile('mobile: pressButton', { name: 'home' })
    await this.launchIcon()
    this.standalone = true
    this.context = undefined
    await this.webContext()
    await this.waitWeb(
      'reopened database',
      'return navigator.standalone === true && window._artbotDb?.isOpen() === true'
    )
  }
  async settings() {
    const previousDocument = `__artbotSettingsNavigation_${crypto.randomUUID()}`
    await this.web(
      'window[arguments[0]]=true;location.href="/artbot/settings?panel=import-export";return true',
      [previousDocument]
    )
    await this.waitWeb(
      'new backup Settings document and file controls',
      'return !window[arguments[0]] && document.readyState === "complete" && location.pathname === "/artbot/settings" && new URLSearchParams(location.search).get("panel") === "import-export" && window._artbotDb?.isOpen() === true && ["Verify saved backup","Choose backup files"].every(label=>document.querySelector(`input[aria-label="${label}"]`)?.disabled === false)',
      [previousDocument]
    )
  }
  async openFiles(input, folder, names) {
    const reselection =
      input === 'Choose backup files' &&
      (await this.web(
        'return [...document.querySelectorAll("button")].some(button=>button.textContent.trim()==="Choose backup files again")'
      ))
    if (reselection) {
      await this.scrollButton('Choose backup files again')
      await this.button('Choose backup files again')
    } else {
      await this.web(
        'document.querySelector(`input[aria-label="${arguments[0]}"]`).scrollIntoView({block:"center"});return true',
        [input]
      )
      await this.button(input)
    }
    await this.button('Choose Files')
    const inside = `name == ${JSON.stringify(`${folder}, Actions Menu`)}`
    const location = 'name == "DOC.sidebar.item.On My iPhone"'
    const directory = `name == ${JSON.stringify(`${folder}, Folder`)}`
    await poll('Files provider or requested folder', async () => {
      if ((await this.exists(inside)) || (await this.exists(directory)))
        return true
      if (await this.exists(location)) {
        await this.click(location)
        return false
      }
      if (
        await this.exists(
          'type == "XCUIElementTypeStaticText" AND name == "Recents"'
        )
      )
        await this.button('Browse')
      else if (
        await this.exists(
          'type == "XCUIElementTypeButton" AND name == "BackButton"'
        )
      )
        await this.button('BackButton')
      return false
    })
    if (!(await this.exists(inside))) await this.click(directory)
    const previouslySelected = await this.command('POST', '/elements', {
      using: '-ios predicate string',
      value:
        'type == "XCUIElementTypeCell" AND selected == true AND visible == true'
    })
    for (const cell of previouslySelected) {
      const id = cell['element-6066-11e4-a52e-4f735466cecf']
      const name = await this.command(
        'GET',
        '/element/' + id + '/attribute/name'
      )
      if (
        /\.(json|artbot-part),/.test(name) &&
        !names.some((file) => name.startsWith(file + ','))
      )
        await this.command('POST', '/element/' + id + '/click', {})
    }
    for (const name of names) {
      const predicate = `type == "XCUIElementTypeCell" AND enabled == true AND name BEGINSWITH ${JSON.stringify(
        `${name},`
      )}`
      const cells = await this.command('POST', '/elements', {
        using: '-ios predicate string',
        value: predicate
      })
      if (!cells.length) await this.wait(predicate)
      const selected = cells[0]
        ? await this.command(
            'GET',
            '/element/' +
              cells[0]['element-6066-11e4-a52e-4f735466cecf'] +
              '/attribute/selected'
          ).catch(() => null)
        : null
      // File providers can retain a selection when a picker is reopened.
      // Never toggle an already selected requested file off.
      if (selected !== true && selected !== 'true') await this.click(predicate)
    }
    await this.snapshot('picker-selection-' + Date.now())
    await this.button('Open')
    await poll(
      'Files picker dismissed',
      async () => !(await this.exists(inside))
    )
    try {
      await this.waitWeb(
        'native FileList matches the requested files',
        "return JSON.stringify([...document.querySelector('input[aria-label=\"'+arguments[0]+'\"]').files].map(file=>file.name).sort())===JSON.stringify(arguments[1])",
        [input, [...names].sort()]
      )
    } catch (error) {
      // A provider can omit a checked document entirely. Keep waiting above
      // for asynchronous delivery; classify only a nonempty strict subset.
      // Wrong/duplicate names and empty selections remain hard failures.
      const delivered = await this.web(
        "return [...document.querySelector('input[aria-label=\"'+arguments[0]+'\"]').files].map(file=>({name:file.name,size:file.size}))",
        [input]
      )
      const received = delivered.map((file) => file.name)
      if (
        received.length > 0 &&
        received.length < names.length &&
        new Set(received).size === received.length &&
        received.every((name) => names.includes(name))
      ) {
        const unavailable = delivered
          .filter((file) => file.size === 0)
          .map((file) => file.name)
        if (unavailable.length) throw new UnavailableNativeFiles(unavailable)
        throw new IncompleteNativeFiles(names, received)
      }
      throw error
    }
    // Every native fixture is nonempty. Fail at the file-delivery boundary if
    // the provider supplies an unavailable file, rather than timing out later
    // waiting for a restore button that preview correctly keeps disabled.
    const unavailable = await this.web(
      "return [...document.querySelector('input[aria-label=\"'+arguments[0]+'\"]').files].filter(file=>file.size===0).map(file=>file.name)",
      [input]
    )
    if (unavailable.length) throw new UnavailableNativeFiles(unavailable)
  }
  async cancelFiles(input) {
    await this.web(
      'document.querySelector(`input[aria-label="${arguments[0]}"]`).scrollIntoView({block:"center"});return true',
      [input]
    )
    await this.button(input)
    await this.button('Choose Files')
    await this.wait('name == "DOC.itemCollectionMenuButton.Icons"')
    await this.button('Cancel')
    await this.waitWeb(
      'cancelled picker returns without selecting files',
      'return document.visibilityState === "visible" && document.querySelector(`input[aria-label="${arguments[0]}"]`).files.length === 0',
      [input]
    )
  }
  async share(label, folder, saved) {
    const available = await this.web(
      'return [...document.querySelectorAll("button")].some(b=>b.textContent.trim()===arguments[0])',
      [label]
    )
    if (!available) {
      let select = label.replace('Share/save ', 'Select ')
      const next = label.replace('Share/save ', 'Load next file: ')
      if (
        await this.web(
          'return [...document.querySelectorAll("button")].some(b=>b.textContent.trim()===arguments[0])',
          [next]
        )
      )
        select = next
      else
        await this.web(
          'const b=[...document.querySelectorAll("button")].find(b=>b.textContent.trim()===arguments[0]);const details=b?.closest("details");if(details)details.open=true;return true',
          [select]
        )
      await this.scrollButton(select)
      await this.button(select)
      await this.waitWeb(
        'selected backup file is ready for native sharing',
        'return [...document.querySelectorAll("button")].some(b=>b.textContent.trim()===arguments[0] && !b.disabled)',
        [label]
      )
    }
    await this.scrollButton(label)
    await this.button(label)
    const saveAction =
      'type == "XCUIElementTypeCell" AND label == "Save to Files"'
    // AX elements appear before share-sheet animations finish. Retry only while
    // that same sheet is visible, stopping as soon as the destination appears.
    await poll('native Save to Files destination', async () => {
      if (
        await this.exists('type == "XCUIElementTypeButton" AND name == "Save"')
      )
        return true
      if (await this.exists(saveAction)) await this.click(saveAction)
      return false
    })
    const inside = `name == ${JSON.stringify(`${folder}, Actions Menu`)}`
    await poll('backup destination folder', async () => {
      if (await this.exists(inside)) return true
      const directory = `name == ${JSON.stringify(`${folder}, Folder`)}`
      if (await this.exists(directory)) await this.click(directory)
      else if (await this.exists('name == "DOC.sidebar.item.On My iPhone"'))
        await this.click('name == "DOC.sidebar.item.On My iPhone"')
      else if (
        await this.exists(
          'type == "XCUIElementTypeButton" AND name == "BackButton"'
        )
      )
        await this.button('BackButton')
      return false
    })
    await this.button('Save')
    await poll('actual file saved outside browser storage', saved)
    await this.waitWeb(
      'native share returned',
      'return document.body.innerText.includes("Share sheet closed.")'
    )
  }
}
