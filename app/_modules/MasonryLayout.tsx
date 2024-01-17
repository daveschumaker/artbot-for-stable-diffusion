'use client'

import { useWindowSize } from 'app/_hooks/useWindowSize'

const MasonryLayout = ({ children, gap = 20 }: any = {}) => {
  const { width } = useWindowSize()

  let columns = 2
  // @ts-ignore
  if (width > 1900) {
    columns = 7
    // @ts-ignore
  } else if (width > 1700) {
    columns = 6
    // @ts-ignore
  } else if (width > 1500) {
    columns = 5
    // @ts-ignore
  } else if (width > 1200) {
    columns = 4
    // @ts-ignore
  } else if (width > 1000) {
    columns = 3
    // @ts-ignore
  } else if (width > 800) {
    columns = 2
  }

  if (!width) return null

  const columnWrapper: any = {}
  const result = []

  // create columns
  for (let i = 0; i < columns; i++) {
    columnWrapper[`column${i}`] = []
  }

  // divide children into columns
  for (let i = 0; i < children.length; i++) {
    const columnIndex = i % columns
    columnWrapper[`column${columnIndex}`].push(
      <div
        style={{ marginBottom: `${gap}px` }}
        key={`image_${i}_col_${columnIndex}`}
      >
        {children[i]}
      </div>
    )
  }

  // wrap children in each column with a div
  for (let i = 0; i < columns; i++) {
    result.push(
      <div
        style={{
          marginLeft: `${i > 0 ? gap : 0}px`,
          flex: 1
        }}
        key={`col_${i}`}
        className="is_col"
      >
        {columnWrapper[`column${i}`]}
      </div>
    )
  }

  return <div style={{ display: 'flex' }}>{result}</div>
}

export default MasonryLayout
