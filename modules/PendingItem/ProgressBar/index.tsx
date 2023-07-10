export default function ProgressBar({ pct = 0 }: { pct: number }) {
  let bgColor = pct === 100 ? 'bg-green-500' : 'bg-blue-600'

  return (
    <div className="h-[4px] w-full">
      <div
        className={`h-full ${bgColor}`}
        style={{
          borderBottomLeftRadius: '4px',
          borderBottomRightRadius: '4px',
          transition: 'all 0.4s',
          width: pct ? pct + '%' : 0
        }}
      />
    </div>
  )
}
