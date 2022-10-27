import React from 'react'
import Select from 'react-select'
import { useTheme } from 'styled-components'

interface Theme {
  border?: string
  cardBackground?: string
  inputBackground?: string
  inputText?: string
}

interface SelectProps {
  name?: string
  onChange: any
  width?: string
  value?: Value
  options: Array<any>
  styles?: any
  menuPlacement?: string
}

interface Value {
  value: string | boolean
  label: string
}

const SelectComponent = (props: SelectProps) => {
  const theme: Theme = useTheme()
  const { ...rest } = props

  const customStyles = {
    container: (provided: any) => ({
      ...provided,
      borderColor: theme.border
    }),
    control: (provided: any) => ({
      ...provided,
      backgroundColor: theme.inputBackground,
      color: theme.inputText
    }),
    input: (provided: any) => ({
      ...provided,
      color: theme.inputText
    }),
    option: (provided: any, state: any) => {
      return {
        ...provided,
        backgroundColor: state.isFocused
          ? theme.cardBackground
          : theme.inputBackground,
        color: theme.inputText
        // borderBottom: '1px dotted pink',
        // color: state.isSelected ? 'red' : 'blue',
        // padding: 20
      }
    },
    valueContainer: (provided: any) => ({
      ...provided
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: theme.inputBackground
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      backgroundColor: theme.inputBackground
    }),
    singleValue: (provided: any) => {
      return {
        ...provided,
        color: theme.inputText
      }
    }
  }

  return (
    <Select
      id="long-value-select"
      instanceId="long-value-select"
      {...rest}
      styles={customStyles}
    />
  )
}

export default SelectComponent
