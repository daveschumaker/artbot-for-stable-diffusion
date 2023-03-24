// Modified via: https://tabler-icons.io/

const PlaylistXIcon = ({
  className,
  fill = 'none',
  size = 24,
  stroke = 'currentColor',
  hideCross = false
}: {
  className?: string
  fill?: string
  size?: number
  stroke?: string
  hideCross?: boolean
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke={stroke}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      {hideCross && (
        <>
          <path d="M19 8h-14"></path>
          <path d="M5 12h14"></path>
          <path d="M19 16h-14"></path>
        </>
      )}
      {!hideCross && (
        <>
          <path d="M19 8h-14"></path>
          <path d="M5 12h7"></path>
          <path d="M12 16h-7"></path>
          <path d="M16 14l4 4"></path>
          <path d="M20 14l-4 4"></path>
        </>
      )}

    </svg>
  )
}

export default PlaylistXIcon
