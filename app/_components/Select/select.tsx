import { CSSProperties, useId } from 'react'
import Select, { OptionProps } from 'react-select'

import { SelectComponentProps } from '_types/artbot'

const SelectComponent = (props: SelectComponentProps) => {
  // Fixes a bunch of weird SSR related issues with react-select
  // See: https://github.com/JedWatson/react-select/issues/3590
  const id = useId()

  const { ...rest } = props

  const customStyles = {
    container: (provided: CSSProperties) => ({
      ...provided,
      width: '100%'
    }),
    control: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: props.isDisabled ? '#adadad' : `var(--input-background)`,
      borderColor: `var(--input-text)`,
      color: `var(--input-text)`,
      fontSize: '16px',
      width: '100%',
      minHeight: 'unset',
      zIndex: `var(--zIndex-default)`
    }),
    input: (provided: CSSProperties) => ({
      ...provided,
      color: `var(--input-text)`
    }),
    option: (provided: CSSProperties, state: OptionProps) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#7e5a6c' : `var(--input-background)`,
      color: `var(--input-text)`
    }),
    placeholder: (provided: CSSProperties) => ({
      ...provided,
      color: '#9299a6'
    }),
    clearIndicator: (provided: CSSProperties) => ({
      ...provided,
      height: 'calc(var(--input-element-h) - 2px)'
    }),
    dropdownIndicator: (provided: CSSProperties) => ({
      ...provided,
      color: `var(--input-text)`,
      height: 'calc(var(--input-element-h) - 2px)'
    }),
    singleValue: (provided: CSSProperties) => ({
      ...provided,
      color: `var(--input-text)`
    }),
    valueContainer: (provided: CSSProperties) => ({
      ...provided,
      color: `var(--input-text)`
    }),
    menu: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: `var(--input-background)`,
      color: `var(--input-text)`,
      marginBottom: '16px',
      zIndex: `var(--zIndex-overBase)`
    }),
    indicatorsContainer: (provided: CSSProperties) => ({
      ...provided,
      height: 'calc(var(--input-element-h) - 2px)'
      // backgroundColor: theme.inputBackground
    })
  }

  return (
    <Select
      id={id}
      instanceId={id}
      classNamePrefix="select"
      closeMenuOnSelect={props.isMulti ? false : true}
      {...rest}
      //@ts-ignore
      styles={customStyles}
      placeholder="Select..."
      // menuIsOpen
    />
  )
}

export default SelectComponent
