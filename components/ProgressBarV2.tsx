import { useEffect, useState } from 'react'
import styled from 'styled-components'

const StyledBar = styled.div`
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  width: ${(props) => (props.pct ? props.pct + '%' : 0)};
  transition: all 0.4s;
`

export default function ProgressBar({ pct = 0 }: { pct: number }) {
  // const [width, setWidth] = useState(done ? 100 : 0)
  const [width, setWidth] = useState(57)
  let bgColor = pct === 100 ? 'bg-green-500' : 'bg-blue-600'

  return (
    <div className="h-[4px] w-full">
      <StyledBar className={`h-full ${bgColor}`} pct={pct} />
    </div>
  )
}
