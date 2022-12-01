import styled from 'styled-components'

const StyledPageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;

  @media (min-width: 640px) {
    font-size: 24px;
  }
`

const StyledPageTitleH2 = styled.h2`
  font-size: 14px;
  font-weight: 700;

  @media (min-width: 640px) {
    font-size: 16px;
  }
`

// @ts-ignore
const PageTitle = (props) => {
  const { as, children, ...rest } = props

  const Element = as === 'h2' ? StyledPageTitleH2 : StyledPageTitle

  return (
    <Element className="mt-0 mb-2 text-teal-500" {...rest}>
      {children}
    </Element>
  )
}

export default PageTitle
