// Modified via: https://tabler-icons.io/

const AdjustmentIcon = ({
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
      <path d="M4 8h4v4h-4z"></path>
      <path d="M6 4l0 4"></path>
      <path d="M6 12l0 8"></path>
      <path d="M10 14h4v4h-4z"></path>
      <path d="M12 4l0 10"></path>
      <path d="M12 18l0 2"></path>
      <path d="M16 5h4v4h-4z"></path>
      <path d="M18 4l0 1"></path>
      <path d="M18 9l0 11"></path>
    </svg>
  )
}

export default AdjustmentIcon
