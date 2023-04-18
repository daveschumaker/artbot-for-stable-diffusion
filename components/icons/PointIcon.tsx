// Modified via: https://tabler-icons.io/

const PointIcon = ({
  className,
  fill = 'none',
  size = 24,
  stroke = 'currentColor',
  style
}: {
  className?: string
  fill?: string
  size?: number
  stroke?: string
  style?: object
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
      style={style}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <circle cx="12" cy="12" r="4"></circle>
    </svg>
  )
}

export default PointIcon
