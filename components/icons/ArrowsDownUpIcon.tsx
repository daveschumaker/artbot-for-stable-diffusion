// Modified via: https://tabler-icons.io/

const ArrowsDownUpIcon = ({
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
            <path d="M17 3l0 18"></path>
            <path d="M10 18l-3 3l-3 -3"></path>
            <path d="M7 21l0 -18"></path>
            <path d="M20 6l-3 -3l-3 3"></path>
        </svg>
    )
}

export default ArrowsDownUpIcon
