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
  const { onMinusClick, onPlusClick, disabled, ...rest } = props

  const handleMinusClick = () => {
    if (Number(value) <= min || disabled) {
      return
    }

    onMinusClick()
  }

  const handlePlusClick = () => {
    if (Number(value || disabled) >= max) {
      return
    }

    onPlusClick()
  }

  const handleKeyDown = (e: any) => {
    e = e || window.event

    if (disabled) {
      return
    }

    if (e.keyCode == '38') {
      e.preventDefault()
      handlePlusClick()
    } else if (e.keyCode == '40') {
      e.preventDefault()
      handleMinusClick()
    }
  }

  return (
    <InputsWrapper>
      <MinusButton disabled={disabled} onClick={handleMinusClick}>
        <MinusIcon />
      </MinusButton>
      <StyledInput disabled={disabled} onKeyDown={handleKeyDown} {...rest} />
      <PlusButton disabled={disabled} onClick={handlePlusClick}>
        <PlusIcon />
      </PlusButton>
    </InputsWrapper>
  )
}

export default NumberInput
