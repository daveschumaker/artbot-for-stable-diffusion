import styled from 'styled-components'

interface Props {
  label: string
  value: boolean
  onChange(): void
}

const CheckBox = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
`

interface ILabel {
  checked: boolean
}

const Label = styled.label<ILabel>`
  position: relative;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  height: 22px;
  color: ${(props) => props.theme.text};

  &:before {
    background-color: rgb(1, 171, 171);
    border-color: rgb(1, 171, 171);
    border-radius: 2px;
    border-style: solid;
    border-width: 1px;
    box-shadow: none;
    content: ' ';
    display: inline-block;
    height: 20px;
    margin-right: 8px;
    vertical-align: middle;
    width: 20px;
  }

  ${(props) =>
    props.checked &&
    `
    &:after {
      align-items: center;
      background-color: transparent;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJNMTczLjg5OCA0MzkuNDA0bC0xNjYuNC0xNjYuNGMtOS45OTctOS45OTctOS45OTctMjYuMjA2IDAtMzYuMjA0bDM2LjIwMy0zNi4yMDRjOS45OTctOS45OTggMjYuMjA3LTkuOTk4IDM2LjIwNCAwTDE5MiAzMTIuNjkgNDMyLjA5NSA3Mi41OTZjOS45OTctOS45OTcgMjYuMjA3LTkuOTk3IDM2LjIwNCAwbDM2LjIwMyAzNi4yMDRjOS45OTcgOS45OTcgOS45OTcgMjYuMjA2IDAgMzYuMjA0bC0yOTQuNCAyOTQuNDAxYy05Ljk5OCA5Ljk5Ny0yNi4yMDcgOS45OTctMzYuMjA0LS4wMDF6Ii8+PC9zdmc+');
      background-position: center center;
      background-repeat: no-repeat;
      background-size: 12px 12px;
      content: ' ';
      display: flex;
      font-size: 10px;
      height: 22px;
      justify-content: center;
      left: 0px;
      margin-left: 0px;
      margin-right: 8px;
      position: absolute;
      text-align: center;
      top: 0px;
      width: 22px;
    }
  `};
`

const Input = styled.input`
  /* margin-right: 8px;
   */

  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  height: 1px;
  width: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
`

const Checkbox = ({ label, value, onChange }: Props) => {
  return (
    <CheckBox>
      <Label checked={value}>
        <Input type="checkbox" checked={value} onChange={onChange} />
        {label}
      </Label>
    </CheckBox>
  )
}

export default Checkbox
