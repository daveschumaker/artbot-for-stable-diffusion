import { useWindowSize } from 'app/_hooks/useWindowSize'
import { useEffect, useState } from 'react'

export default function useGetColumns() {
  const size = useWindowSize()
  const [columns, setColumns] = useState(2)

  useEffect(() => {
    if (size && size.width && size?.width > 1280) {
      setColumns(4)
    } else if (size && size.width && size?.width > 800) {
      setColumns(3)
    }
  }, [size, size.width])

  return [columns]
}
