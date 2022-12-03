const MasonryLayout = ({ children, columns = 2, gap = 20 }: any = {}) => {
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
