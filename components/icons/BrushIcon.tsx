// Modified via: https://tabler-icons.io/

const BrushIcon = ({
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
      <path d="M3 21v-4a4 4 0 1 1 4 4h-4"></path>
      <path d="M21 3a16 16 0 0 0 -12.8 10.2"></path>
      <path d="M21 3a16 16 0 0 1 -10.2 12.8"></path>
      <path d="M10.6 9a9 9 0 0 1 4.4 4.4"></path>
    </svg>
  )
}

export default BrushIcon
