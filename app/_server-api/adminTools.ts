require('dotenv').config()
import appRoot from 'app-root-path'
import { promises as fs } from 'fs'
import * as crypto from 'crypto'
import os from 'os'
import path from 'path'
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'

// May be undefined when SECRET is not configured. It is passed to jsonwebtoken
// as-is: jwt.sign then throws and jwt.verify reports an error, so admin auth
// fails closed. The cast below only satisfies the typings.
const SECRET_KEY = process.env.SECRET as jwt.Secret

export const readServerSettingsFile = async () => {
  const isProd = process.env.NODE_ENV === 'production'
  const homeDirectory = isProd ? os.homedir() : appRoot + '/__local_db'
  const filePath = path.join(homeDirectory, '.artbot_server_settings')

  try {
    const data = await fs.readFile(filePath, 'utf8')

    if (!data) return {}

    return JSON.parse(data)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('File does not exist, creating...')
      try {
        await fs.writeFile(filePath, '', 'utf8')
        console.log('File created successfully with default content.')
        return {}
      } catch (writeError) {
        console.error('Error creating file:', writeError)
        return {}
      }
    }

    console.error('Error reading file:', error)
    return {}
  }
}

export const updateServerSettingsFile = async (data: any) => {
  try {
    const isProd = process.env.NODE_ENV === 'production'
    const homeDirectory = isProd ? os.homedir() : appRoot + '/__local_db'
    const filePath = path.join(homeDirectory, '.artbot_server_settings')

    await fs.writeFile(filePath, JSON.stringify(data), 'utf8')
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

const safeEqual = (a: string, b: string) => {
  const hashedA = crypto.createHash('sha256').update(a).digest()
  const hashedB = crypto.createHash('sha256').update(b).digest()

  return crypto.timingSafeEqual(hashedA, hashedB)
}

// New hashes come from x-build-scripts/hashAdminPassword.js. Older deployments
// use a salted SHA-256 hash until ADMIN_PW_HASH is replaced.
const verifyPassword = (password: string, storedHash: string) => {
  if (storedHash.startsWith('scrypt:')) {
    const [, salt, key] = storedHash.split(':')

    if (!salt || !key) {
      return false
    }

    return safeEqual(crypto.scryptSync(password, salt, 64).toString('hex'), key)
  }

  const legacyHash = crypto
    .createHash('sha256')
    .update(password + process.env.SALT)
    .digest('hex')

  return safeEqual(legacyHash, storedHash)
}

export const adminLogin = ({
  username,
  password
}: {
  username: unknown
  password: unknown
}) => {
  const { ADMIN_USER, ADMIN_PW_HASH } = process.env

  if (
    !ADMIN_USER ||
    !ADMIN_PW_HASH ||
    typeof username !== 'string' ||
    typeof password !== 'string'
  ) {
    return {
      success: false
    }
  }

  // Both checks always run, so timing doesn't reveal which one failed.
  const validUser = safeEqual(username, ADMIN_USER)
  const validPassword = verifyPassword(password, ADMIN_PW_HASH)

  if (validUser && validPassword) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '6h' })

    return {
      success: true,
      token
    }
  }

  return {
    success: false
  }
}

export const validateToken = (token: string) => {
  return new Promise((resolve) => {
    if (!token) return resolve(false)

    jwt.verify(
      token,
      SECRET_KEY,
      (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err) return resolve(false)

        // A string payload carries no username claim.
        const username: unknown =
          typeof decoded === 'object' ? decoded.username : undefined

        if (username === process.env.ADMIN_USER) {
          return resolve(true)
        }

        return resolve(false)
      }
    )
  })
}
