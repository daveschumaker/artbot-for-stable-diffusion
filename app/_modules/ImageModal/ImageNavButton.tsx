import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import styled from 'styled-components'

interface INavButtonProps {
  action: string
}

const NextPrevButton = styled.div<INavButtonProps>`
  user-select: none;
  background-color: white;
  display: flex;
  border-radius: 50%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 75px;
  width: 75px;
  position: absolute;
  right: 8px;
  cursor: pointer;
  top: 0;
  bottom: 0;
  margin: auto 0;
  border: 1px solid black;
  box-shadow: 2px 2px 4px 1px rgba(0, 0, 0, 0.75);

  ${(props) =>
    props.action === 'NEXT'
      ? `
    right: 8px;
  `
      : 'left: 8px;'};

  &:active {
    transform: scale(0.98);
  }

  @media (min-width: 640px) {
    height: 50px;
    width: 50px;
  }
`

interface IProps {
  action: string
  handleOnClick(): void
}

const ImageNavButton = ({ action, handleOnClick = () => {} }: IProps) => {
  return (
    <NextPrevButton action={action} onClick={handleOnClick}>
      {action === 'NEXT' ? (
        <IconChevronRight stroke="#000000" />
      ) : (
        <IconChevronLeft stroke="#000000" />
      )}
    </NextPrevButton>
  )
}

export default ImageNavButton
