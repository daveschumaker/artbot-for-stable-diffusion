import { useState } from 'react'
import { useStore } from 'statery'
import { modelStore } from 'app/_store/modelStore'

export const useBaselineDetails = (inputModels: string[]) => {
  const [baselineLoaded, setBaselineLoaded] = useState(false)
  const { modelDetails } = useStore(modelStore)
  let baseline = ''

  if (modelDetails[inputModels[0]]) {
    baseline = modelDetails[inputModels[0]].baseline
  }

  return {
    baseline,
    baselineLoaded,
    setBaselineLoaded
  }
}
