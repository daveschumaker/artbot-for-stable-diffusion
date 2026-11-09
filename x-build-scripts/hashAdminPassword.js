/**
 * Prints a value for ADMIN_PW_HASH. Reads the password from stdin so it doesn't
 * end up in shell history. Usage: node x-build-scripts/hashAdminPassword.js
 *
 * The format uses ":" because Next expands "$" in .env files.
 */
const crypto = require('crypto')

let password = ''

if (process.stdin.isTTY) {
  process.stderr.write('Admin password: ')
}

process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => {
  password += chunk
})
process.stdin.on('end', () => {
  password = password.replace(/\r?\n$/, '')

  if (!password) {
    process.stderr.write('No password provided.\n')
    process.exit(1)
  }

  const salt = crypto.randomBytes(16).toString('hex')
  const key = crypto.scryptSync(password, salt, 64).toString('hex')

  process.stdout.write(`scrypt:${salt}:${key}\n`)
})
