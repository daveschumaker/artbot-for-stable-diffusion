// Modified via: https://tabler-icons.io/

const HistoryIcon = ({
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
      <polyline points="12 8 12 12 14 14"></polyline>
      <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path>
    </svg>
  )
}

export default HistoryIcon
