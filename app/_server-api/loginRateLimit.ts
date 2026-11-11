import { ClientRateLimit } from './clientRateLimit'

const failures = new ClientRateLimit(5, 15 * 60 * 1000)
export const isLoginBlocked = (client: string) => failures.blocked(client)
export const recordLoginFailure = (client: string) => {
  failures.consume(client)
}
export const clearLoginFailures = (client: string) => failures.clear(client)
export const resetLoginRateLimit = () => failures.reset()
