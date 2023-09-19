import { basePath } from 'BASE_PATH'
import { setHordePerformance } from 'app/_store/appStore'

export const fetchHordePerformance = async () => {
  try {
    const res = await fetch(`${basePath}/api/horde-performance`)
    const data = (await res.json()) || {}
    const { perfStats } = data
    if (perfStats) {
      setHordePerformance(perfStats)
    }
  } catch (err) {}
}
