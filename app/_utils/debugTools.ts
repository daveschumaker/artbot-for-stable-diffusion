import AppSettings from 'app/_data-models/AppSettings'

let logs: Array<any> = []

export const initWindowLogger = () => {
  if (typeof window === 'undefined') {
    return
  }

  // @ts-ignore
  window.artbotExportLogs = () => {
    console.log(`\n--`)
    console.log(`Exporting ArtBot Logs`)
    console.log(logs)
  }

  // @ts-ignore
  window.artbotDownloadLogs = () => {
    const str = JSON.stringify(logs, null, 2)
    const filename = AppSettings.get('artbot_uuid') + '.txt'
    var element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(str)
    )
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
  }
}

/**
 * logToConsole
 * Output logs to console for easier debugging in both prod and dev environments.
 * To enable, set either localStorage or window value for debugKey to true.
 * e.g., `localStorage.setItem('Input_Validation', true)` or `window['Input_Validation'] = true`
 * @param {Object} debugObject - The debugging payload that will be output to the console
 * @param {Object} debugObject.data - Data specifically related to the method that is being debugged
 * @param {string} debugObject.name - Name or type of method that is being debugged.
 * @param {string} debugObject.debugKey - Key used to enable console debugging using localStorage or window
 */
export const logToConsole = ({
  data,
  name,
  debugKey
}: {
  data: any
  name: string
  debugKey: string
}) => {
  if (typeof window === 'undefined') {
    return
  }

  if (
    localStorage.getItem(debugKey) === 'true' ||
    // @ts-ignore
    window[debugKey] === true ||
    // @ts-ignore
    window['DEBUG_ALL_LOGS'] ||
    localStorage.getItem('DEBUG_ALL_LOGS') === 'true'
  ) {
    console.log(`--`)
    console.log(`Output logs for: ${name} (${debugKey})`)
    console.log(data)
    console.log(``)
  }
}

export const getAllLogs = () => {
  return logs
}

export const logDataForDebugging = ({
  name,
  data
}: {
  name?: string
  data: any
}) => {
  const dataToLog = Object.assign({}, data)

  if (dataToLog.source_image) {
    dataToLog.source_image = '[true]'
  }

  if (dataToLog.source_mask) {
    dataToLog.source_mask = '[true]'
  }

  if (dataToLog.base64String) {
    dataToLog.base64String = '[true]'
  }

  if (dataToLog.thumbnail) {
    dataToLog.thumbnail = '[true]'
  }

  logs.push({ name, ...dataToLog })
  logs = logs.slice(-100)
}
