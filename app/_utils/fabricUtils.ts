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

export const getMaxValidCanvasWidth = () => {
  let container = document.querySelector<HTMLElement>('#canvas-wrapper')
  let containerWidth = container?.offsetWidth || 512
  containerWidth =
    nearestWholeMultiple(containerWidth) > containerWidth
      ? nearestWholeMultiple(containerWidth) - 64
      : nearestWholeMultiple(containerWidth)

  return containerWidth
}
