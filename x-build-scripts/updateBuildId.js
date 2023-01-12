const fs = require('fs')
const buildFile = './build_info.json'

const zeroPad = (n, digits) => n.toString().padStart(digits, '0')

const date = new Date()
const buildArr = [
  date.getFullYear(),
  zeroPad(date.getMonth() + 1, 2),
  zeroPad(date.getDate(), 2),
  zeroPad(date.getHours(), 2),
  zeroPad(date.getMinutes(), 2)
]

const buildInfo = {
  build: buildArr.join('')
}

const data = JSON.stringify(buildInfo)

fs.writeFileSync(buildFile, data)
