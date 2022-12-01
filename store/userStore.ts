import { makeStore } from 'statery'

export interface IWorkers {
  [key: string]: IWorker
}

export interface IWorker {
  id: string
  name: string
  team: ITeam
  online: boolean
  uptime: number
  maintenance_mode: boolean
  requests_fulfilled: number
  models: Array<string>
}

export interface ITeam {
  name: string | null
  id: string | null
}

interface UserStore {
  username: string
  kudos: number
  loggedIn: boolean
  trusted: boolean
  worker_ids: Array<string> | null
  workers: IWorkers
}

interface UserInfo {
  username: string
  kudos: number
  trusted: boolean
  worker_ids: Array<string> | null
}

export const userInfoStore = makeStore<UserStore>({
  username: '',
  kudos: 0,
  worker_ids: null,
  trusted: false,
  loggedIn: false,
  workers: {}
})

export const unsetUserInfo = () => {
  userInfoStore.set(() => ({
    username: '',
    kudos: 0,
    worker_ids: null,
    trusted: false,
    loggedIn: false,
    workers: {}
  }))
}

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
  trusted,
  worker_ids = null
}: UserInfo) => {
  userInfoStore.set(() => ({
    username,
    kudos,
    trusted,
    worker_ids,
    loggedIn: username ? true : false
  }))
}
