// Handle navigating between filtered images on /images page
let filteredIds: Array<any> = []

export const findFilteredIndexById = (id: number) => {
  return filteredIds.map((e) => e.id).indexOf(id)
}

export const setFilteredItemsArray = (items: Array<number>) => {
  filteredIds = [...items].reverse()
}

export const getNextFilteredItem = (idx: number) => {
  if (filteredIds.length - 1 === idx) {
    return filteredIds[idx]
  }

  let clonedIdx = idx
  idx += 1
  return filteredIds[clonedIdx + 1]
}

export const getPrevFilteredItem = (idx: number) => {
  if (idx <= 0) {
    return filteredIds[0]
  }

  let clonedIdx = idx
  idx -= 1
  return filteredIds[clonedIdx - 1]
}
