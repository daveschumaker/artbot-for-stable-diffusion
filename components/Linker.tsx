import styled from 'styled-components'
import Link from 'next/link'

const StyledLink = styled(Link)`
  color: ${(props) => props.theme.link};

  &:hover {
    color: ${(props) => props.theme.linkActive};
  }
`

const Linker = (props: any) => {
  return <StyledLink {...props} />
}

export default Linker
