// Modified via: https://tabler-icons.io/

const SprayIcon = ({
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
      <rect x="4" y="10" width="8" height="11" rx="2"></rect>
      <path d="M6 10v-4a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v4"></path>
      <path d="M15 7h.01"></path>
      <path d="M18 9h.01"></path>
      <path d="M18 5h.01"></path>
      <path d="M21 3h.01"></path>
      <path d="M21 7h.01"></path>
      <path d="M21 11h.01"></path>
      <path d="M10 7h1"></path>
    </svg>
  )
}

export default SprayIcon
