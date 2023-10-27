import { useState, useCallback } from 'react'

export const useAspectRatio = (initialWidth: number, initialHeight: number) => {
  const [keepAspectRatio, setKeepAspectRatio] = useState(false)
  const [targetAspectRatio, setTargetAspectRatio] = useState(0)

  const getCurrentAspectRatio = useCallback(
    () => initialWidth / initialHeight,
    [initialWidth, initialHeight]
  )

  const toggleKeepAspectRatio = (value?: boolean) => {
    if (value === true || value === false) {
      if (value) setTargetAspectRatio(getCurrentAspectRatio())
      setKeepAspectRatio(value)
    } else if (!keepAspectRatio) {
      setTargetAspectRatio(getCurrentAspectRatio())
    } else {
      setTargetAspectRatio(0)
    }
    setKeepAspectRatio(!keepAspectRatio)
  }

  const getAspectRatioDeviation = () => {
    if (!keepAspectRatio) {
      return 0
    }
    const currentAspectRatio = initialWidth / initialHeight
    const aspectRatioRatio =
      Math.max(currentAspectRatio, targetAspectRatio) /
      Math.min(currentAspectRatio, targetAspectRatio)

    return Math.abs(aspectRatioRatio - 1)
  }

  const getAspectRatioDeviationColor = (deviation: number) => {
    if (deviation > 0.25) return 'text-red-500'
    if (deviation > 0.15) return 'text-amber-500'
    return 'text-gray-500'
  }

  return {
    keepAspectRatio,
    toggleKeepAspectRatio,
    getAspectRatioDeviation,
    getAspectRatioDeviationColor
  }
}
