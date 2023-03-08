let logs: Array<any> = []

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

  // @ts-ignore
  if (window[debugKey] === true) {
    console.log(`\n--`)
    console.log(`Output logs for: ${name} (${debugKey})`)
    console.log(data)
  }
}

export const getAllLogs = () => {
  return logs
}

export const logObject = (data: object) => {
  logs.push(data)
  logs = logs.slice(-20)
}
