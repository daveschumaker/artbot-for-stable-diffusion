// Modified via: https://tabler-icons.io/

const BookIcon = ({
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
      strokeWidth="1"
      stroke={stroke}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
      <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
      <path d="M3 6l0 13"></path>
      <path d="M12 6l0 13"></path>
      <path d="M21 6l0 13"></path>
    </svg>
  )
}

export default BookIcon
