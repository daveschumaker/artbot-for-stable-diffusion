// Modified via: https://tabler-icons.io/

const WallIcon = ({
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
      <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
      <path d="M4 8h16"></path>
      <path d="M20 12h-16"></path>
      <path d="M4 16h16"></path>
      <path d="M9 4v4"></path>
      <path d="M14 8v4"></path>
      <path d="M8 12v4"></path>
      <path d="M16 12v4"></path>
      <path d="M11 16v4"></path>
    </svg>
  )
}

export default WallIcon
