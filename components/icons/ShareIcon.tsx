// Modified via: https://tabler-icons.io/

const ShareIcon = ({
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
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="6" r="3"></circle>
      <circle cx="18" cy="18" r="3"></circle>
      <line x1="8.7" y1="10.7" x2="15.3" y2="7.3"></line>
      <line x1="8.7" y1="13.3" x2="15.3" y2="16.7"></line>
    </svg>
  )
}

export default ShareIcon
