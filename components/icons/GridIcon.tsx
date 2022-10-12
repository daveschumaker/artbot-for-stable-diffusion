// Modified via: https://tabler-icons.io/

const GridIcon = ({
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
      <rect x="4" y="4" width="6" height="6" rx="1"></rect>
      <rect x="14" y="4" width="6" height="6" rx="1"></rect>
      <rect x="4" y="14" width="6" height="6" rx="1"></rect>
      <rect x="14" y="14" width="6" height="6" rx="1"></rect>
    </svg>
  )
}

export default GridIcon
