import styled from 'styled-components'

const StyledSectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;

  @media (min-width: 640px) {
    font-size: 20px;
  }
`

// @ts-ignore
const SectionTitle = (props) => {
  return (
    <StyledSectionTitle className="mt-0 mb-2 text-teal-500">
      {props.children}
    </StyledSectionTitle>
  )
}

export default SectionTitle
