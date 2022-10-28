import React, { CSSProperties } from 'react'
import Select, { OptionProps } from 'react-select'
import { useTheme } from 'styled-components'

interface Theme {
  border?: string
  cardBackground?: string
  inputBackground?: string
  inputColor?: string
}

interface SelectProps {
  name?: string
  onChange: any
  width?: string
  value?: Value
  options: Array<any>
  styles?: any
  menuPlacement?: string
  isSearchable?: boolean
}

interface Value {
  value: string | boolean
  label: string
}

const SelectComponent = (props: SelectProps) => {
  const theme: Theme = useTheme()
  const { ...rest } = props

  const customStyles = {
    container: (provided: CSSProperties) => ({
      ...provided
    }),
    control: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: theme.inputBackground,
      borderColor: theme.inputColor,
      color: theme.inputColor
    }),
    input: (provided: CSSProperties) => ({
      ...provided,
      color: theme.inputColor
    }),
    option: (provided: CSSProperties, state: OptionProps) => {
      return {
        ...provided,
        backgroundColor: state.isFocused
          ? theme.cardBackground
          : theme.inputBackground,
        color: theme.inputColor
      }
    },
    valueContainer: (provided: CSSProperties) => ({
      ...provided
    }),
    menu: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: theme.inputBackground
    }),
    indicatorsContainer: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: theme.inputBackground
    }),
    singleValue: (provided: CSSProperties) => {
      return {
        ...provided,
        color: theme.inputColor
      }
    }
  }

  return (
    <Select
      id="long-value-select"
      instanceId="long-value-select"
      {...rest}
      //@ts-ignore
      styles={customStyles}
    />
  )
}

export default SelectComponent
