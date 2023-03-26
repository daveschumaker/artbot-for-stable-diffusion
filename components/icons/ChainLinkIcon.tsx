// Modified via: https://tabler-icons.io/

const LinkIcon = ({
    className,
    fill = 'none',
    size = 24,
    stroke = 'currentColor',
    active = false
  }: {
    className?: string
    fill?: string
    size?: number
    stroke?: string,
    active?: boolean
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
        <path d="M9 15l6 -6"></path>
        <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"></path>
        <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"></path>
        {active && (
          <>
            <path d="M17 22v-2"></path>
            <path d="M20 17h2"></path>
            <path d="M2 7h2"></path>
            <path d="M7 2v2"></path>
          </>
        )}
      </svg>
    )
  }
  
  export default LinkIcon
  