// Modified via: https://tabler-icons.io/

const ArrowBarLeftIcon = ({
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
      <path d="M4 12l10 0"></path>
      <path d="M4 12l4 4"></path>
      <path d="M4 12l4 -4"></path>
      <path d="M20 4l0 16"></path>
    </svg>
  )
}

export default ArrowBarLeftIcon
