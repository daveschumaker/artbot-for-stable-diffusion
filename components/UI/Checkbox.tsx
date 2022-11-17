import styled from 'styled-components'

interface Props {
  label: string
  value: boolean
  onChange(): void
}

const Label = styled.label`
  font-size: 14px;
`

const Input = styled.input`
  margin-right: 8px;
`

const Checkbox = ({ label, value, onChange }: Props) => {
  return (
    <Label>
      <Input type="checkbox" checked={value} onChange={onChange} />
      {label}
    </Label>
  )
}

export default Checkbox
