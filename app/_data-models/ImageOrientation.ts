import { OrientationLookup } from '_types/artbot'
import { nearestWholeMultiple } from 'app/_utils/numberUtils'

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

  static orientationDetails = ({ baseline }: { baseline?: string } = {}) => {
    if (baseline === 'stable_diffusion_xl') {
      return {
        'landscape-16x9': {
          label: 'Landscape (16 x 9)',
          orientation: 'landscape-16x9',
          height: 576,
          width: 1024
        },
        landscape: {
          label: 'Landscape (3 x 2)',
          orientation: 'landscape',
          height: 704,
          width: 1024
        },
        portrait: {
          label: 'Portrait (2 x 3)',
          orientation: 'portrait',
          height: 1024,
          width: 704
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
          height: 1024,
          width: 1024
        }
      }
    }
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

  static getOrientationDetails = ({
    baseline,
    orientation,
    height = 512,
    width = 512
  }: {
    baseline?: string
    orientation: string
    height: number
    width: number
  }) => {
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
        ...ImageOrientation.orientationDetails({ baseline })[value]
      }
    } else if (ImageOrientation.orientationDetails({ baseline })[orientation]) {
      return {
        ...ImageOrientation.orientationDetails({ baseline })[orientation]
      }
    }

    return {
      orientation: 'square',
      height: 512,
      width: 512
    }
  }

  static dropdownOptions = ({ baseline }: { baseline?: string } = {}) => {
    const options: Array<{ value: string; label: string }> = []

    for (const key in ImageOrientation.orientationDetails({ baseline })) {
      options.push({
        value: key,
        label: ImageOrientation.orientationDetails({ baseline })[key].label
      })
    }

    options.push({ value: 'custom', label: 'Custom' })
    options.push({ value: 'random', label: 'Random!' })

    return options
  }
}

export { ImageOrientation }
