// Modified via: https://tabler-icons.io/

const RulerIcon = ({
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
      strokeWidth="1.25"
      stroke={stroke}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M5 4h14a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1h-7a1 1 0 0 0 -1 1v7a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1"></path>
      <path d="M4 8l2 0"></path>
      <path d="M4 12l3 0"></path>
      <path d="M4 16l2 0"></path>
      <path d="M8 4l0 2"></path>
      <path d="M12 4l0 3"></path>
      <path d="M16 4l0 2"></path>
    </svg>
  )
}

export default RulerIcon
