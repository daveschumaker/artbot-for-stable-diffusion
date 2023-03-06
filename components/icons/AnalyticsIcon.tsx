// Modified via: https://tabler-icons.io/

const AnalyticsIcon = ({
  className,
  fill = 'none',
  size = 24,
  stroke = 'currentColor'
}: {
  className?: string
  fill?: string
  size?: number
  stroke?: string
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      strokeWidth="1"
      stroke={stroke}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M3 4m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"></path>
      <path d="M7 20h10"></path>
      <path d="M9 16v4"></path>
      <path d="M15 16v4"></path>
      <path d="M9 12v-4"></path>
      <path d="M12 12v-1"></path>
      <path d="M15 12v-2"></path>
      <path d="M12 12v-1"></path>
    </svg>
  )
}

export default AnalyticsIcon
