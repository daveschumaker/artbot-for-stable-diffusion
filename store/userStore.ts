import { makeStore } from 'statery'

interface UserStore {
  username: string
  kudos: number
  loggedIn: boolean
  trusted: boolean
}

interface UserInfo {
  username: string
  kudos: number
  trusted: boolean
}

export const userInfoStore = makeStore<UserStore>({
  username: '',
  kudos: 0,
  trusted: false,
  loggedIn: false
})

export const unsetUserInfo = () => {
  userInfoStore.set(() => ({
    username: '',
    kudos: 0,
    trusted: false,
    loggedIn: false
  }))
}

export const setUserInfo = ({ username, kudos, trusted }: UserInfo) => {
  userInfoStore.set(() => ({
    username,
    kudos,
    trusted,
    loggedIn: username ? true : false
  }))
}
