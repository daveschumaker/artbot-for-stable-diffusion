require('dotenv').config()
import appRoot from 'app-root-path'
import { promises as fs } from 'fs'
import * as crypto from 'crypto'
import os from 'os'
import path from 'path'
import jwt, { VerifyErrors } from 'jsonwebtoken'

const SECRET_KEY = process.env.SECRET

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

export const hashPassword = (password: string, salt: string) => {
  const hash = crypto.createHash('sha256')
  hash.update(password + salt)
  return hash.digest('hex')
}

export const adminLogin = ({
  username,
  password
}: {
  username: string
  password: string
}) => {
  if (process.env.ADMIN_USER !== username) {
    return {
      success: false
    }
  }

  if (
    hashPassword(password, process.env.SALT as string) ===
    process.env.ADMIN_PW_HASH
  ) {
    // @ts-ignore
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

interface User {
  username: string
}

export const validateToken = (token: string) => {
  return new Promise((resolve) => {
    if (!token) return resolve(false)

    jwt.verify(
      token,
      // @ts-ignore
      SECRET_KEY,
      // @ts-ignore
      (err: VerifyErrors | null, user: User | undefined) => {
        if (err) return resolve(false)

        if (user?.username === process.env.ADMIN_USER) {
          return resolve(true)
        }

        return resolve(false)
      }
    )
  })
}
