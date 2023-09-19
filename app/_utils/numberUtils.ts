const plural = (diff: number, bucket: number) => {
  if (Math.floor(diff / bucket) === 1) {
    return ''
  } else {
    return 's'
  }
}

export const kilobytesToGigabytes = (kilobytes: number) => {
  const bytesInGigabyte = 1024 * 1024
  const gigabytes = kilobytes / bytesInGigabyte
  return gigabytes
}

export const nearestWholeMultiple = (input: number, X = 64) => {
  let output = Math.round(input / X)
  if (output === 0 && input > 0) {
    output += 1
  }

  output *= X

  return output
}

export const relativeTimeSec = ({
  now,
  compare
}: {
  now: number
  compare: number
}) => {
  if (!now) {
    now = Date.now() / 1000
  }

  const seconds = now / 1000
  const oldTimestamp = compare / 1000

  const difference = seconds - oldTimestamp
  let output = ``

  if (difference < 60) {
    output = `${difference} second${plural} ago`
  } else if (difference < 3600) {
    output = `${Math.floor(difference / 60)} minute${plural(
      difference,
      60
    )} ago`
  } else if (difference < 86400) {
    output = `${Math.floor(difference / 3600)} hour${plural(
      difference,
      3600
    )} ago`
  } else if (difference < 2620800) {
    output = `${Math.floor(difference / 86400)} day${plural(
      difference,
      86400
    )} ago`
  } else if (difference < 31449600) {
    output = `${Math.floor(difference / 2620800)} month${plural(
      difference,
      2620800
    )} ago`
  } else {
    output = `${Math.floor(difference / 31449600)} year${plural(
      difference,
      31449600
    )} ago`
  }

  return output
}
