import { makeStore } from 'statery'

export interface IWorkers {
  [key: string]: IWorker
}

export interface IWorker {
  id: string
  name: string
  team: ITeam
  kudos_rewards: number
  online: boolean
  uptime: number
  max_pixels: number
  maintenance_mode: boolean
  requests_fulfilled: number
  models: Array<string>
  threads: number
  trusted: boolean
  performance: string
}

export interface ITeam {
  name: string | null
  id: string | null
}

interface UserStore {
  records: any
  username: string
  kudos: number
  kudos_details: IKudosDetails
  loggedIn: boolean | null
  sharedKey: boolean
  trusted: boolean
  worker_ids: Array<string> | null
  workers: IWorkers
  sharedkey_ids: Array<string>
}

interface IKudosDetails {
  accumulated: number
  awarded: number
  gifted: number
  received: number
  recurring: number
}

interface UserInfo {
  username: string
  kudos: number
  kudos_details: IKudosDetails
  records: any
  sharedKey: boolean
  trusted: boolean
  worker_ids: Array<string> | null
  sharedkey_ids: Array<string>
}

export const userInfoStore = makeStore<UserStore>({
  username: '',
  kudos: 0,
  records: {},
  kudos_details: {
    accumulated: 0,
    awarded: 0,
    gifted: 0,
    received: 0,
    recurring: 0
  },
  worker_ids: null,
  trusted: false,
  loggedIn: false,
  sharedKey: false,
  sharedkey_ids: [],
  workers: {}
})

export const setLoggedInState = (bool: boolean | null) => {
  userInfoStore.set(() => ({
    loggedIn: bool
  }))
}

export const unsetUserInfo = () => {
  userInfoStore.set(() => ({
    username: '',
    kudos: 0,
    worker_ids: null,
    trusted: false,
    loggedIn: false,
    sharedKey: false,
    workers: {}
  }))
}

// Due to caching issues, shared_keys might not be immediately available from the API.
// Use this to update and store keys in the cache
export const updateSharedKey = (id: string) => {}

export const setWorker = (worker: IWorker) => {
  const workers = { ...userInfoStore.state.workers }
  workers[worker.id] = worker

  userInfoStore.set(() => ({
    workers
  }))
}

export const setWorkers = (workers: IWorkers) => {
  userInfoStore.set(() => ({
    workers
  }))
}

export const setUserInfo = ({
  username,
  kudos,
  kudos_details,
  records,
  trusted,
  worker_ids = null,
  sharedKey = false,
  sharedkey_ids = []
}: UserInfo) => {
  userInfoStore.set(() => ({
    username,
    kudos,
    kudos_details,
    records,
    trusted,
    worker_ids,
    sharedKey,
    sharedkey_ids,
    loggedIn: username ? true : false
  }))
}
