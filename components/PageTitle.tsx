import styled from 'styled-components'

const StyledPageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;

  @media (min-width: 640px) {
    font-size: 24px;
  }
`

// @ts-ignore
const PageTitle = (props) => {
  return (
    <StyledPageTitle className="mt-0 mb-2 text-teal-500">
      {props.children}
    </StyledPageTitle>
  )
}

export default PageTitle
