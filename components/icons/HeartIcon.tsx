// Modified via: https://tabler-icons.io/

const HeartIcon = ({
  className,
  fill = 'none',
  size = 24,
  stroke = 'currentColor',
  shadow = false,
  width = 1
}: {
  className?: string
  fill?: string
  size?: number
  stroke?: string
  shadow?: boolean
  width?: number
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      strokeWidth={width}
      stroke={stroke}
      fill={fill}
      filter={shadow ? 'drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4))' : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"></path>
    </svg>
  )
}

export default HeartIcon
