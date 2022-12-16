import styled from 'styled-components'
import MinusIcon from '../icons/MinusIcon'
import PlusIcon from '../icons/PlusIcon'
import { Button } from './Button'
import Input from './Input'

const StyledInput = styled(Input)`
  border-radius: 0;
  text-align: center;
`

const MinusButton = styled(Button)`
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: 0;
`

const PlusButton = styled(Button)`
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 0;
`

const InputsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 160px;
`

const NumberInput = (props: any) => {
  const { value, max, min } = props
  const { onMinusClick, onPlusClick, ...rest } = props

  const handleMinusClick = () => {
    if (Number(value) <= min) {
      return
    }

    onMinusClick()
  }

  const handlePlusClick = () => {
    if (Number(value) >= max) {
      return
    }

    onPlusClick()
  }
  return (
    <InputsWrapper>
      <MinusButton onClick={handleMinusClick}>
        <MinusIcon />
      </MinusButton>
      <StyledInput {...rest} />
      <PlusButton onClick={handlePlusClick}>
        <PlusIcon />
      </PlusButton>
    </InputsWrapper>
  )
}

export default NumberInput
