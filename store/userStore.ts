import { makeStore } from 'statery'

interface UserStore {
  userName: string
  kudos: number
  loggedIn: false
  trusted: false
}

export const userInfoStore = makeStore<UserStore>({
  userName: '',
  kudos: 0,
  trusted: false,
  loggedIn: false
})
