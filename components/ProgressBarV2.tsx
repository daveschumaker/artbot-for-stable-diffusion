import styled from 'styled-components'

interface StyledBarProps {
  pct: number
}

const StyledBar = styled.div<StyledBarProps>`
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  width: ${(props) => (props.pct ? props.pct + '%' : 0)};
  transition: all 0.4s;
`

export default function ProgressBar({ pct = 0 }: { pct: number }) {
  let bgColor = pct === 100 ? 'bg-green-500' : 'bg-blue-600'

  return (
    <div className="h-[4px] w-full">
      <StyledBar className={`h-full ${bgColor}`} pct={pct} />
    </div>
  )
}
