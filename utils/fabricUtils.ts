import { nearestWholeMultiple } from './imageUtils'

interface GetCanvasHeight {
  baseHeight?: number
  baseWidth?: number
  foundWidth: number
}

export const getCanvasHeight = ({
  baseHeight = 512,
  baseWidth = 768,
  foundWidth
}: GetCanvasHeight) => {
  if (!baseWidth) {
    return 512
  }

  return Math.floor((baseHeight * foundWidth) / baseWidth)
}

interface GetCanvasWidth {
  baseHeight?: number
  baseWidth?: number
  foundHeight: number
}

export const getMaxValidCanvasWidth = () => {
  let container = document.querySelector('#canvas-wrapper')
  // @ts-ignore
  let containerWidth = container?.offsetWidth || 512
  containerWidth =
    nearestWholeMultiple(containerWidth) > containerWidth
      ? nearestWholeMultiple(containerWidth) - 64
      : nearestWholeMultiple(containerWidth)

  return containerWidth
}

export const getCanvasWidth = ({
  baseHeight = 768,
  baseWidth = 512,
  foundHeight
}: GetCanvasWidth) => {
  if (!foundHeight) {
    return 512
  }

  return Math.floor((baseWidth * foundHeight) / baseHeight)
}

export const getPanelWidth = (windowWidth: number) => {
  const padding = 32
  let containerWidth = 1024 - padding

  if (windowWidth < 1280) {
    containerWidth = 768 - padding
  }

  if (windowWidth < 1024) {
    containerWidth = 768 - 48
  }

  if (windowWidth < 768) {
    containerWidth = windowWidth - 64
  }

  if (windowWidth < 640) {
    containerWidth = windowWidth - 58
  }

  return containerWidth
}
