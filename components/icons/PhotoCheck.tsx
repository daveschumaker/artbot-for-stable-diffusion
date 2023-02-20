// Modified via: https://tabler-icons.io/

const PhotoCheck = ({
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
      <path d="M15 8h.01"></path>
      <path d="M11 20h-4a3 3 0 0 1 -3 -3v-10a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v6"></path>
      <path d="M4 15l4 -4c.928 -.893 2.072 -.893 3 0l4 4"></path>
      <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0"></path>
      <path d="M15 19l2 2l4 -4"></path>
    </svg>
  )
}

export default PhotoCheck
