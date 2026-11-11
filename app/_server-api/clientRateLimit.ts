interface Window {
  count: number
  expires: number
}

/** Bounded, process-local fixed windows. Entries retain expiry order. */
export class ClientRateLimit {
  private windows = new Map<string, Window>()
  constructor(
    private limit: number,
    private windowMs: number,
    private maxClients = 10000
  ) {}
  private current(client: string) {
    for (const [key, value] of this.windows) {
      if (value.expires > Date.now()) break
      this.windows.delete(key)
    }
    return this.windows.get(client)
  }
  blocked(client: string) {
    return (this.current(client)?.count || 0) >= this.limit
  }
  consume(client: string) {
    const current = this.current(client)
    if (current && current.count >= this.limit) return false
    if (!current && this.windows.size >= this.maxClients)
      this.windows.delete(this.windows.keys().next().value!)
    this.windows.set(client, {
      count: (current?.count || 0) + 1,
      expires: current?.expires || Date.now() + this.windowMs
    })
    return true
  }
  clear(client: string) {
    this.windows.delete(client)
  }
  reset() {
    this.windows.clear()
  }
}
