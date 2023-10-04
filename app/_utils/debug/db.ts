/**
 * ONLY USED IN LOCAL DEV ENVIRONMENTS
 *
 * This bootstraps a simple SQLite database so that I can reliably clone my IndexedDb database for
 * export / import in order to test new migration strategies and schema.
 */

// @ts-ignore
import Database from 'better-sqlite3'
import appRoot from 'app-root-path'

class ImageDatabase {
  db: any
  constructor() {
    this.db = new Database(appRoot + '/__local_db/images.sqlite')
    this.createTable()
  }

  createTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                jsonString TEXT NOT NULL
            )
        `

    try {
      this.db.exec(sql)
    } catch (err: any) {
      console.error('Error creating table:', err.message)
    }
  }

  insert(jsonString: string) {
    const sql = `INSERT INTO images (jsonString) VALUES (?)`

    try {
      const stmt = this.db.prepare(sql)
      const info = stmt.run(jsonString)
      console.log(`A row has been inserted with rowid ${info.lastInsertRowid}`)
      return info.lastInsertRowid
    } catch (err: any) {
      console.error('Error inserting record:', err.message)
    }
  }

  get(currentId: number = 0) {
    const sql = `
        SELECT * FROM images
        WHERE id > ?
        ORDER BY id ASC
        LIMIT 2
    `
    const stmt = this.db.prepare(sql)
    const records = stmt.all(currentId)

    if (records.length === 0) {
      return { done: true } // No record found after the currentId
    } else if (records.length === 1) {
      return {
        current: records[0],
        next: null, // No next record after the current one
        done: true
      }
    } else {
      return {
        current: records[0],
        next: records[1].id, // Next record after the current one
        done: false
      }
    }
  }

  close() {
    try {
      this.db.close()
      console.log('Close the database connection.')
    } catch (err: any) {
      console.error('Error closing the connection:', err.message)
    }
  }
}

const db = new ImageDatabase()
export default db
