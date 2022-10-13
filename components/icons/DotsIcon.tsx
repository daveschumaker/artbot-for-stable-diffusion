// Modified via: https://tabler-icons.io/

const DotsIcon = ({
  className,
  size = 24,
  stroke = 'currentColor'
}: {
  className?: string
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
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <circle cx="12" cy="12" r="9"></circle>
      <line x1="8" y1="12" x2="8" y2="12.01"></line>
      <line x1="12" y1="12" x2="12" y2="12.01"></line>
      <line x1="16" y1="12" x2="16" y2="12.01"></line>
    </svg>
  )
}

export default DotsIcon
