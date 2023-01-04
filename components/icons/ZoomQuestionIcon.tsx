// Modified via: https://tabler-icons.io/

const ZoomQuestionIcon = ({
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
      <circle cx="10" cy="10" r="7"></circle>
      <path d="M21 21l-6 -6"></path>
      <line x1="10" y1="13" x2="10" y2="13.01"></line>
      <path d="M10 10a1.5 1.5 0 1 0 -1.14 -2.474"></path>
    </svg>
  )
}

export default ZoomQuestionIcon
