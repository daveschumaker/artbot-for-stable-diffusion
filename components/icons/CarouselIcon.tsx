const CarouselIcon = ({
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
      viewBox="0 0 21 21"
      strokeWidth="1"
    >
      <g
        fill="none"
        fillRule="evenodd"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(2 5)"
      >
        <path d="m12.5.5h-8.00000001c-1.1045695 0-2 .8954305-2 2v6c0 1.1045695.8954305 2 2 2h8.00000001c1.1045695 0 2-.8954305 2-2v-6c0-1.1045695-.8954305-2-2-2z" />
        <path d="m16.5.5v10" />
        <path d="m.5.5v10" />
      </g>
    </svg>
  )
}

export default CarouselIcon
