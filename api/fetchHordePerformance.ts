import { setHordePerformance } from '../store/appStore'

export const fetchHordePerformance = async () => {
  try {
    const res = await fetch(`/artbot/api/horde-performance`)
    const data = (await res.json()) || {}
    const { perfStats } = data
    if (perfStats) {
      setHordePerformance(perfStats)
    }
  } catch (err) {}
}
