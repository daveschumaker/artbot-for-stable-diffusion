import { useStore } from 'statery'
import { userInfoStore } from 'app/_store/userStore'
import {
  MAX_DIMENSIONS_LOGGED_IN,
  MAX_DIMENSIONS_LOGGED_OUT,
  MIN_IMAGE_WIDTH
} from '_constants'

export const useImageConstraints = () => {
  const { loggedIn } = useStore(userInfoStore)

  return {
    imageMinSize: MIN_IMAGE_WIDTH,
    imageMaxSize: loggedIn
      ? MAX_DIMENSIONS_LOGGED_IN
      : MAX_DIMENSIONS_LOGGED_OUT
  }
}
