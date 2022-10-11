import { useEffect, useState } from 'react'

export default function ProgressBar({
  done = false,
  time
}: {
  done?: boolean
  time?: number
}) {
  const [width, setWidth] = useState(done ? 100 : 0)

  useEffect(() => {
    if (!time) {
      return
    }

    const pctPerSecond = 100 / time
    let count = 0
    const intervalId = setInterval(() => {
      if (done) {
        setWidth(100)
        return
      }

      // Hacky method to show that an image is still waiting to be generated
      // if we haven't seen a server response as of yet. Pauses the progress
      // bar at 95%
      if (count * pctPerSecond >= 95) {
        setWidth(95)
        clearInterval(intervalId)
        return
      }

      if (count * pctPerSecond >= 100) {
        setWidth(100)
        clearInterval(intervalId)
        return
      }

      setWidth(count * pctPerSecond)
      count++
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [done, time])

  let bgColor = done ? 'bg-green-500' : 'bg-blue-600'

  return (
    <div className="bg-white border-solid border-[1px] h-[10px] rounded-md border-slate-600 w-full">
      <div className={`h-full ${bgColor}`} style={{ width: width + '%' }} />
    </div>
  )
}
