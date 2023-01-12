import styled from 'styled-components'
import Link from 'next/link'

const StyledLink = styled(Link)`
  color: ${(props) => props.theme.link};
  font-weight: 600;

  &:hover {
    color: ${(props) => props.theme.linkActive};
  }
`

const Linker = (props: any) => {
  const { disableLinkClick = false, onClick = () => {}, ...rest } = props

  const handleClick = (e: any) => {
    // Handle scenario where we want to have a link available for middle click / open new tab,
    // but we want the normal left click event to do something else.
    if (disableLinkClick) {
      e.preventDefault()
      e.stopPropagation()
    }

    onClick()
  }

  return <StyledLink {...rest} onClick={handleClick} />
}

export default Linker
