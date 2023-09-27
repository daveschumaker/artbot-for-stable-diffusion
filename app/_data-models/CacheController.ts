// In memory cache for remote API requests

class CacheController {
  private cache: { [key: string]: { value: any; timestamp: number } } = {}
  private filoArray: string[] = []
  private readonly limit: number = 30 // limit cache size
  private readonly expirationTime: number = 20 * 60 * 1000 // 20 minutes in milliseconds

  get(key: string): any {
    const cacheItem = this.cache[key]

    if (cacheItem) {
      const now = Date.now()
      // Check if the item is older than the expiration time
      // If it's expired, remove it from the cache and filoArray, and return null
      if (now - cacheItem.timestamp > this.expirationTime) {
        delete this.cache[key]
        this.filoArray = this.filoArray.filter((k) => k !== key)
        return null
      }

      // If not expired, move the accessed key to the most recent position in filoArray
      this.filoArray = this.filoArray.filter((k) => k !== key)
      this.filoArray.push(key)

      return cacheItem.value
    }

    // Return null if the key does not exist in the cache
    return null
  }

  set(key: string, value: any): void {
    this.cache[key] = { value, timestamp: Date.now() }
    this.filoArray.push(key)

    // If the cache size exceeds the limit, remove the oldest item from the cache
    if (this.filoArray.length > this.limit) {
      const oldestKey = this.filoArray.shift()
      delete this.cache[oldestKey!]
    }
  }
}

export default CacheController
