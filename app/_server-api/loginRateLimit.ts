const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES_PER_CLIENT = 5

// Client addresses can be spoofed through X-Forwarded-For, so a cap across all
// clients still limits guessing from someone rotating that header.
const MAX_FAILURES_OVERALL = 50

interface FailureWindow {
  count: number
  expires: number
}

const OVERALL = '*'
const failures = new Map<string, FailureWindow>()

const activeCount = (key: string) => {
  const entry = failures.get(key)

  if (!entry) {
    return 0
  }

  if (entry.expires <= Date.now()) {
    failures.delete(key)
    return 0
  }

  return entry.count
}

const increment = (key: string) => {
  const count = activeCount(key)

  failures.set(key, {
    count: count + 1,
    expires: count === 0 ? Date.now() + WINDOW_MS : failures.get(key)!.expires
  })
}

const removeExpired = () => {
  Array.from(failures.keys()).forEach(activeCount)
}

export const isLoginBlocked = (client: string) =>
  activeCount(client) >= MAX_FAILURES_PER_CLIENT ||
  activeCount(OVERALL) >= MAX_FAILURES_OVERALL

export const recordLoginFailure = (client: string) => {
  removeExpired()
  increment(client)
  increment(OVERALL)
}

export const clearLoginFailures = (client: string) => {
  failures.delete(client)
}

export const resetLoginRateLimit = () => {
  failures.clear()
}
