import { nearestWholeMultiple } from 'utils/imageUtils'
import { OrientationLookup } from '../types'

class ImageOrientation {
  static orientationIds = () => {
    return [
      'landscape-16x9',
      'landscape',
      'phone-bg',
      'portrait',
      'square',
      'ultrawide'
    ]
  }

  static orientationDetails = () => {
    const data: OrientationLookup = {
      'landscape-16x9': {
        label: 'Landscape (16 x 9)',
        orientation: 'landscape-16x9',
        height: 576,
        width: 1024
      },
      landscape: {
        label: 'Landscape (3 x 2)',
        orientation: 'landscape',
        height: 512,
        width: 768
      },
      portrait: {
        label: 'Portrait (2 x 3)',
        orientation: 'portrait',
        height: 768,
        width: 512
      },
      'phone-bg': {
        label: 'Phone background (9 x 21)',
        orientation: 'phone-bg',
        height: 1024,
        width: 448
      },
      ultrawide: {
        label: 'Ultrawide (21 x 9)',
        orientation: 'ultrawide',
        height: 448,
        width: 1024
      },
      square: {
        label: 'Square',
        orientation: 'square',
        height: 512,
        width: 512
      }
    }

    return data
  }

  static getOrientationDetails = (
    orientation: string,
    height: number = 512,
    width: number = 512
  ) => {
    if (orientation === 'custom') {
      return {
        orientation: 'custom',
        height: nearestWholeMultiple(height),
        width: nearestWholeMultiple(width)
      }
    }

    if (orientation === 'random') {
      const orientationIds = ImageOrientation.orientationIds()
      const value =
        orientationIds[Math.floor(Math.random() * orientationIds.length)]

      return {
        ...ImageOrientation.orientationDetails()[value]
      }
    } else if (ImageOrientation.orientationDetails()[orientation]) {
      return {
        ...ImageOrientation.orientationDetails()[orientation]
      }
    }

    return {
      orientation: 'square',
      height: 512,
      width: 512
    }
  }

  static dropdownOptions = () => {
    const options: Array<{ value: string; label: string }> = []

    for (const key in ImageOrientation.orientationDetails()) {
      options.push({
        value: key,
        label: ImageOrientation.orientationDetails()[key].label
      })
    }

    options.push({ value: 'custom', label: 'Custom' })
    options.push({ value: 'random', label: 'Random!' })

    return options
  }
}

export { ImageOrientation }
