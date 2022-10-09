import { useEffect, useState } from 'react'

export default function ProgressBar({ done = false, time = 5 }) {
  const [width, setWidth] = useState(done ? 100 : 0)

  useEffect(() => {
    const pctPerSecond = 100 / time
    let count = 0
    const intervalId = setInterval(() => {
      if (done) {
        setWidth(100)
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
