// Modified via: https://tabler-icons.io/

const ResizeIcon = ({
  className,
  fill = 'none',
  size = 24,
  stroke = 'currentColor',
  strokeWidth = 2
}: {
  className?: string
  fill?: string
  size?: number
  stroke?: string,
  strokeWidth?: number
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      stroke={stroke}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M4 11v8a1 1 0 0 0 1 1h8m-9 -14v-1a1 1 0 0 1 1 -1h1m5 0h2m5 0h1a1 1 0 0 1 1 1v1m0 5v2m0 5v1a1 1 0 0 1 -1 1h-1"></path>
      <path d="M4 12h7a1 1 0 0 1 1 1v7"></path>
    </svg>
  )
}

export default ResizeIcon
