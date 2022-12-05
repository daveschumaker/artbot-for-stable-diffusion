// Modified via: https://tabler-icons.io/

const GrainIcon = ({
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
      strokeWidth="2"
      stroke={stroke}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <circle cx="4.5" cy="9.5" r="1"></circle>
      <circle cx="9.5" cy="4.5" r="1"></circle>
      <circle cx="9.5" cy="14.5" r="1"></circle>
      <circle cx="4.5" cy="19.5" r="1"></circle>
      <circle cx="14.5" cy="9.5" r="1"></circle>
      <circle cx="19.5" cy="4.5" r="1"></circle>
      <circle cx="14.5" cy="19.5" r="1"></circle>
      <circle cx="19.5" cy="14.5" r="1"></circle>
    </svg>
  )
}

export default GrainIcon
