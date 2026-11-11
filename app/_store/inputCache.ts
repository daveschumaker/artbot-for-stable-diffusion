/**
 * Store all details related to input cache so that we can quickly restore if a user
 * inadvertently moves from the page.
 */

let inputCache: any = null

export const getInputCache = () => {
  if (!inputCache) {
    return
  }

  return Object.assign({}, inputCache)
}
