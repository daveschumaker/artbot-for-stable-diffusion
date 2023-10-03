// import { basePath } from 'BASE_PATH'
import { setHordePerformance } from 'app/_store/appStore'
import { clientHeader } from 'app/_utils/appUtils'

export const fetchHordePerformance = async () => {
  try {
    // const res = await fetch(`${basePath}/api/horde-performance`)
    const res = await fetch('https://aihorde.net/api/v2/status/performance', {
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      }
    })
    const data = (await res.json()) || {}
    // const { perfStats } = data
    const perfStats = data

    if (perfStats) {
      setHordePerformance(perfStats)
    }
  } catch (err) {}
}
