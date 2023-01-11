import styled from 'styled-components'
import ChevronLeftIcon from '../icons/ChevronLeftIcon'
import ChevronRightIcon from '../icons/ChevronRightIcon'

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
  height: 50px;
  width: 50px;
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
`

interface IProps {
  action: string
  fetchImageDetails(action: string, id: number): void
  id: number
}

const ImageNavButton = ({ action, fetchImageDetails, id }: IProps) => {
  return (
    <NextPrevButton
      action={action}
      onClick={() => {
        if (action === 'NEXT') {
          fetchImageDetails('next', id)
        } else {
          fetchImageDetails('prev', id)
        }
      }}
    >
      {action === 'NEXT' ? (
        <ChevronRightIcon stroke="#000000" />
      ) : (
        <ChevronLeftIcon stroke="#000000" />
      )}
    </NextPrevButton>
  )
}

export default ImageNavButton
