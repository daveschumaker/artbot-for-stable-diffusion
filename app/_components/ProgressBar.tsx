export default function ProgressBar({ pct = 0 }: { pct: number }) {
  const progressBarStyles = {
    height: '4px',
    width: '100%'
  }

  const styledBarStyles = {
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
    width: pct ? pct + '%' : 0,
    transition: 'all 0.4s'
  }

  const bgColor = pct === 100 ? 'bg-green-500' : 'bg-blue-600'

  return (
    <div style={progressBarStyles}>
      <div className={`h-full ${bgColor}`} style={styledBarStyles}></div>
    </div>
  )
}
