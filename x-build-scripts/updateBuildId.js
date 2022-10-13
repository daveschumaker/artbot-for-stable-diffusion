const fs = require('fs')
const buildFile = './build_info.json'

try {
  if (fs.existsSync(buildFile)) {
    const date = new Date()
    const buildArr = [
      date.getFullYear(),
      date.getMonth(),
      '_',
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ]

    const buildInfo = {
      build: buildArr.join('')
    }

    const data = JSON.stringify(buildInfo)

    fs.writeFileSync(buildFile, data)
  }
} catch (err) {
  console.error(err)
}
